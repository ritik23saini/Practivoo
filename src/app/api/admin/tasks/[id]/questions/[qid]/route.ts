import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Task from "@/models/Task";
import { connectDB } from "@/utils/db";
import verifyAdminAuth from "@/lib/verifyAuth";

export async function DELETE(_req: Request, context: any) {
  const authRes = await verifyAdminAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const { id, qid } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(qid)) {
    return NextResponse.json({ success: false, message: "Invalid ids" }, { status: 400 });
  }

  const updated = await Task.findByIdAndUpdate(
    id,
    { $pull: { questions: qid } },
    { new: true }
  ).populate("questions");

  if (!updated) return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
  return NextResponse.json({ success: true, task: updated });
}