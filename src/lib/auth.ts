import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!; // keep this safe

export function getTeacherIdFromAuth(req: Request): string {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("No authorization header");

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) throw new Error("Invalid authorization format");

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!payload.id) throw new Error("Invalid token payload");
    return payload.id;
  } catch (err) {
    throw new Error("Unauthorized");
  }
}