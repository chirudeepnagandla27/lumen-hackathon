const { v4: uuidv4 } = require('uuid');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Discount = require('../models/Discount');
const AuditLog = require('../models/AuditLog');

const subscriptionController = {
  // Get user's subscriptions
  getUserSubscriptions: async (req, res) => {
    try {
      const { userId } = req.user;
      const { status, active = 'true' } = req.query;

      const query = { userId };
      if (status) query.status = status;
      if (active === 'true') query.status = { $in: ['active', 'pending'] };

      const subscriptions = await Subscription.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // Populate plan details
      for (let subscription of subscriptions) {
        const plan = await Plan.findOne({ planId: subscription.planId }).lean();
        subscription.plan = plan;
      }

      res.json({
        success: true,
        data: subscriptions,
        count: subscriptions.length
      });

    } catch (error) {
      console.error('Get user subscriptions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscriptions',
        error: error.message
      });
    }
  },

  // Get subscription by ID
  getSubscriptionById: async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { userId, role } = req.user;

      const query = { subscriptionId };
      if (role !== 'admin') {
        query.userId = userId; // Regular users can only see their own subscriptions
      }

      const subscription = await Subscription.findOne(query).lean();
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Populate plan details
      const plan = await Plan.findOne({ planId: subscription.planId }).lean();
      subscription.plan = plan;

      res.json({
        success: true,
        data: subscription
      });

    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription',
        error: error.message
      });
    }
  },

  // Create new subscription
  createSubscription: async (req, res) => {
    try {
      const { planId, billingCycle = 'monthly', discountCode } = req.body;
      const { userId } = req.user;

      // Check if plan exists
      const plan = await Plan.findOne({ planId, 'availability.isActive': true });
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found or inactive'
        });
      }

      // Calculate pricing
      let basePrice = billingCycle === 'annual' ? plan.pricing.annual || plan.pricing.monthly * 12 : plan.pricing.monthly;
      let discountAmount = 0;
      let appliedDiscounts = [];

      // Apply discount if provided
      if (discountCode) {
        const discount = await Discount.findOne({ 
          code: discountCode.toUpperCase(),
          status: 'active'
        });

        if (discount && discount.isValid) {
          // Check if user can use this discount
          const userUsage = discount.usage.usageByUser.find(u => u.userId === userId);
          const canUse = !userUsage || userUsage.usedCount < discount.conditions.maxUsagePerUser;

          if (canUse) {
            // Check plan eligibility
            const planEligible = discount.conditions.applicablePlans.length === 0 || 
                               discount.conditions.applicablePlans.includes(planId) ||
                               discount.conditions.applicablePlanTypes.includes(plan.type);

            if (planEligible && basePrice >= discount.conditions.minimumPlanPrice) {
              discountAmount = discount.calculateDiscount(basePrice);
              appliedDiscounts.push({
                discountId: discount.discountId,
                discountAmount,
                discountType: discount.type,
                appliedAt: new Date()
              });

              // Update discount usage
              if (userUsage) {
                userUsage.usedCount += 1;
                userUsage.lastUsed = new Date();
              } else {
                discount.usage.usageByUser.push({
                  userId,
                  usedCount: 1,
                  lastUsed: new Date()
                });
              }
              discount.usage.totalUsed += 1;
              await discount.save();
            }
          }
        }
      }

      const finalPrice = Math.max(0, basePrice - discountAmount);

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (billingCycle === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const subscriptionId = uuidv4();

      const subscription = new Subscription({
        subscriptionId,
        userId,
        planId,
        status: 'active',
        billingCycle,
        pricing: {
          basePrice,
          discountAmount,
          finalPrice,
          currency: plan.pricing.currency
        },
        dates: {
          startDate,
          endDate,
          nextBillingDate: endDate
        },
        usage: {
          dataQuotaLimit: plan.features.dataQuota.amount
        },
        discounts: appliedDiscounts
      });

      await subscription.save();

      // Create audit log
      await AuditLog.createLog({
        userId,
        action: 'subscription_created',
        entityType: 'subscription',
        entityId: subscriptionId,
        description: `Subscription created for plan: ${plan.name}`,
        changes: {
          after: subscription.toObject()
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: {
          ...subscription.toObject(),
          plan
        }
      });

    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: error.message
      });
    }
  },

  // Update subscription (upgrade/downgrade)
  updateSubscription: async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { planId, billingCycle, autoRenew } = req.body;
      const { userId, role } = req.user;

      const query = { subscriptionId };
      if (role !== 'admin') {
        query.userId = userId;
      }

      const subscription = await Subscription.findOne(query);
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      const beforeUpdate = { ...subscription.toObject() };
      let actionType = 'subscription_updated';

      // If changing plan, handle upgrade/downgrade
      if (planId && planId !== subscription.planId) {
        const newPlan = await Plan.findOne({ planId, 'availability.isActive': true });
        if (!newPlan) {
          return res.status(404).json({
            success: false,
            message: 'New plan not found or inactive'
          });
        }

        const oldPlan = await Plan.findOne({ planId: subscription.planId });
        const isUpgrade = newPlan.pricing.monthly > oldPlan.pricing.monthly;
        actionType = isUpgrade ? 'subscription_upgraded' : 'subscription_downgraded';

        subscription.planId = planId;
        subscription.usage.dataQuotaLimit = newPlan.features.dataQuota.amount;
        
        // Recalculate pricing for new plan
        const newBasePrice = billingCycle === 'annual' ? 
          newPlan.pricing.annual || newPlan.pricing.monthly * 12 : 
          newPlan.pricing.monthly;
        
        subscription.pricing.basePrice = newBasePrice;
        subscription.pricing.finalPrice = newBasePrice - subscription.pricing.discountAmount;
      }

      // Update other fields
      if (billingCycle) subscription.billingCycle = billingCycle;
      if (autoRenew !== undefined) subscription.autoRenew = autoRenew;

      await subscription.save();

      // Create audit log
      await AuditLog.createLog({
        userId,
        action: actionType,
        entityType: 'subscription',
        entityId: subscriptionId,
        description: `Subscription ${actionType.split('_')[1]}`,
        changes: {
          before: beforeUpdate,
          after: subscription.toObject()
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: subscription
      });

    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update subscription',
        error: error.message
      });
    }
  },

  // Cancel subscription
  cancelSubscription: async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { userId, role } = req.user;

      const query = { subscriptionId };
      if (role !== 'admin') {
        query.userId = userId;
      }

      const subscription = await Subscription.findOne(query);
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      if (subscription.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Subscription is already cancelled'
        });
      }

      const beforeUpdate = { ...subscription.toObject() };

      subscription.status = 'cancelled';
      subscription.dates.cancellationDate = new Date();
      subscription.autoRenew = false;

      await subscription.save();

      // Create audit log
      await AuditLog.createLog({
        userId,
        action: 'subscription_cancelled',
        entityType: 'subscription',
        entityId: subscriptionId,
        description: 'Subscription cancelled',
        changes: {
          before: beforeUpdate,
          after: subscription.toObject()
        },
        severity: 'medium',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: subscription
      });

    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription',
        error: error.message
      });
    }
  },

  // Renew subscription
  renewSubscription: async (req, res) => {
    try {
      const { subscriptionId } = req.params;
      const { userId, role } = req.user;

      const query = { subscriptionId };
      if (role !== 'admin') {
        query.userId = userId;
      }

      const subscription = await Subscription.findOne(query);
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      const beforeUpdate = { ...subscription.toObject() };

      // Calculate new end date
      const newEndDate = new Date(subscription.dates.endDate);
      if (subscription.billingCycle === 'annual') {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      } else {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      }

      subscription.status = 'active';
      subscription.dates.endDate = newEndDate;
      subscription.dates.nextBillingDate = newEndDate;
      subscription.dates.lastRenewalDate = new Date();

      // Reset monthly usage
      subscription.usage.lastMonthUsage = subscription.usage.currentMonthUsage;
      subscription.usage.currentMonthUsage = 0;

      await subscription.save();

      // Create audit log
      await AuditLog.createLog({
        userId,
        action: 'subscription_renewed',
        entityType: 'subscription',
        entityId: subscriptionId,
        description: 'Subscription renewed',
        changes: {
          before: beforeUpdate,
          after: subscription.toObject()
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: 'Subscription renewed successfully',
        data: subscription
      });

    } catch (error) {
      console.error('Renew subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to renew subscription',
        error: error.message
      });
    }
  }
};

module.exports = subscriptionController;
