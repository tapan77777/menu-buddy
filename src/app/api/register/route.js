// app/api/register/route.js
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password, address, logoUrl } = await req.json();

    await connectToDB();

    const existing = await Restaurant.findOne({ email });
    if (existing) {
      return Response.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const newRest = await Restaurant.create({
      name,
      email,
      password: hashedPassword,
      slug,
      address,
      logoUrl,
    });

    return Response.json({ success: true, restaurant: newRest }, { status: 201 });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
