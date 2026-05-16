import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Student from "@/models/Student";
import ClassModel from "@/models/Class";
import { Types } from "mongoose";
import "@/models/Teacher";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";

type Id = string;
type StudentClassPick = { _id: Types.ObjectId; class: Types.ObjectId };

async function verifyTeacherOwnsStudentClass(
  studentId: string,
  teacherId?: string
) {
  if (!teacherId) return true;

  const st = await Student.findById(studentId)
    .select("class")
    .lean<StudentClassPick | null>();

  if (!st) return false;

  const owns = await ClassModel.exists({
    _id: st.class,
    teachers: new Types.ObjectId(teacherId),
  });

  return !!owns;
}

export async function GET(req: NextRequest, context: any) {
  try {
    await connectDB();

    const studentId = context?.params?.studentId;
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const term = searchParams.get("term") || undefined;
    const week = searchParams.get("week") || undefined;

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    // Permissions check
    const allowed = await verifyTeacherOwnsStudentClass(studentId, teacherId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- 1) Student & class basics
    const student = await Student.findById(studentId)
      .select("_id name email phone gender level image class school")
      .populate({
        path: "class",
        model: ClassModel,
        select: "_id name level teachers",
      });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const classId = (student.class as any)?._id?.toString?.() ||
      (student.class as any)?.toString?.() || "";

    // --- 2) Build TaskResult filter for completed tasks only
    const taskResultFilter: any = {
      student: new Types.ObjectId(studentId),
    };

    if (term) taskResultFilter.term = term;
    if (week) taskResultFilter.week = week;

    // Fetch completed TaskResults for this student
    const completedResults = await TaskResult.find(taskResultFilter)
      .select("_id score status task term week evaluationStatus")
      .lean();
    console.log(completedResults);
    // --- 3) Calculate scores for this period (term/week)
    const scores = completedResults
      .map((r: any) => Number(r.score) || 0)
      .filter((s) => s > 0); // Only count valid scores

    const maxScore = scores.length ? Math.max(...scores) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;
    const totalPoints = scores.reduce((a, b) => a + b, 0); // Sum of all scores in period

    // --- 4) Rank calculation for this specific period
    // Get all students in the same class with their scores for this period
    const allStudentsInClass = await Student.find({ class: classId })
      .select("_id")
      .lean();

    const studentScoreMap: { [key: string]: number } = {};

    for (const s of allStudentsInClass) {
      const studentResults = await TaskResult.find({
        student: s._id,
        ...(term && { term }),
        ...(week && { week }),
      });

      const studentScores = studentResults
        .map((r: any) => Number(r.score) || 0)
        .filter((sc) => sc > 0);

      studentScoreMap[String(s._id)] = studentScores.reduce((a, b) => a + b, 0);
    }

    // Sort by score (descending) to get rank
    const rankedStudents = Object.entries(studentScoreMap)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);

    const rank = rankedStudents.indexOf(String(student._id)) + 1;
    const classSize = allStudentsInClass.length;

    // --- 5) Weekly report stats
    const totalTasks = completedResults.length;
    const completed = completedResults.filter(
      (r: any) => r.evaluationStatus === "completed"
    ).length;
    const pending = completedResults.filter(
      (r: any) => r.evaluationStatus === "pending"
    ).length;; // Only showing completed, so pending is 0 in this period

    return NextResponse.json(
      {
        student: {
          _id: String(student._id),
          name: student.name,
          gender: student.gender,
          email: student.email,
          phone: student.phone,
          level: student.level,
          image: student.image,
        },
        class: {
          _id: classId,
          name: (student.class as any)?.name,
          level: (student.class as any)?.level,
        },
        header: {
          rank: rank,
          classSize: classSize,
          points: totalPoints, // Total score from completed TaskResults
        },
        weeklyReport: {
          scope: {
            term: term ?? null,
            week: week ?? null,
          },
          totalTasks,
          completed,
          pending,
          maxScore,
          minScore,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(
      "GET /api/teacher/students/[studentId]/profile error:",
      err
    );
    return NextResponse.json(
      { error: "Failed to fetch student profile" },
      { status: 500 }
    );
  }
}