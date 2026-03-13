import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export function verifyToken(req) {
  try {
    // Prefer httpOnly cookie (XSS-safe), fall back to Authorization header
    const cookieToken = req.cookies?.get?.("token")?.value;
    const authHeader = req.headers.get("Authorization");
    const headerToken = authHeader?.split(" ")[1];

    const token = cookieToken || headerToken;
    if (!token) return null;

    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}
