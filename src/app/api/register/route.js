// app/api/register/route.js
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ ADD THESE HELPER FUNCTIONS
function generateSubdomain(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

async function getUniqueSubdomain(baseName) {
  let subdomain = generateSubdomain(baseName);
  let counter = 1;
  
  while (true) {
    const existing = await Restaurant.findOne({ subdomain });
    if (!existing) {
      return subdomain;
    }
    // If exists, try with number suffix
    subdomain = `${generateSubdomain(baseName)}-${counter}`;
    counter++;
  }
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");
    const address = form.get("address");
    const accessCode = form.get("accessCode");
    const logoFile = form.get("logo");

    // Validate required fields
    if (!name || !email || !password || !confirmPassword || !address || !accessCode || !logoFile) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check password match
    if (password !== confirmPassword) {
      return Response.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // ✅ Verify Access Code
    if (accessCode !== process.env.ADMIN_ACCESS_CODE) {
      return Response.json({ error: "Invalid access code" }, { status: 403 });
    }

    await connectToDB();

    const existing = await Restaurant.findOne({ email });
    if (existing) {
      return Response.json({ error: "Email already in use" }, { status: 400 });
    }

    // ✅ Upload to Cloudinary
    const buffer = await logoFile.arrayBuffer();
    const bytes = Buffer.from(buffer);

    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "menu-buddy" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(bytes);
    });

    const logoUrl = uploadRes.secure_url;

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    
    // ✅ ADD THIS LINE - Generate unique subdomain
    const subdomain = await getUniqueSubdomain(name);

    const newRest = await Restaurant.create({
      name,
      email,
      password: hashedPassword,
      slug,
      subdomain, // ✅ ADD THIS LINE
      address,
      logoUrl,
    });

    return Response.json({ 
      success: true, 
      restaurant: {
        ...newRest.toObject(),
        // ✅ ADD THESE LINES - Show the restaurant their new URL
        menuUrl: `https://${subdomain}.menubuddy.co.in`,
        subdomainUrl: `${subdomain}.menubuddy.co.in`
      }
    }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}