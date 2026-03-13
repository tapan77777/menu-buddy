import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

    await connectToDB();

    const user = await Restaurant.findOne({ email });

    // Always return success regardless of whether the email exists.
    // Revealing "no user found" allows attackers to enumerate registered emails.
    if (user) {
      // TODO: generate a signed time-limited reset token and email it
      console.log(`Password reset requested for: ${email}`);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
