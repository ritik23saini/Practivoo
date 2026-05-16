import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Issue from "@/models/Issue";
import Student from "@/models/Student";
import School from "@/models/School";
import Question from "@/models/Question";
import Class from "@/models/Class";
import mongoose from "mongoose";
import Notification from "@/models/Notification";
import Admin from "@/models/Admin";
import Task from "@/models/Task";
import verifyAdminAuth from "@/lib/verifyAuth";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["Image", "Audio", "Instruction/Text", "Irrelevant picture", "Other"] as const;

// POST - Create new issue
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      studentId,
      schoolId,
      type,
      additionalNote,
      message,
      topic,
      questionId,
    } = body || {};

    // Validate required fields
    if (!studentId || !schoolId || !type || !message || !questionId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid type" },
        { status: 400 }
      );
    }

    if (type === "Other" && !additionalNote?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide details for 'Other'." },
        { status: 400 }
      );
    }

    // Clean and normalize values
    const cleanMessage = (message?.toString() ?? "").trim().slice(0, 1000);
    const storedType = type === "Other"
      ? `Other: ${additionalNote.trim().slice(0, 100)}`
      : type;

    // Convert to ObjectId
    const questionObjectId = new mongoose.Types.ObjectId(questionId);
    const studentIdObjectId = new mongoose.Types.ObjectId(studentId);
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

    // Fetch student details with class
    const studentDetails = await Student.findById(studentId)
      .populate({
        path: "class",
        model: Class,
        select: "name -_id"
      })
      .select("name class -_id")
      .lean() as { name?: string; class?: { name?: string } } | null;

    if (!studentDetails) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Create issue
    const issue = await Issue.create({
      user: `${studentDetails.name} | ${studentDetails.class?.name || 'Unknown Class'} | Student`,
      school: schoolObjectId,
      questionId: questionObjectId,
      type: storedType,
      message: cleanMessage || "No additional notes",
      topic: topic || "",
      additionalNote: additionalNote?.trim() || "",
      studentId: studentIdObjectId,
      status: "pending"
    });

    const getadminid = await Admin.findOne().select("_id").lean() as { _id: mongoose.Types.ObjectId } | null;

    if (!getadminid) {
      console.error("No admin found");
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 500 }
      );
    }


    await Notification.create({
      receiver: getadminid._id,
      title: `Issue received from Student ${studentDetails.name} | ${studentDetails.class?.name || 'Unknown Class'}`,
      type: "Issue",
      message,
      isRead: false
    });

    return NextResponse.json(
      { success: true, data: issue, message: "Issue created successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/issues error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch issues (for notifications)
export async function GET(req: NextRequest) {

  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    // Build query
    const query: Record<string, any> = {};
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    // Fetch issues with populated data
    const issues = await Issue.find(query)
      .populate({
        path: "studentId",
        model: Student,
        select: "name class",
        populate: {
          path: "class",
          model: Class,
          select: "name level"
        }
      })
      .populate({
        path: "school",
        model: School,
        select: "name"
      })
      .populate({
        path: "questionId",
        model: Question,
        select: "text topic"
      })
      .sort({ createdAt: -1 })
      .lean();


    // Transform data for UI (notifications format)
    const notifications = issues.map((issue: any, index: number) => {
      const studentName = issue.studentId?.name || "Unknown Student";
      const className = issue.studentId?.class?.name || "Unknown Class";
      const schoolName = issue.school?.name || "Unknown School";
      const questionTopic = issue.questionId?.topic || issue.topic || "No Topic";

      return {
        id: index + 1,
        _id: issue._id.toString(),
        title: `${issue.type} - ${studentName}`,
        subtitle: schoolName,
        user: issue.user || studentName,
        role: "Student",
        school: schoolName,
        type: issue.type,
        questionHeading: issue.questionId?.text,
        message: issue.message || "No message provided",
        topic: questionTopic,
        additionalNote: issue.additionalNote || "",
        date: new Date(issue.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        status: issue.status,
        className: className,
        studentId: issue.studentId?._id?.toString(),
        schoolId: issue.school?._id?.toString(),
        questionId: issue.questionId?._id?.toString()
      };
    });

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length
    });
  } catch (err: any) {
    console.error("GET /api/issues error:", err);
    return NextResponse.json(
      { success: false, error: err },
      { status: 500 }
    );
  }
}