import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from "@/utils/db";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import Question from "@/models/Question";
import { verifySchoolAuth } from "@/lib/verifyAuth";

// Type definitions
interface DashboardMetrics {
  avgScore: string | number;
  maxScore: string | number;
  minScore: string | number;
  totalSubmissions: string;
  completedSubmissions: string;
  pendingSubmissions: string;
  commonMistakes: string;
}

interface SubmittedStudent {
  _id: Types.ObjectId;
  name: string;
  image: string;
  taskResult: {
    _id: Types.ObjectId;
    answers: any[];
    task: any;
    score: number;
    evaluationStatus: string;
    createdAt: Date;
  };
}

interface NotSubmittedStudent {
  _id: Types.ObjectId;
  name: string;
  image: string;
}

interface DashboardSubmission {
  submitted: SubmittedStudent[];
  notSubmitted: NotSubmittedStudent[];
}

interface DashboardData {
  submission: DashboardSubmission;
  metrics: DashboardMetrics;
}

// Helper function to validate ObjectId
function badId(id?: string | null): boolean {
  return !id || !mongoose.Types.ObjectId.isValid(id);
}

export async function GET(req: NextRequest) {

  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const schoolId = authRes.user._id;
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level") || null;
    const selectedTaskId = searchParams.get("selectedTaskId") || null;

    // Validation
    if (badId(schoolId)) {
      return NextResponse.json(
        { success: false, error: "Invalid school ID" },
        { status: 400 }
      );
    }
    if (badId(selectedTaskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);
    const taskObjectId = new mongoose.Types.ObjectId(selectedTaskId!);

    // Fetch students by school and level
    const students = await Student.find({ school: schoolObjectId, level }).select(
      "_id name image"
    ).lean<{ _id: Types.ObjectId; name: string; image: string }[]>();

    const totalStudents = students.length;
    const studentIds = students.map((s) => s._id);

    if (totalStudents === 0) {
      return NextResponse.json({
        success: true,
        data: {
          submission: { submitted: [], notSubmitted: [] },
          metrics: {
            avgScore: 0,
            maxScore: 0,
            minScore: 0,
            totalSubmissions: "0/0",
            completedSubmissions: "0/0",
            pendingSubmissions: "0/0",
            commonMistakes: [],
            accuracyRate: "0%",
          },
        },
      });
    }

    // Get task details for total questions
    const taskDetails: any = await Task.findById(taskObjectId).select("questions").lean()

    const totalQuestions = taskDetails?.questions?.length ?? 0;

    // Aggregation: Calculate metrics from completed submissions only
    const metricsAgg = await TaskResult.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          task: taskObjectId,
        },
      },
      {
        $addFields: {
          rawScore: {
            $ifNull: [
              "$score",
              {
                $size: {
                  $filter: {
                    input: { $ifNull: ["$answers", []] },
                    as: "a",
                    cond: { $eq: ["$$a.isCorrect", true] },
                  },
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$rawScore" },
          maxScore: { $max: "$rawScore" },
          minScore: { $min: "$rawScore" },
          completedCount: { $sum: 1 },
        },
      },
    ]);

    const metrics = metricsAgg[0] || {
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      completedCount: 0,
    };

    // Aggregation: Calculate common mistakes from completed submissions
    const mistakesAgg = await TaskResult.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          task: taskObjectId,
          evaluationStatus: "completed",
        },
      },
      { $unwind: { path: "$answers", preserveNullAndEmptyArrays: false } },
      { $match: { "answers.isCorrect": false } },
      {
        $lookup: {
          from: "questions",
          localField: "answers.question",
          foreignField: "_id",
          as: "questionData",
        },
      },
      { $unwind: "$questionData" },
      {
        $group: {
          _id: "$questionData._id",
          questionText: { $first: "$questionData.question" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    // If you want total count of all mistakes:
    const commonMistakes = mistakesAgg.reduce((acc, m) => acc + m.count, 0);

    console.log(commonMistakes);
    // Fetch all task results (any status) for submission tracking
    const allResults = await TaskResult.find({
      student: { $in: studentIds },
      task: taskObjectId,
    })
      .populate({ path: "student", select: "_id name image" })
      .populate({ path: "task", select: "topic level category" })
      .populate({
        path: "answers.question",
        model: Question,
        select:
          "question heading questiontype media explanation matchThePairs options correctAnswer",
      })
      .sort({ createdAt: -1 })
      .lean();

    const studentsWithSubmissionIds = allResults.map((r: any) =>
      r.student._id.toString()
    );

    // Submitted students with task results
    const submittedStudents: SubmittedStudent[] = allResults.map((result: any) => ({
      _id: result.student._id,
      name: result.student.name,
      image: result.student.image || "/user.png",
      taskResult: {
        _id: result._id,
        answers: result.answers,
        task: result.task,
        score: result.score,
        evaluationStatus: result.evaluationStatus,
        createdAt: result.createdAt,
      },
    }));

    // Not submitted students
    const notSubmittedStudents: NotSubmittedStudent[] = students
      .filter((student) => !studentsWithSubmissionIds.includes(student._id.toString()))
      .map((student) => ({
        _id: student._id,
        name: student.name,
        image: student.image || "/user.png",
      }));

    const submission: DashboardSubmission = {
      submitted: submittedStudents,
      notSubmitted: notSubmittedStudents,
    };

    // Count pending submissions
    const pendingSubmissions = allResults.filter(
      (r: any) => r.evaluationStatus === "pending"
    ).length;

    // Build dashboard data response
    const dashboardData: DashboardData = {
      submission,
      metrics: {
        avgScore:
          totalQuestions > 0
            ? `${Math.round(metrics.avgScore ?? 0)}/${totalQuestions}`
            : Math.round(metrics.avgScore ?? 0),
        maxScore:
          totalQuestions > 0
            ? `${Math.round(metrics.maxScore ?? 0)}/${totalQuestions}`
            : Math.round(metrics.maxScore ?? 0),
        minScore:
          totalQuestions > 0
            ? `${Math.round(metrics.minScore ?? 0)}/${totalQuestions}`
            : Math.round(metrics.minScore ?? 0),
        totalSubmissions: `${allResults.length}/${totalStudents}`,
        completedSubmissions: `${metrics.completedCount}/${totalStudents}`,
        pendingSubmissions: `${pendingSubmissions}/${totalStudents}`,
        commonMistakes: `${commonMistakes}/${totalQuestions}`,
      },
    };

    return NextResponse.json(
      { success: true, data: dashboardData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Tasks dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}