// utils/verifyToken.ts
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const verifyToken = (req: NextRequest): any => {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token not provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error("Invalid token");
  }
};