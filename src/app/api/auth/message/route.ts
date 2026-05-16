import { connectDB } from "@/utils/db";
import UserMessage from "@/models/UserMessage";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Notification from "@/models/Notification";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Message from "@/models/Message";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    let decoded: { id: string; role: "student" | "teacher" };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: "student" | "teacher";
      };
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const body = await req.json();
    const { receiver, content } = body;

    if (!receiver || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const message = await UserMessage.create({
      sender: decoded.id,
      receiver,
      content,
    });
    let senderName = "Unknown";

    if (decoded.role === "student") {
      const student = await Student.findById(decoded.id).select("name");
      senderName = student?.name || "Student";
    } else {
      const teacher = await Teacher.findById(decoded.id).select("name");
      senderName = teacher?.name || "Teacher";
    }

    const pushnotificaton = await Notification.create({
      receiver,
      type: "MESSAGE",
      title: `New message from ${senderName}`,
      content: message.content,
      refId: message.id,
      refModel: "UserMessage"
    });
    console.log(pushnotificaton)

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}