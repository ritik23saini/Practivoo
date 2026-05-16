// src/lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type UserPayload = {
  _id: string;
  email: string;
  role: "admin" | "school";
};

// Get current authenticated user from JWT
export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

    return {
      _id: (payload.id as string) ?? (payload._id as string), // ← handles both id or _id
      email: payload.email as string,
      role: payload.role as "admin" | "school",
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Common auth result type
type AuthResult =
  | NextResponse<{ error: string }>
  | { success: true; user: UserPayload };

// Verify admin authentication
export default async function verifyAdminAuth(): Promise<AuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  //console.log("Admin authenticated:");
  return { success: true, user };
}

// Verify school authentication
export async function verifySchoolAuth(): Promise<AuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  if (user.role !== "school") {
    return NextResponse.json({ error: "School access required" }, { status: 403 });
  }

  //console.log("School authenticated:");
  return { success: true, user };
}
