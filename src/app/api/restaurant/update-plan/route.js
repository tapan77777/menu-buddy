import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

export async function GET() {
  try {
    await connectToDB();

    // Update all restaurants to have new default fields
    const result = await Restaurant.updateMany(
      {},
      {
        $set: {
          plan: "freemium",
          planExpiry: null,
          razorpayPaymentId: "",
        },
      }
    );

    return Response.json({
      message: "All restaurants updated successfully!",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return Response.json({
      error: "Failed to update restaurants",
      details: error.message,
    });
  }
}
