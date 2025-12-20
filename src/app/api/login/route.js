import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    await connectToDB();

    const user = await Restaurant.findOne({ email });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

  const token = jwt.sign(
  { 
    id: user._id, 
    slug: user.slug,
    restaurantId: user._id     // THIS IS THE MISSING PART
  },
  JWT_SECRET,
  { expiresIn: "7d" }
);


    return Response.json({
      success: true,
      token,
      user: {
  id: user._id,
  name: user.name,
  email: user.email,
  slug: user.slug,
  restaurantId: user._id
}

    });

  } catch (err) {
    console.error("Login Error:", err);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
