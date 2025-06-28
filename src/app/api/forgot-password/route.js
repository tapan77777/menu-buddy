import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

    await connectToDB();

    const user = await Restaurant.findOne({ email });
    if (!user) return Response.json({ error: "No user found" }, { status: 404 });

    // In production, you should generate a token + email it
    console.log(`📧 Password reset requested for: ${email}`);
    console.log(`🔗 Reset link (to build): /reset-password?email=${email}`);

    return Response.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
