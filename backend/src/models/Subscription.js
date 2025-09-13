const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  planId: {
    type: String,
    required: true,
    ref: 'Plan'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired', 'pending'],
    default: 'pending'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  dates: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    nextBillingDate: {
      type: Date,
      required: true
    },
    lastRenewalDate: {
      type: Date
    },
    cancellationDate: {
      type: Date
    }
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  usage: {
    currentMonthUsage: {
      type: Number,
      default: 0 // in GB
    },
    lastMonthUsage: {
      type: Number,
      default: 0
    },
    averageMonthlyUsage: {
      type: Number,
      default: 0
    },
    dataQuotaLimit: {
      type: Number,
      required: true
    }
  },
  discounts: [{
    discountId: {
      type: String,
      ref: 'Discount'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    discountAmount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  }],
  paymentHistory: [{
    paymentId: String,
    amount: Number,
    paymentDate: Date,
    status: {
      type: String,
      enum: ['success', 'failed', 'pending', 'refunded']
    },
    paymentMethod: String
  }],
  notes: [{
    note: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ 'dates.nextBillingDate': 1 });
subscriptionSchema.index({ 'dates.endDate': 1 });

// Virtual to check if subscription is near expiry
subscriptionSchema.virtual('isNearExpiry').get(function() {
  const daysUntilExpiry = Math.ceil((this.dates.endDate - new Date()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 7;
});

// Virtual to calculate usage percentage
subscriptionSchema.virtual('usagePercentage').get(function() {
  if (this.usage.dataQuotaLimit === 0) return 0;
  return Math.round((this.usage.currentMonthUsage / this.usage.dataQuotaLimit) * 100);
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
