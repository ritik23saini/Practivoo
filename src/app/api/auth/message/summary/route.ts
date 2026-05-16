import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import jwt from "jsonwebtoken";
import UserMessage from "@/models/UserMessage";
import Student from "@/models/Student";
import { Types } from "mongoose";

interface JwtPayload {
  id: string;
  role: "teacher" | "student";
}

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET not defined");

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export async function GET(req: NextRequest) {
  try {
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

    const { id: teacherId, role } = decoded;
    if (role !== "teacher") {
      return NextResponse.json({ error: "Only teachers can access this route" }, { status: 403 });
    }

    // Get latest message sent to each student
    const messages = await UserMessage.aggregate([
      { $match: { sender: new Types.ObjectId(teacherId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$receiver", // studentId
          lastMessage: { $first: "$content" },
          time: { $first: "$createdAt" }
        }
      }
    ]);

    // Enrich each message with student info
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const student = await Student.findById(msg._id).select("name avatar");
        if (!student) return null;

        const entry = {
          student: {
            id: student._id,
            name: student.name,
            avatar: student.avatar || null
          },
          lastMessage: msg.lastMessage,
          time: msg.time
        };

        return entry;
      })
    );

    // Group by time
    const today: any[] = [];
    const yesterday: any[] = [];

    for (const entry of enriched) {
      if (!entry) continue;

      const time = new Date(entry.time);
      if (isToday(time)) today.push(entry);
      else if (isYesterday(time)) yesterday.push(entry);
    }

    return NextResponse.json({ today, yesterday }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}