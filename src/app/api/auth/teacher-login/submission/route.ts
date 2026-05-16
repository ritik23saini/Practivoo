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

const isBad = (id?: string | null) => !id || !mongoose.Types.ObjectId.isValid(id);

type TaskLean = {
  _id: Types.ObjectId;
  topic: string;
  level: string;
  category: string;
  status: "Assigned" | "Drafts";
  term?: number;
  week?: number;
  questions?: Types.ObjectId[];
};

type StudentLean = { _id: Types.ObjectId; name: string; image?: string };

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);

    const sp = new URL(req.url).searchParams;
    const taskId = sp.get("taskId"); //68c6a8fb331c0a1f8f5af512
    const studentId = sp.get("studentId");// 6875200282dbd56e9844109a 68bb232c2bdb426752b1d2ef
    const classId = sp.get("classId"); //6872eac5ec1d3ea5ad93245f

    if (isBad(taskId) || isBad(studentId) || isBad(classId)) {
      return NextResponse.json({ error: "Valid taskId, studentId, and classId are required" }, { status: 400 });
    }
    const taskObjId = new mongoose.Types.ObjectId(taskId!);
    const studentObjId = new mongoose.Types.ObjectId(studentId!);
    const classObjId = new mongoose.Types.ObjectId(classId!);

    // Authorize: the class must be taught by this teacher

    const cls = await ClassModel.findOne({ _id: classObjId, teachers: teacherId })
      .select({ name: 1, level: 1 })
      .lean<{ _id: Types.ObjectId; name: string; level: string }>();

    if (!cls) return NextResponse.json({ error: "Class not found for teacher" }, { status: 404 });

    // Student must belong to this class
    const student = await Student.findOne({ _id: studentObjId, class: classObjId })
      .select({ name: 1, image: 1 })
      .lean<StudentLean>();
    if (!student) return NextResponse.json({ error: "Student not in class" }, { status: 404 });
    // Task
    //school assigned task
    const schoolTaskData = await schooltask
      .findOne({ task: taskObjId })
      .populate({
        path: "task",
        model: Task,
        populate: {
          path: "questions",
          model: Question
        }
      })
      .lean<any>();
    console.log("schoolTaskData", schoolTaskData)

    const totalQuestions = schoolTaskData?.task.questions?.length ?? 0;

    // Result for this student
    const result = await TaskResult.findOne({
      task: taskObjId,
      student: studentObjId,
      classId: classObjId,
    })
      .select({ answers: 1, score: 1, evaluationStatus: 1, createdAt: 1 })
      .lean<{ answers?: { question: Types.ObjectId; selected?: string; isCorrect?: boolean }[]; score: number; evaluationStatus: "pending" | "completed"; createdAt: Date } | null>();

    if (!result) {
      // No submission yet
      return NextResponse.json({
        task: {
          id: schoolTaskData?._id.toString(),
          topic: schoolTaskData?.task.topic,
          totalQuestions,
          term: schoolTaskData?.term ?? null,
          week: schoolTaskData?.week ?? null,
        },
        class: { id: cls._id.toString(), name: cls.name, level: cls.level },
        student: { id: student._id.toString(), name: student.name, image: student.image ?? "/user.png" },
        submission: null,
        metrics: {
          totalScore: 0,
          correctCount: 0,
          wrongCount: 0,
          totalQuestions,
          evaluationStatus: "pending",
        },
        questions: (schoolTaskData?.task.questions ?? []).map((qid: Types.ObjectId, i: number) => ({
          number: i + 1,
          questionId: qid.toString(),
          isAnswered: false,
          option: [],
          isCorrect: null as boolean | null,
          selected: null as string | null,
        })),
      });
    }

    // Build a quick lookup for answers by question id
    const ansByQ = new Map<string, { isCorrect?: boolean; selected?: string }>();
    for (const a of result.answers ?? []) ansByQ.set(a.question.toString(), { isCorrect: a.isCorrect, selected: a.selected });


    let correctCount = 0;
    let answeredCount = 0;

    const questions = (schoolTaskData?.task.questions ?? []).map((q: any, index: number) => {
      const key = q._id?.toString?.() ?? q.toString();
      const a = ansByQ.get(key);
      const isAnswered = !!a;
      const isCorrect = a?.isCorrect ?? null;
      if (isAnswered) answeredCount++;
      if (isCorrect === true) correctCount++;
      return {
        number: index + 1,
        questionId: q._id?.toString?.() ?? q.toString(),
        questionText: q.question || "",
        questionType: q.questionType || "",
        options: q.options || [],
        ActualAnswer: q.correctAnswer || [],
        isAnswered,
        isCorrect,
        selected: a?.selected ?? null,
      };
    });

    // If score was stored, use it; otherwise derive from correctCount
    const totalScore = typeof result.score === "number" ? result.score : correctCount;
    const wrongCount = totalQuestions ? totalQuestions - correctCount : Math.max(0, answeredCount - correctCount);

    return NextResponse.json({
      task: {
        id: schoolTaskData?.task._id.toString(),
        topic: schoolTaskData?.task.topic,
        totalQuestions,
        term: schoolTaskData?.term ?? null,
        week: schoolTaskData?.week ?? null,
      },
      class: { id: cls._id.toString(), name: cls.name, level: cls.level },
      student: { id: student._id.toString(), name: student.name, image: student.image ?? "/user.png" },
      submission: {
        createdAt: result.createdAt,
        evaluationStatus: result.evaluationStatus,
      },
      metrics: {
        totalScore,
        correctCount,
        wrongCount,
        totalQuestions,
        // for your donut-style header: strings like "18/20"
        correctLabel: `${correctCount}/${totalQuestions}`,
        wrongLabel: `${wrongCount}/${totalQuestions}`,
        totalScoreLabel: `${totalScore}`,
      },
      questions,
    });

  } catch (err: any) {
    console.error(err);
    const msg = err?.message || "Server error";
    const status = /unauthorized/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}