import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import Question from '@/models/Question';
import { NextRequest, NextResponse } from 'next/server';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import Notification from '@/models/Notification';
import School from '@/models/School';
import  verifyAdminAuth  from "@/lib/verifyAuth";
export async function GET() {
 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  //console.log(Question.find({}));
  const tasks = await Task.find().sort({ createdAt: -1 }).populate('questions');
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  await connectDB();
 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const body = await req.json();
  const task = await Task.create(body);
  console.log(body)

  return NextResponse.json({ success: true, taskData: task }, { status: 200 });
}