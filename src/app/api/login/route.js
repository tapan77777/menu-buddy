import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectToDB();

    // .select('+password') required because password has select:false in the schema
    const user = await Restaurant.findOne({ email }).select("+password");

    // Use identical message for missing user and wrong password — prevents user enumeration
    const INVALID = "Invalid email or password";

    if (!user) {
      return Response.json({ error: INVALID }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return Response.json({ error: INVALID }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user._id,
        slug: user.slug,
        restaurantId: user._id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProduction = process.env.NODE_ENV === "production";
    const cookieFlags = `HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${isProduction ? "; Secure" : ""}`;

    const response = Response.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        slug: user.slug,
        restaurantId: user._id,
      },
    });

    response.headers.set("Set-Cookie", `token=${token}; ${cookieFlags}`);
    return response;

  } catch (err) {
    console.error("Login Error:", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
