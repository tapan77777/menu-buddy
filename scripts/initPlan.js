// scripts/initPlans.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define Plan schema (same as your model)
const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in days
  features: [String],
  description: String,
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

// Sample plans data
const samplePlans = [
  {
    name: 'Basic',
    price: 999,
    duration: 30,
    description: 'Perfect for small restaurants',
    features: [
      'Up to 50 menu items',
      'Basic analytics',
      'Email support',
      'Mobile responsive design',
      'Basic customization'
    ]
  },
  {
    name: 'Premium',
    price: 1999,
    duration: 30,
    description: 'Most popular choice for growing restaurants',
    features: [
      'Unlimited menu items',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Multiple locations',
      'Advanced customization',
      'Social media integration'
    ]
  },
  {
    name: 'Enterprise',
    price: 3999,
    duration: 30,
    description: 'For large restaurant chains',
    features: [
      'Everything in Premium',
      'White-label solution',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced reporting',
      'Multi-language support',
      '24/7 phone support'
    ]
  }
];

async function initializePlans() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('🗑️  Cleared existing plans');

    // Insert sample plans
    const createdPlans = await Plan.insertMany(samplePlans);
    console.log(`✅ Sample plans created: ${createdPlans.length}`);

    console.log('\n📋 Created Plans:');
    createdPlans.forEach(plan => {
      console.log(`   - ${plan.name}: ₹${plan.price}/month (${plan.features.length} features)`);
    });

    console.log('\n🎉 Initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing plans:', error);
    process.exit(1);
  }
}

initializePlans();