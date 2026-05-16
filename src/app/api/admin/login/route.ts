import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import AdminModel from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    //  Add type validation 
    if (typeof identifier !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: "Invalid input types" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!identifier || !emailRegex.test(identifier)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Length validation
    if (identifier.length > 50) {
      return NextResponse.json({ error: "Email must be within 50 charaters long" }, { status: 400 });
    }

    if (!password || password.length < 8 || password.length > 16) {
      return NextResponse.json({ error: "Password must be 8-16 characters" }, { status: 400 });
    }
    await connectDB();

    const email = identifier.toLowerCase().trim();
    const admin = await AdminModel.findOne({ email: { $eq: email } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id.toString(), role: "admin", email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    // Build response payload (no need to return the token body)
    const res = NextResponse.json({
      user: {
        message: "Login successful",
      },
    });

    // Set HttpOnly cookie that middleware will read
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("[ADMIN_LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
