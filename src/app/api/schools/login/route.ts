import { connectDB } from "@/utils/db";
import School from "@/models/School";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { identifier, password } = body;

    //  Type validation first - prevent object injection
    if (typeof identifier !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: "Invalid input types" }, { status: 400 });
    }

    const email = identifier.toLowerCase().trim();

    //  Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (email.length > 50) {
      return NextResponse.json({ error: "Email must be within 50 characters long" }, { status: 400 });
    }

    if (!password || password.length < 8 || password.length > 16) {
      return NextResponse.json({ error: "Password must be 8-16 characters" }, { status: 400 });
    }
    //  NoSQL injection prevention - wrap in $eq operator
    const school = await School.findOne({ email: { $eq: email } });
    if (!school) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, school.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: school._id.toString(),
        role: "school",
        email: school.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
        algorithm: "HS256"
      }
    );

    const res = NextResponse.json(
      {
        message: "Login successful",
        //  Return user data for UI display (optional)
        user: {
          email: school.email,
          name: school.name,
        }
      },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
