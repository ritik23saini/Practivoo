import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from '@/utils/db';
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import TaskResult from "@/models/TaskResult";

type TaskResultLean = {
  _id: Types.ObjectId;
  evaluationStatus: "pending" | "completed";
};

const isBad = (id?: string | null) => !id || !mongoose.Types.ObjectId.isValid(id);

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);

    const { taskId, studentId, classId, evaluationStatus } = await req.json();

    if (isBad(taskId) || isBad(studentId) || isBad(classId)) {
      return NextResponse.json({ error: "Valid taskId, studentId, classId are required" }, { status: 400 });
    }
    if (!["pending", "completed"].includes(evaluationStatus)) {
      return NextResponse.json({ error: "evaluationStatus must be 'pending' or 'completed'" }, { status: 400 });
    }

    const classDoc = await ClassModel.findOne({
      _id: new mongoose.Types.ObjectId(classId),
      teachers: teacherId,
    }).select({ _id: 1 });
    if (!classDoc) return NextResponse.json({ error: "Class not found for teacher" }, { status: 404 });

    const updated = await TaskResult.findOneAndUpdate(
  {
    task: new mongoose.Types.ObjectId(taskId),
    student: new mongoose.Types.ObjectId(studentId),
    classId: classDoc._id,
  },
  { $set: { evaluationStatus } },
  { new: true, projection: { evaluationStatus: 1 } } // optional: only return what you need
).lean<TaskResultLean | null>();

    if (!updated) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    return NextResponse.json({
      ok: true,
      resultId: updated._id.toString(),
      evaluationStatus: updated.evaluationStatus,
    });
  } catch (err: any) {
    console.error(err);
    const msg = err?.message || "Server error";
    const status = /unauthorized/i.test(msg) ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}