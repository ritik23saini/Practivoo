import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/utils/db";
import Student from "@/models/Student";
import Class from "@/models/Class";
import UserMessage from "@/models/UserMessage";
import Teacher from "@/models/Teacher"; 

interface JwtPayload {
  id: string;
  role: "student" | "teacher";
}

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

function isToday(date: Date) {
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function isYesterday(date: Date) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export async function GET(req: NextRequest) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (decoded.role !== "student") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const student = await Student.findById(decoded.id).populate("class");
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const classDoc = await Class.findById(student.class);
    if (!classDoc || !classDoc.teachers) {
      return NextResponse.json({ error: "Class or teacher not assigned" }, { status: 404 });
    }

    const teacherId = classDoc.teachers;
    const teacher = await Teacher.findById(teacherId).select("name image");

    const messages = await UserMessage.find({
      sender: teacherId,
      receiver: student._id,
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name image") // populate teacher info
      .lean();

    const today: any[] = [];
    const yesterday: any[] = [];

    messages.forEach((msg) => {
      const entry = {
        id: msg._id,
        content: msg.content,
        time: msg.createdAt,
        teacher: {
          id: msg.sender._id,
          name: msg.sender.name,
          image: msg.sender.image || null,
        },
        replies: msg.replies || [],
        likes: msg.likes || [],
      };

      const createdAt = new Date(msg.createdAt);
      if (isToday(createdAt)) {
        today.push(entry);
      } else if (isYesterday(createdAt)) {
        yesterday.push(entry);
      }
    });

    return NextResponse.json({ today, yesterday }, { status: 200 });
  } catch (error: any) {
    console.error("Message fetch error:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}