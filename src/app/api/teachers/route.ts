import { connectDB } from "@/utils/db";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { verifySchoolAuth } from "@/lib/verifyAuth";

export async function POST(req: NextRequest) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const schoolId = authRes.user._id;
  await connectDB();
  const { name, gender, yoe, phone, email, password } = await req.json();

  if (!name || !email || !password || !schoolId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const lowerCaseEmail = email.toLowerCase()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!lowerCaseEmail || !emailRegex.test(lowerCaseEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Length validations
  if (lowerCaseEmail.length > 50) {
    return NextResponse.json({ error: "Email must not exceed 50 characters." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 16) {
    return NextResponse.json({ error: "Password must be between 8 and 16 characters" }, { status: 400 });
  }
  const existing = await Teacher.findOne({ email: lowerCaseEmail });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  /* const hashedPassword = await bcrypt.hash(password, 10); */
  //auto genrated using pre save hook
  const teacherId = await generateUniqueStudentId();

  const teacher = await Teacher.create({
    name,
    gender,
    yoe,
    phone,
    email: lowerCaseEmail,
    password,
    school: schoolId,
    teacherId
  });

  return NextResponse.json(teacher, { status: 201 });
}

export async function GET(req: NextRequest) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const schoolId = authRes.user._id;
  await connectDB();

  let filter = {};
  if (schoolId) {
    let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(schoolId);
      filter = { school: objectId };
    } catch (error) {
      return NextResponse.json({ error: "Invalid ObjectId format" }, { status: 400 });
    }
  }
  const teachers = await Teacher.find(filter).select("-password");
  return NextResponse.json({ teachers });
}

async function generateUniqueStudentId() {
  let id = "1234";
  let exists = true;

  while (exists) {
    id = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await Teacher.exists({ teacherId: id });
    exists = !!existing; // Convert result to true/false
  }

  return id;
}