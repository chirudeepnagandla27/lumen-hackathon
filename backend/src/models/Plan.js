const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planId: {
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
  type: {
    type: String,
    enum: ['Fibernet', 'Broadband Copper'],
    required: true
  },
  pricing: {
    monthly: {
      type: Number,
      required: true
    },
    annual: {
      type: Number,
      required: false
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  features: {
    dataQuota: {
      amount: { type: Number, required: true }, // in GB
      unit: { type: String, default: 'GB' }
    },
    speed: {
      download: { type: Number, required: true }, // in Mbps
      upload: { type: Number, required: true },
      unit: { type: String, default: 'Mbps' }
    },
    additionalFeatures: [{
      name: String,
      description: String
    }]
  },
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    regions: [{
      type: String
    }],
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    }
  },
  category: {
    type: String,
    enum: ['Basic', 'Standard', 'Premium', 'Enterprise'],
    required: true
  },
  popularityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for faster queries
planSchema.index({ type: 1, category: 1, 'availability.isActive': 1 });
planSchema.index({ popularityScore: -1 });

// Virtual for monthly price with discounts
planSchema.virtual('effectivePrice').get(function() {
  // This can be enhanced to calculate with active discounts
  return this.pricing.monthly;
});

module.exports = mongoose.model('Plan', planSchema);
