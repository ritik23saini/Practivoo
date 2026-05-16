// /api/admin/tasks/[id]/assign-questions/route.ts

import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import { NextRequest, NextResponse } from 'next/server';
import  verifyAdminAuth  from "@/lib/verifyAuth";
export async function PATCH(req: NextRequest, context: any) {
 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const body = await req.json(); // expects { questionIds: [...] }
  const { params } = await context;
  const updatedTask = await Task.findByIdAndUpdate(
    params.id,
    { $addToSet: { questions: { $each: body.questionIds } } },
    { new: true }
  );

  return NextResponse.json({ success: true, task: updatedTask });
}