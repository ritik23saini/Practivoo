import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from '@/utils/db';
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import Question from "@/models/Question";
import schooltask from "@/models/schooltask";

function badId(id?: string) {
  return !id || !mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /api/teacher/evaluate?taskId=<id>&classId=<id>
 * Auth: Authorization: Bearer <JWT>
 * 
 * Returns task evaluation data including:
 * - Task and class information
 * - Metrics (avg/max/min scores, submissions, common mistakes)
 * - Student submissions list
 * - Available class tabs for navigation
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId") || "";
    const classId = searchParams.get("classId") || "";

    if (badId(taskId) || badId(classId)) {
      return NextResponse.json(
        { error: "Valid taskId and classId are required" },
        { status: 400 }
      );
    }

    const taskObjId = new mongoose.Types.ObjectId(taskId);
    const classObjId = new mongoose.Types.ObjectId(classId);

    // 0) Authorize: class must belong to this teacher
    const cls = await ClassModel.findOne({ _id: classObjId, teachers: teacherId })
      .select({ name: 1, level: 1 })
      .lean<{ _id: Types.ObjectId; name: string; level: string }>();

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found for teacher" },
        { status: 404 }
      );
    }
    // 1) Load Task
    const schoolTaskData = await schooltask
      .findOne({ task: taskObjId })
      .populate({
        path: "task",
        model: Task,
        select: "topic category status questions createdAt",
        populate: {
          path: "questions",
          model: Question
        }
      })
      .select("term week level task")
      .lean<{
        _id: Types.ObjectId;
        term: number;
        level: string;
        week: number;
        task: {
          _id: Types.ObjectId;
          topic: string;
          category: string;
          status: "Assigned" | "Drafts";
          questions?: Types.ObjectId[];
          createdAt: Date;
        };
      }>();
    if (!schoolTaskData) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const totalQuestions = schoolTaskData?.task?.questions?.length ?? 0;

    // 2) Header metrics from TaskResult for this task+class
    const headerAgg = await TaskResult.aggregate([
      { $match: { task: taskObjId, classId: classObjId } },
      {
        $addFields: {
          rawScore: {
            $ifNull: [
              "$score",
              {
                $size: {
                  $filter: {
                    input: "$answers",
                    as: "a",
                    cond: { $eq: ["$$a.isCorrect", true] }
                  }
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$rawScore" },
          maxScore: { $max: "$rawScore" },
          minScore: { $min: "$rawScore" },
          totalSubmissions: { $sum: 1 }
        }
      }
    ]);

    const h = headerAgg[0] || {
      avgScore: null,
      maxScore: null,
      minScore: null,
      totalSubmissions: 0
    };

    // 3) Common mistakes
    const mistakesAgg = await TaskResult.aggregate([
      { $match: { task: taskObjId, classId: classObjId } },
      // Unwind answers to work with individual questions
      { $unwind: "$answers" },
      // Only keep incorrect answers
      { $match: { "answers.isCorrect": false } },
      // Group by question to count how many students got it wrong
      {
        $group: {
          _id: "$answers.question",
          wrongCount: { $sum: 1 }
        }
      },
      // Only keep questions where MORE THAN 1 student got it wrong (common mistakes)
      { $match: { wrongCount: { $gt: 1 } } },
      // Count the common mistakes
      {
        $group: {
          _id: null,
          commonMistakesCount: { $sum: 1 }
        }
      }
    ]);

    const commonMistakesCount = mistakesAgg[0]?.commonMistakesCount || 0;

    // 4) Class roster + per-student submission
    const students = await Student.aggregate([
      { $match: { class: classObjId } },
      {
        $lookup: {
          from: "taskresults",
          let: { sid: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$sid"] },
                    { $eq: ["$task", taskObjId] }
                  ]
                }
              }
            },
            {
              $addFields: {
                rawScore: {
                  $ifNull: [
                    "$score",
                    {
                      $size: {
                        $filter: {
                          input: "$answers",
                          as: "a",
                          cond: { $eq: ["$$a.isCorrect", true] }
                        }
                      }
                    }
                  ]
                }
              }
            },
            { $project: { _id: 1, rawScore: 1, evaluationStatus: 1, createdAt: 1 } }
          ],
          as: "res"
        }
      },
      { $addFields: { res: { $arrayElemAt: ["$res", 0] } } },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: 1,
          image: { $ifNull: ["$image", "/user.png"] },
          hasSubmission: { $toBool: "$res._id" },
          evaluationStatus: { $ifNull: ["$res.evaluationStatus", "pending"] },
          score: "$res.rawScore"
        }
      },
      { $sort: { name: 1 } }
    ]);

    const task = await schooltask.findOne({ task: taskObjId }).select("level")

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const tasklevel = task.level
    // 5) Tabs (all classes taught by this teacher)
    const tabs = await ClassModel.find({ teachers: teacherId, level: tasklevel }, { name: 1, level: 1 })
      .sort({ name: 1 })
      .lean<{ _id: Types.ObjectId; name: string, level: string }[]>();

    // 6) Return response
    return NextResponse.json({
      task: {
        id: schoolTaskData?.task._id.toString(),
        topic: schoolTaskData?.task.topic,
        level: schoolTaskData?.level,
        category: schoolTaskData?.task.category,
        status: schoolTaskData?.task.status,
        term: schoolTaskData?.term ?? null,
        week: schoolTaskData?.week ?? null,
        totalQuestions
      },
      class: {
        id: classObjId.toString(),
        name: cls.name,
        level: cls.level
      },
      metrics: {
        avgScore: totalQuestions
          ? `${h.avgScore !== null ? Math.round(h.avgScore) : 0}/${totalQuestions}`
          : null,
        maxScore: totalQuestions
          ? `${h.maxScore !== null ? Math.round(h.maxScore) : 0}/${totalQuestions}`
          : null,
        minScore: totalQuestions
          ? `${h.minScore !== null ? Math.round(h.minScore) : 0}/${totalQuestions}`
          : null,
        totalSubmissions: h.totalSubmissions,
        commonMistakes: `${commonMistakesCount}/${totalQuestions}` // FIXED
      },
      submissions: students.map(s => ({
        studentId: s.studentId.toString(),
        name: s.name,
        image: s.image,
        hasSubmission: s.hasSubmission,
        evaluationStatus: s.evaluationStatus,
        scoreLabel: s.hasSubmission && typeof s.score === "number" && totalQuestions
          ? `${s.score}/${totalQuestions}`
          : null
      })),
      tabs: tabs.map(t => ({ id: t._id.toString(), name: t.name, level: t.level })),
      questions: schoolTaskData.task.questions
    });
  } catch (err: any) {
    console.error(err);
    const msg = err?.message || "Server error";
    const status = /unauthorized/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
