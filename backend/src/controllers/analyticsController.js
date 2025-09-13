const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const analyticsController = {
  // Get public dashboard overview stats (no auth required)
  getPublicDashboardStats: async (req, res) => {
    try {
      // Public stats that don't require authentication
      const [
        totalUsers,
        totalActiveSubscriptions,
        totalPlans,
        totalSubscriptions
      ] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Subscription.countDocuments({ status: 'active' }),
        Plan.countDocuments({ 'availability.isActive': true }),
        Subscription.countDocuments()
      ]);

      const stats = {
        totalUsers,
        activeSubscriptions: totalActiveSubscriptions,
        totalPlans,
        monthlyRevenue: 25000, // Mock data
        churnRate: 5.2, // Mock data
        averageRevenue: totalUsers > 0 ? (25000 / totalUsers).toFixed(2) : 0
      };

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Public dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: error.message
      });
    }
  },

  // Get dashboard overview stats
  getDashboardStats: async (req, res) => {
    try {
      const { role, userId } = req.user;
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentYear = new Date(now.getFullYear(), 0, 1);

      let stats = {};

      if (role === 'admin') {
        // Admin dashboard stats
        const [
          totalUsers,
          totalActiveSubscriptions,
          totalPlans,
          monthlyRevenue,
          yearlyRevenue,
          newSubscriptionsThisMonth,
          cancelledSubscriptionsThisMonth
        ] = await Promise.all([
          User.countDocuments({ isActive: true }),
          Subscription.countDocuments({ status: 'active' }),
          Plan.countDocuments({ 'availability.isActive': true }),
          Subscription.aggregate([
            { $match: { createdAt: { $gte: currentMonth }, status: 'active' } },
            { $group: { _id: null, total: { $sum: '$pricing.finalPrice' } } }
          ]),
          Subscription.aggregate([
            { $match: { createdAt: { $gte: currentYear }, status: 'active' } },
            { $group: { _id: null, total: { $sum: '$pricing.finalPrice' } } }
          ]),
          Subscription.countDocuments({
            createdAt: { $gte: currentMonth },
            status: 'active'
          }),
          Subscription.countDocuments({
            'dates.cancellationDate': { $gte: currentMonth },
            status: 'cancelled'
          })
        ]);

        stats = {
          totalUsers,
          totalActiveSubscriptions,
          totalPlans,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          yearlyRevenue: yearlyRevenue[0]?.total || 0,
          newSubscriptionsThisMonth,
          cancelledSubscriptionsThisMonth,
          churnRate: totalActiveSubscriptions > 0 ? 
            ((cancelledSubscriptionsThisMonth / totalActiveSubscriptions) * 100).toFixed(2) : 0
        };

      } else {
        // User dashboard stats
        const [
          userSubscriptions,
          activeSubscriptions,
          totalSpent,
          expiringSubscriptions
        ] = await Promise.all([
          Subscription.countDocuments({ userId }),
          Subscription.countDocuments({ userId, status: 'active' }),
          Subscription.aggregate([
            { $match: { userId, status: { $in: ['active', 'cancelled', 'expired'] } } },
            { $group: { _id: null, total: { $sum: '$pricing.finalPrice' } } }
          ]),
          Subscription.countDocuments({
            userId,
            status: 'active',
            'dates.endDate': { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
          })
        ]);

        stats = {
          userSubscriptions,
          activeSubscriptions,
          totalSpent: totalSpent[0]?.total || 0,
          expiringSubscriptions
        };
      }

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard stats',
        error: error.message
      });
    }
  },

  // Get popular plans analytics
  getPopularPlans: async (req, res) => {
    try {
      const { period = '30' } = req.query; // days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const popularPlans = await Subscription.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['active', 'cancelled', 'expired'] }
          }
        },
        {
          $group: {
            _id: '$planId',
            subscriptionCount: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalRevenue: { $sum: '$pricing.finalPrice' },
            avgPrice: { $avg: '$pricing.finalPrice' }
          }
        },
        { $sort: { subscriptionCount: -1 } },
        { $limit: 10 }
      ]);

      // Populate plan details
      for (let planStat of popularPlans) {
        const plan = await Plan.findOne({ planId: planStat._id }).lean();
        planStat.plan = plan;
      }

      res.json({
        success: true,
        data: popularPlans
      });

    } catch (error) {
      console.error('Popular plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch popular plans',
        error: error.message
      });
    }
  },

  // Get subscription trends
  getSubscriptionTrends: async (req, res) => {
    try {
      const { period = '12' } = req.query; // months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(period));

      const trends = await Subscription.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              status: '$status'
            },
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.finalPrice' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Format the data for frontend consumption
      const formattedTrends = trends.reduce((acc, trend) => {
        const key = `${trend._id.year}-${trend._id.month.toString().padStart(2, '0')}`;
        if (!acc[key]) {
          acc[key] = {
            period: key,
            active: 0,
            cancelled: 0,
            expired: 0,
            total: 0,
            revenue: 0
          };
        }
        
        acc[key][trend._id.status] = trend.count;
        acc[key].total += trend.count;
        acc[key].revenue += trend.revenue;
        
        return acc;
      }, {});

      res.json({
        success: true,
        data: Object.values(formattedTrends)
      });

    } catch (error) {
      console.error('Subscription trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription trends',
        error: error.message
      });
    }
  },

  // Get usage analytics (for users)
  getUsageAnalytics: async (req, res) => {
    try {
      const { userId } = req.user;

      const subscriptions = await Subscription.find({
        userId,
        status: { $in: ['active', 'expired', 'cancelled'] }
      })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

      // Populate plan details and calculate usage percentages
      for (let subscription of subscriptions) {
        const plan = await Plan.findOne({ planId: subscription.planId }).lean();
        subscription.plan = plan;
        subscription.currentUsagePercentage = subscription.usage.dataQuotaLimit > 0 ? 
          Math.round((subscription.usage.currentMonthUsage / subscription.usage.dataQuotaLimit) * 100) : 0;
        subscription.avgUsagePercentage = subscription.usage.dataQuotaLimit > 0 ? 
          Math.round((subscription.usage.averageMonthlyUsage / subscription.usage.dataQuotaLimit) * 100) : 0;
      }

      res.json({
        success: true,
        data: subscriptions
      });

    } catch (error) {
      console.error('Usage analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch usage analytics',
        error: error.message
      });
    }
  },

  // Get revenue analytics (Admin only)
  getRevenueAnalytics: async (req, res) => {
    try {
      const { period = '12' } = req.query; // months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(period));

      const [monthlyRevenue, planRevenue, totalStats] = await Promise.all([
        // Monthly revenue breakdown
        Subscription.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
              status: { $in: ['active', 'cancelled', 'expired'] }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              revenue: { $sum: '$pricing.finalPrice' },
              subscriptions: { $sum: 1 },
              avgRevenue: { $avg: '$pricing.finalPrice' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        
        // Revenue by plan type
        Subscription.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
              status: { $in: ['active', 'cancelled', 'expired'] }
            }
          },
          {
            $group: {
              _id: '$planId',
              revenue: { $sum: '$pricing.finalPrice' },
              subscriptions: { $sum: 1 }
            }
          },
          { $sort: { revenue: -1 } }
        ]),

        // Total stats
        Subscription.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
              status: { $in: ['active', 'cancelled', 'expired'] }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$pricing.finalPrice' },
              totalSubscriptions: { $sum: 1 },
              avgSubscriptionValue: { $avg: '$pricing.finalPrice' }
            }
          }
        ])
      ]);

      // Populate plan details for plan revenue
      for (let planRev of planRevenue) {
        const plan = await Plan.findOne({ planId: planRev._id }).lean();
        planRev.plan = plan;
      }

      res.json({
        success: true,
        data: {
          monthlyRevenue,
          planRevenue,
          totalStats: totalStats[0] || {
            totalRevenue: 0,
            totalSubscriptions: 0,
            avgSubscriptionValue: 0
          }
        }
      });

    } catch (error) {
      console.error('Revenue analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue analytics',
        error: error.message
      });
    }
  }
};

module.exports = analyticsController;
