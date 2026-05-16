import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import { NextRequest, NextResponse } from 'next/server';
import TaskResult from '@/models/TaskResult';
import Question from '@/models/Question';
import Notification from '@/models/Notification';
import School from '@/models/School';
import  verifyAdminAuth  from "@/lib/verifyAuth";


// PUT /api/admin/tasks/[id]
export async function PUT(req: NextRequest, context: any) {

 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();

  const { id } = await context.params;
  const body = await req.json();

  const task = await Task.findByIdAndUpdate(id, { topic: body.topic, category: body.category }, { new: true });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task }, { status: 200 });
}

// DELETE /api/admin/tasks/[id]
export async function DELETE(_: NextRequest, context: any) {
 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();

  const { id } = await context.params;

  const count = await TaskResult.countDocuments({ task: id });
  if (count > 0) {
    return NextResponse.json({ success: false, message: "Task is in use and can't be deleted." }, { status: 400 });
  }

  const deleted = await Task.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Task deleted" }, { status: 200 });
}


export async function PATCH(req: NextRequest, context: any) {
  await connectDB();
 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const { params } = await context;
  const task = await Task.findById(params.id);

  // Check if task is in use (has results)
  const count = await TaskResult.countDocuments({ task: params.id });
  if (count > 0) {
    return NextResponse.json(
      { success: false, message: "Task is in use and its status cannot be changed." },
      { status: 400 }
    );
  }

  if (!task) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
  }

  // Store old status before changing
  const oldStatus = task.status;

  // Toggle status between 'Assigned' and 'Drafts'
  task.status = task.status === 'Assigned' ? 'Drafts' : 'Assigned';
  task.createdAt = new Date();
  await task.save();

  // Get all schools
  const allSchools = await School.find({}).select("_id");
  const schoolIds = allSchools.map(s => s._id);

  // Handle notifications based on status change
  if (task.status === 'Assigned') {
    // Task changed from Drafts to Assigned - Send notifications

    // Check which schools already have notifications for this task
    const alreadyNotified = await Notification.find({
      refId: task._id,
      receiver: { $in: schoolIds }
    }).select("receiver");

    // Get list of school IDs that already have notifications
    const notifiedSchoolIds = alreadyNotified.map(n => n.receiver.toString());

    // Filter schools that don't have notifications yet
    const schoolsToNotify = allSchools.filter(
      school => !notifiedSchoolIds.includes(school._id.toString())
    );

    // Create notifications only for schools that haven't been notified
    if (schoolsToNotify.length > 0) {
      const notifications = schoolsToNotify.map((school) => ({
        receiver: school._id,
        type: "TASK",
        message: `New task assigned: ${task.topic}`,
        refId: task._id,
        refModel: "Task",
      }));

      await Notification.insertMany(notifications);
      console.log(`Sent ${notifications.length} notifications for task assignment`);
    } else {
      console.log("All schools already notified for this task");
    }

  } else if (task.status === 'Drafts' && oldStatus === 'Assigned') {
    // Task changed from Assigned to Drafts - Delete all related notifications

    const deleteResult = await Notification.deleteMany({
      refId: task._id,
      receiver: { $in: schoolIds },
      type: "TASK"
    });

    console.log(`Deleted ${deleteResult.deletedCount} notifications for task ${task._id}`);
  }

  return NextResponse.json({ success: true, task }, { status: 200 });
}
