// src/app/api/plans/route.js - CREATE THIS FILE
import { connectToDB } from "@/lib/db";
import Plan from "@/models/Plan";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDB();
    
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    
    // Group plans by base type
    const groupedPlans = {
      freemium: plans.filter(p => p.slug.startsWith('freemium')),
      basic: plans.filter(p => p.slug.startsWith('basic')),
      pro: plans.filter(p => p.slug.startsWith('pro')),
      gold: plans.filter(p => p.slug.startsWith('gold'))
    };
    
    return NextResponse.json({ success: true, plans: groupedPlans });
  } catch (error) {
    console.error('Plans API error:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}