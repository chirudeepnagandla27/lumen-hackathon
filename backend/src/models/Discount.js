const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  discountId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but unique when present
    uppercase: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  conditions: {
    minimumPlanPrice: {
      type: Number,
      default: 0
    },
    applicablePlans: [{
      type: String,
      ref: 'Plan'
    }],
    applicablePlanTypes: [{
      type: String,
      enum: ['Fibernet', 'Broadband Copper']
    }],
    newCustomersOnly: {
      type: Boolean,
      default: false
    },
    maxUsagePerUser: {
      type: Number,
      default: 1
    },
    maxTotalUsage: {
      type: Number,
      default: null // null means unlimited
    }
  },
  validity: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  usage: {
    totalUsed: {
      type: Number,
      default: 0
    },
    usageByUser: [{
      userId: String,
      usedCount: { type: Number, default: 1 },
      lastUsed: { type: Date, default: Date.now }
    }]
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
discountSchema.index({ code: 1 });
discountSchema.index({ status: 1 });
discountSchema.index({ 'validity.startDate': 1, 'validity.endDate': 1 });

// Virtual to check if discount is currently valid
discountSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.validity.startDate <= now && 
         this.validity.endDate >= now &&
         (this.conditions.maxTotalUsage === null || this.usage.totalUsed < this.conditions.maxTotalUsage);
});

// Method to calculate discount amount for a given price
discountSchema.methods.calculateDiscount = function(price) {
  if (!this.isValid) return 0;
  
  if (price < this.conditions.minimumPlanPrice) return 0;
  
  if (this.type === 'percentage') {
    return Math.round((price * this.value / 100) * 100) / 100;
  } else {
    return Math.min(this.value, price);
  }
};

module.exports = mongoose.model('Discount', discountSchema);
