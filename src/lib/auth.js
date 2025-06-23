import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export function verifyToken(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"], // ✅ Fix here
    });

    return decoded;
  } catch (err) {
    console.error("JWT Verify Error:", err);
    return null;
  }
}
