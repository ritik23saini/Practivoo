import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import Question from '@/models/Question';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose'; // 👈 Import mongoose Types


export async function GET(req: NextRequest, context: any) {
  await connectDB();
  const { id } =await context.params;
  try {
     //console.log(await Question.find({}));
    const task = await Task.findById(new mongoose.Types.ObjectId(String(id))).populate('questions').lean();

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (err) {
    console.error('[FETCH_TASK_ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}