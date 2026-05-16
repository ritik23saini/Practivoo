import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import School from '@/models/School';
import Task from '@/models/Task';
import Issue from '@/models/Issue'; // Optional, based on your structure
import verifyAdminAuth from "@/lib/verifyAuth";
export async function GET() {

  const authRes = await verifyAdminAuth();

  if (authRes instanceof NextResponse) {
    return authRes;
  }
  try {

    await connectDB();

    const totalSchools = await School.countDocuments();
    const issues = await Issue.countDocuments(); // Optional: if issues are stored
    const recentTasks = await Task.find({})
      .sort({ createdAt: -1 })
      //.limit(10)
      .select('topic type questions'); // Adjust fields based on your schema

    const recentTasks1 = await Task.find({})
      .sort({ createdAt: -1 })
     // .limit(10); // Adjust fields based on your schema

    const schools = await School.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name image');

    return NextResponse.json({
      stats: {
        totalSchools,
        issues,
      },
      tasks: recentTasks.map(task => ({
        title: `${task.topic} (${task.questions?.length || 0} Ques.)`,
        type: task.type,
      })),
      schools,
      recentTasks: recentTasks1
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
