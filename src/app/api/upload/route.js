import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'menu-buddy' }, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }).end(buffer);
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
