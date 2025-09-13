const { v4: uuidv4 } = require('uuid');
const Plan = require('../models/Plan');
const AuditLog = require('../models/AuditLog');

const planController = {
  // Get all active plans
  getAllPlans: async (req, res) => {
    try {
      const { type, category, active = 'true' } = req.query;
      
      const query = {};
      if (type) query.type = type;
      if (category) query.category = category;
      if (active === 'true') query['availability.isActive'] = true;

      const plans = await Plan.find(query)
        .sort({ popularityScore: -1, 'pricing.monthly': 1 })
        .lean();

      res.json({
        success: true,
        data: plans,
        count: plans.length
      });

    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch plans',
        error: error.message
      });
    }
  },

  // Get plan by ID
  getPlanById: async (req, res) => {
    try {
      const { planId } = req.params;
      
      const plan = await Plan.findOne({ planId }).lean();
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      res.json({
        success: true,
        data: plan
      });

    } catch (error) {
      console.error('Get plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch plan',
        error: error.message
      });
    }
  },

  // Create new plan (Admin only)
  createPlan: async (req, res) => {
    try {
      const planData = req.body;
      const planId = uuidv4();

      const plan = new Plan({
        planId,
        ...planData
      });

      await plan.save();

      // Create audit log
      await AuditLog.createLog({
        userId: req.user.userId,
        action: 'plan_created',
        entityType: 'plan',
        entityId: planId,
        description: `Plan created: ${plan.name}`,
        changes: {
          after: plan.toObject()
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.status(201).json({
        success: true,
        message: 'Plan created successfully',
        data: plan
      });

    } catch (error) {
      console.error('Create plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create plan',
        error: error.message
      });
    }
  },

  // Update plan (Admin only)
  updatePlan: async (req, res) => {
    try {
      const { planId } = req.params;
      const updateData = req.body;

      const plan = await Plan.findOne({ planId });
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      const beforeUpdate = { ...plan.toObject() };

      // Update plan
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          plan[key] = updateData[key];
        }
      });

      await plan.save();

      // Create audit log
      await AuditLog.createLog({
        userId: req.user.userId,
        action: 'plan_updated',
        entityType: 'plan',
        entityId: planId,
        description: `Plan updated: ${plan.name}`,
        changes: {
          before: beforeUpdate,
          after: plan.toObject()
        },
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: 'Plan updated successfully',
        data: plan
      });

    } catch (error) {
      console.error('Update plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update plan',
        error: error.message
      });
    }
  },

  // Delete plan (Admin only)
  deletePlan: async (req, res) => {
    try {
      const { planId } = req.params;

      const plan = await Plan.findOne({ planId });
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      // Soft delete - mark as inactive instead of actually deleting
      plan.availability.isActive = false;
      await plan.save();

      // Create audit log
      await AuditLog.createLog({
        userId: req.user.userId,
        action: 'plan_deleted',
        entityType: 'plan',
        entityId: planId,
        description: `Plan deleted: ${plan.name}`,
        severity: 'medium',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: 'Plan deleted successfully'
      });

    } catch (error) {
      console.error('Delete plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete plan',
        error: error.message
      });
    }
  },

  // Get popular plans
  getPopularPlans: async (req, res) => {
    try {
      const { limit = 5 } = req.query;

      const plans = await Plan.find({ 'availability.isActive': true })
        .sort({ popularityScore: -1 })
        .limit(parseInt(limit))
        .lean();

      res.json({
        success: true,
        data: plans
      });

    } catch (error) {
      console.error('Get popular plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch popular plans',
        error: error.message
      });
    }
  }
};

module.exports = planController;
