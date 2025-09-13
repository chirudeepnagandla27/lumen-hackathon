const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      // User actions
      'subscription_created',
      'subscription_updated',
      'subscription_cancelled',
      'subscription_renewed',
      'subscription_upgraded',
      'subscription_downgraded',
      'payment_made',
      'discount_applied',
      
      // Admin actions
      'plan_created',
      'plan_updated',
      'plan_deleted',
      'discount_created',
      'discount_updated',
      'discount_deleted',
      'user_created',
      'user_updated',
      'user_deactivated',
      
      // System actions
      'auto_renewal',
      'usage_updated',
      'notification_sent'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['subscription', 'plan', 'discount', 'user', 'payment', 'usage']
  },
  entityId: {
    type: String,
    required: true
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String
    },
    deviceInfo: String
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1, status: 1 });

// Static method to create audit log
auditLogSchema.statics.createLog = async function(logData) {
  const { v4: uuidv4 } = require('uuid');
  
  const auditLog = new this({
    logId: uuidv4(),
    ...logData
  });
  
  return await auditLog.save();
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
