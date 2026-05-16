import { connectDB } from "@/utils/db";
import Student from "@/models/Student";
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
  const body = await req.json();
  const { name, classId, level, gender, phone, email, password } = body;

  if (!name || !classId || !level || !gender || !email || !password || !schoolId) {
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

  const existing = await Student.findOne({ lowerCaseEmail });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }
  /* password is automatically hashed using pre(save) */

  const studentId = await generateUniqueStudentId();

  try {
    const student = await Student.create({
      name,
      class: new mongoose.Types.ObjectId(classId),
      level,
      gender,
      phone,
      email: lowerCaseEmail,
      password,
      studentId,
      school: new mongoose.Types.ObjectId(schoolId),
    });
    console.log(student)

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();

  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const schoolId = authRes.user._id;

  if (!schoolId) {
    return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
  }

  let objectId: mongoose.Types.ObjectId;
  try {
    objectId = new mongoose.Types.ObjectId(schoolId);
  } catch (error) {
    return NextResponse.json({ error: "Invalid ObjectId format" }, { status: 400 });
  }

  try {
    // Fetch students
    const students = await Student.find({ school: objectId })
      .populate("class", "name")
      .select("name email gender level studentId score class")
      .lean();

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function generateUniqueStudentId() {
  let id = "1234";
  let exists = true;

  while (exists) {
    id = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await Student.exists({ studentId: id });
    exists = !!existing; // Convert result to true/false
  }

  return id;
}