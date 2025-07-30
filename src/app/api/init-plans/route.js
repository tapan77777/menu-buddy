// src/app/api/init-plans/route.js
import { connectToDB } from "@/lib/db";
import Plan from "@/models/Plan";
import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    await connectToDB();
    
    // Clear existing plans
    await Plan.deleteMany({});
    
    // Insert sample plans
    const createdPlans = await Plan.insertMany(samplePlans);
    
    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdPlans.length} plans`,
      plans: createdPlans
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to initialize plans",
      error: error.message
    }, { status: 500 });
  }
}