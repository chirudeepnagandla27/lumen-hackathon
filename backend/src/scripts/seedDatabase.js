const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const Discount = require('../models/Discount');
const AuditLog = require('../models/AuditLog');

// ------------------- Sample Users -------------------
const sampleUsers = [
  {
    userId: uuidv4(),
    email: 'admin@lumen.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+1-555-0001',
    role: 'admin',
    address: { street: '123 Admin St', city: 'Tech City', state: 'CA', zipCode: '94105', country: 'USA' }
  },
  { userId: uuidv4(), email: 'john.doe@email.com', password: 'user123', firstName: 'John', lastName: 'Doe', phone: '+1-555-0101', role: 'user', address: { street: '456 Oak Ave', city: 'Springfield', state: 'IL', zipCode: '62701', country: 'USA' } },
  { userId: uuidv4(), email: 'jane.smith@email.com', password: 'user123', firstName: 'Jane', lastName: 'Smith', phone: '+1-555-0102', role: 'user', address: { street: '789 Pine Rd', city: 'Austin', state: 'TX', zipCode: '73301', country: 'USA' } },
  { userId: uuidv4(), email: 'mike.wilson@email.com', password: 'user123', firstName: 'Mike', lastName: 'Wilson', phone: '+1-555-0103', role: 'user', address: { street: '321 Elm St', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'USA' } },
  { userId: uuidv4(), email: 'sarah.brown@email.com', password: 'user123', firstName: 'Sarah', lastName: 'Brown', phone: '+1-555-0104', role: 'user', address: { street: '654 Maple Dr', city: 'Denver', state: 'CO', zipCode: '80201', country: 'USA' } }
];

// ------------------- Sample Plans -------------------
const samplePlans = [
  {
    planId: uuidv4(),
    name: 'Fibernet Basic',
    description: 'Perfect for light internet users with essential connectivity needs.',
    type: 'Fibernet',
    category: 'Basic',
    pricing: { monthly: 29.99, annual: 299.99, currency: 'USD' },
    features: { dataQuota: { amount: 100, unit: 'GB' }, speed: { download: 50, upload: 25, unit: 'Mbps' }, additionalFeatures: [{ name: 'Basic Support', description: 'Email and chat support during business hours' }, { name: 'Standard Installation', description: 'Professional installation included' }] },
    availability: { isActive: true, regions: ['CA', 'TX', 'NY', 'FL'], startDate: new Date('2024-01-01'), endDate: null },
    popularityScore: 75
  },
  {
    planId: uuidv4(),
    name: 'Fibernet Standard',
    description: 'Ideal for families and small businesses with moderate usage.',
    type: 'Fibernet',
    category: 'Standard',
    pricing: { monthly: 49.99, annual: 499.99, currency: 'USD' },
    features: { dataQuota: { amount: 500, unit: 'GB' }, speed: { download: 100, upload: 50, unit: 'Mbps' }, additionalFeatures: [{ name: 'Priority Support', description: '24/7 phone and chat support' }, { name: 'Free Router', description: 'High-performance router included' }, { name: 'Security Suite', description: 'Basic antivirus and firewall protection' }] },
    availability: { isActive: true, regions: ['CA', 'TX', 'NY', 'FL', 'WA', 'CO'], startDate: new Date('2024-01-01'), endDate: null },
    popularityScore: 90
  },
  {
    planId: uuidv4(),
    name: 'Fibernet Premium',
    description: 'High-performance solution for power users and large families.',
    type: 'Fibernet',
    category: 'Premium',
    pricing: { monthly: 79.99, annual: 799.99, currency: 'USD' },
    features: { dataQuota: { amount: 1000, unit: 'GB' }, speed: { download: 200, upload: 100, unit: 'Mbps' }, additionalFeatures: [{ name: 'VIP Support', description: 'Dedicated support line with priority response' }, { name: 'Premium Router', description: 'Latest WiFi 6 router with mesh capability' }, { name: 'Advanced Security', description: 'Enterprise-grade security and parental controls' }, { name: 'Static IP', description: 'Static IP address for business needs' }] },
    availability: { isActive: true, regions: ['CA', 'TX', 'NY', 'FL', 'WA', 'CO', 'IL'], startDate: new Date('2024-01-01'), endDate: null },
    popularityScore: 85
  },
  {
    planId: uuidv4(),
    name: 'Copper Basic',
    description: 'Affordable broadband option for budget-conscious users.',
    type: 'Broadband Copper',
    category: 'Basic',
    pricing: { monthly: 19.99, annual: 199.99, currency: 'USD' },
    features: { dataQuota: { amount: 50, unit: 'GB' }, speed: { download: 25, upload: 10, unit: 'Mbps' }, additionalFeatures: [{ name: 'Basic Support', description: 'Email support and online resources' }, { name: 'Standard Modem', description: 'Basic DSL modem included' }] },
    availability: { isActive: true, regions: ['All'], startDate: new Date('2024-01-01'), endDate: null },
    popularityScore: 60
  },
  {
    planId: uuidv4(),
    name: 'Copper Standard',
    description: 'Reliable broadband with enhanced speeds and support.',
    type: 'Broadband Copper',
    category: 'Standard',
    pricing: { monthly: 34.99, annual: 349.99, currency: 'USD' },
    features: { dataQuota: { amount: 250, unit: 'GB' }, speed: { download: 50, upload: 20, unit: 'Mbps' }, additionalFeatures: [{ name: 'Standard Support', description: 'Phone and email support' }, { name: 'Enhanced Modem', description: 'High-speed DSL modem with WiFi' }, { name: 'Basic Security', description: 'Antivirus software included' }] },
    availability: { isActive: true, regions: ['All'], startDate: new Date('2024-01-01'), endDate: null },
    popularityScore: 70
  }
];

// ------------------- Sample Discounts -------------------
const sampleDiscounts = [
  {
    discountId: uuidv4(),
    name: 'New Customer Welcome',
    description: '20% off first 3 months for new subscribers',
    code: 'WELCOME20',
    type: 'percentage',
    value: 20,
    conditions: { minimumPlanPrice: 25, applicablePlans: [], applicablePlanTypes: ['Fibernet', 'Broadband Copper'], newCustomersOnly: true, maxUsagePerUser: 1, maxTotalUsage: 1000 },
    validity: { startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31') },
    status: 'active',
    createdBy: 'admin-user-id',
    usage: { totalUsed: 25, usageByUser: [] }
  },
  {
    discountId: uuidv4(),
    name: 'Fibernet Special',
    description: '$15 off monthly Fibernet plans',
    code: 'FIBER15',
    type: 'fixed',
    value: 15,
    conditions: { minimumPlanPrice: 40, applicablePlans: [], applicablePlanTypes: ['Fibernet'], newCustomersOnly: false, maxUsagePerUser: 2, maxTotalUsage: 500 },
    validity: { startDate: new Date('2024-01-01'), endDate: new Date('2024-06-30') },
    status: 'active',
    createdBy: 'admin-user-id',
    usage: { totalUsed: 12, usageByUser: [] }
  },
  {
    discountId: uuidv4(),
    name: 'Summer Sale',
    description: '25% off all plans for summer promotion',
    code: 'SUMMER25',
    type: 'percentage',
    value: 25,
    conditions: { minimumPlanPrice: 20, applicablePlans: [], applicablePlanTypes: ['Fibernet', 'Broadband Copper'], newCustomersOnly: false, maxUsagePerUser: 1, maxTotalUsage: 2000 },
    validity: { startDate: new Date('2024-06-01'), endDate: new Date('2024-08-31') },
    status: 'active',
    createdBy: 'admin-user-id',
    usage: { totalUsed: 89, usageByUser: [] }
  }
];

// ------------------- Generate Subscriptions -------------------
const generateSampleSubscriptions = (users, plans) => {
  const subscriptions = [];
  const userSubset = users.filter(u => u.role === 'user');

  userSubset.forEach(user => {
    const numSubscriptions = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numSubscriptions; i++) {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 12));

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const isActive = i === 0;
      const status = isActive ? 'active' : (Math.random() > 0.3 ? 'cancelled' : 'expired');

      const currentUsage = Math.floor(Math.random() * plan.features.dataQuota.amount * 0.9);
      const lastMonthUsage = Math.floor(Math.random() * plan.features.dataQuota.amount * 0.8);
      const avgUsage = (currentUsage + lastMonthUsage) / 2;

      const nextBillingDate = new Date(startDate);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1); // always set

      subscriptions.push({
        subscriptionId: uuidv4(),
        userId: user.userId,
        planId: plan.planId,
        status,
        billingCycle: Math.random() > 0.8 ? 'annual' : 'monthly',
        pricing: { basePrice: plan.pricing.monthly, discountAmount: Math.random() > 0.7 ? plan.pricing.monthly * 0.1 : 0, finalPrice: plan.pricing.monthly * (Math.random() > 0.7 ? 0.9 : 1), currency: 'USD' },
        dates: { startDate, endDate, nextBillingDate, lastRenewalDate: isActive && Math.random() > 0.5 ? new Date(startDate.getTime() + 30*24*60*60*1000) : null, cancellationDate: status === 'cancelled' ? new Date(endDate.getTime() - 7*24*60*60*1000) : null },
        autoRenew: isActive && Math.random() > 0.3,
        usage: { currentMonthUsage: isActive ? currentUsage : 0, lastMonthUsage, averageMonthlyUsage: avgUsage, dataQuotaLimit: plan.features.dataQuota.amount },
        discounts: [],
        paymentHistory: generatePaymentHistory(plan.pricing.monthly, startDate, status),
        notes: []
      });
    }
  });

  return subscriptions;
};

const generatePaymentHistory = (monthlyPrice, startDate, status) => {
  const history = [];
  const monthsSinceStart = Math.floor((new Date() - startDate) / (30*24*60*60*1000));

  for (let i = 0; i <= monthsSinceStart && i < 12; i++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);

    const paymentStatus = status === 'cancelled' && i === monthsSinceStart ? 'failed' : Math.random() > 0.95 ? 'failed' : 'success';

    history.push({ paymentId: uuidv4(), amount: monthlyPrice, paymentDate, status: paymentStatus, paymentMethod: Math.random() > 0.5 ? 'credit_card' : 'bank_transfer' });
  }

  return history;
};

// ------------------- Seed Database -------------------
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/subscription_management', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to database');

    await Promise.all([User.deleteMany({}), Plan.deleteMany({}), Subscription.deleteMany({}), Discount.deleteMany({}), AuditLog.deleteMany({})]);
    console.log('Cleared existing data');

    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    const createdPlans = await Plan.create(samplePlans);
    console.log(`Created ${createdPlans.length} plans`);

    const adminUser = createdUsers.find(u => u.role === 'admin');
    sampleDiscounts.forEach(discount => discount.createdBy = adminUser.userId);

    const createdDiscounts = await Discount.create(sampleDiscounts);
    console.log(`Created ${createdDiscounts.length} discounts`);

    const subscriptions = generateSampleSubscriptions(createdUsers, createdPlans);
    const createdSubscriptions = await Subscription.create(subscriptions);
    console.log(`Created ${createdSubscriptions.length} subscriptions`);

    const auditLogs = [];
    createdUsers.forEach(user => auditLogs.push({ logId: uuidv4(), userId: user.userId, action: 'user_created', entityType: 'user', entityId: user.userId, description: `User account created for ${user.email}`, metadata: { ipAddress: '127.0.0.1', userAgent: 'Database Seeder' } }));
    createdPlans.forEach(plan => auditLogs.push({ logId: uuidv4(), userId: adminUser.userId, action: 'plan_created', entityType: 'plan', entityId: plan.planId, description: `Plan created: ${plan.name}`, metadata: { ipAddress: '127.0.0.1', userAgent: 'Database Seeder' } }));

    await AuditLog.create(auditLogs);
    console.log(`Created ${auditLogs.length} audit log entries`);

    console.log('\n=== Database seeded successfully! ===');
    console.log('Admin: admin@lumen.com / admin123');
    console.log('User: john.doe@email.com / user123');
    console.log('User: jane.smith@email.com / user123');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
    process.exit(0);
  }
};

seedDatabase();
