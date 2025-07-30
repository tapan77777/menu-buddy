import { connectToDB } from "@/lib/db";
import Plan from "@/models/Plan";

export async function GET() {
  await connectToDB();

  const plans = [
    {
      name: "Freemium",
      price: 0,
      itemLimit: 25,
      adminAccess: true,
      analytics: true,
      aiFeatures: false,
      promotionalBanner: false,
      durationMonths: 12,
    },
    {
      name: "Basic",
      price: 399,
      itemLimit: 50,
      adminAccess: true,
      analytics: true,
      aiFeatures: false,
      promotionalBanner: false,
      durationMonths: 1,
    },
    {
      name: "Pro",
      price: 599,
      itemLimit: 9999,
      adminAccess: true,
      analytics: true,
      aiFeatures: false,
      promotionalBanner: false,
      durationMonths: 1,
    },
    {
      name: "Gold",
      price: 999,
      itemLimit: 9999,
      adminAccess: true,
      analytics: true,
      aiFeatures: true,
      promotionalBanner: true,
      durationMonths: 1,
    },
  ];

  await Plan.deleteMany(); // optional
  const result = await Plan.insertMany(plans);

  return Response.json({ success: true, result });
}
