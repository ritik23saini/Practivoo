import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from '@/utils/db';
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import Notification from "@/models/Notification";
import SchoolTask from "@/models/schooltask";

// Define interfaces
interface ITask {
    _id: Types.ObjectId;
    topic: string;
    level: string;
    category: string;
    postQuizFeedback: boolean;
    status: "Assigned" | "Drafts";
    questions: any[];
    createdAt: Date;
}

interface ISchoolTask {
    _id: Types.ObjectId;
    task: Types.ObjectId | ITask; // Can be either ObjectId or populated Task
    school: Types.ObjectId;
    term?: number;
    week?: number;
}

function badId(id?: string) {
    return !id || !mongoose.Types.ObjectId.isValid(id);
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const teacherId = getTeacherIdFromAuth(req);
        const body = await req.json();

        const { taskId, classId, message } = body;//
        if (badId(taskId) || badId(classId)) {
            return NextResponse.json({ error: "Valid taskId and classId are required" }, { status: 400 });
        }
        const taskObjId = new mongoose.Types.ObjectId(taskId);//68ee229f5c28e24a45efe858
        const classObjId = new mongoose.Types.ObjectId(classId);//68fca0b7be4310bd7e59287b

        // 1) Authorize: class must belong to this teacher
        const cls = await ClassModel.findOne({ _id: classObjId, teachers: teacherId })
            .select({ name: 1, level: 1, school: 1 })
            .lean<{ _id: Types.ObjectId; name: string; level: string; school: Types.ObjectId }>();

        if (!cls) {
            return NextResponse.json({ error: "Class not found for teacher" }, { status: 404 });
        }

        // 2) Get school task details with term and week
        const schoolTask = await SchoolTask.findOne({
            task: taskObjId,
            school: cls.school,
        })
            .populate({ path: 'task', model: Task })
            .lean<ISchoolTask>();

        if (!schoolTask) {
            return NextResponse.json({ error: "School task not found for this term and week" }, { status: 404 });
        }

        // Type guard to check if task is populated
        if (!schoolTask.task || typeof schoolTask.task === 'object' && '_id' in schoolTask.task === false) {
            return NextResponse.json({ error: "Task details not found" }, { status: 404 });
        }

        const taskDetails = schoolTask.task as ITask;

        if (!taskDetails || taskDetails.status !== "Assigned") {
            return NextResponse.json({ error: "Task is not assigned" }, { status: 400 });
        }

        // 3) Find students without submissions using aggregation
        const studentsWithoutSubmissions = await Student.aggregate([
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
                                        { $eq: ["$task", taskObjId] },
                                        { $eq: ["$classId", classObjId] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "submissions"
                }
            },
            // Filter students with no submissions
            { $match: { submissions: { $size: 0 } } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1
                }
            }
        ]);

        if (studentsWithoutSubmissions.length === 0) {
            return NextResponse.json({
                message: "All students have already submitted this task",
                remindersSent: 0
            });
        }

        // 4) Check if notification exists in last 12 hours for ANY student in this class
        const last12Hours = new Date(Date.now() - 12 * 60 * 60 * 1000);

        // Get all student IDs from this class
        const studentIds = studentsWithoutSubmissions.map(s => s._id);

        // Create a unique identifier in the message that includes school-specific info
        const schoolTaskIdentifier = `task_${taskObjId}_class_${classObjId}`;

        const existingNotification = await Notification.findOne({
            type: "reminder",
            refId: taskObjId,
            refModel: "Task",
            receiver: { $in: studentIds },
            message: { $regex: schoolTaskIdentifier.replace(/_/g, '.*') },
            createdAt: { $gte: last12Hours }
        });

        if (existingNotification) {
            return NextResponse.json({
                message: "Reminder already sent to this class. Wait 12 hours for next reminder.",
                success: true
            });
        }

        // 5) Create default reminder message with unique identifier embedded
        const defaultMessage = message ||
            `Hi! Please don't forget to submit your "${taskDetails.topic}" for ${cls.name}. Your submission is still pending. [${schoolTaskIdentifier}]`;

        // 6) Create notifications using your existing schema structure
        const notifications = studentsWithoutSubmissions.map(student => ({
            receiver: student._id,
            title: "Task Submission Reminder",
            type: "reminder" as const,
            message: defaultMessage,
            refId: taskObjId,
            refModel: "Task" as const,
            isRead: false,
            createdAt: new Date()
        }));

        // 7) Bulk insert notifications
        const insertedNotifications = await Notification.insertMany(notifications);

        // 8) Return detailed response
        return NextResponse.json({

            success: true,
            message: `Reminder sent successfully to ${insertedNotifications.length} student`,
            sentNotifiaction: insertedNotifications.length,
            studentsNotified: studentsWithoutSubmissions.map(s => s.name),
        });

    } catch (err: any) {
        console.error("Error sending reminders:", err);
        const msg = err?.message || "Server error";
        const status = /unauthorized/i.test(msg) ? 401 : 500;
        return NextResponse.json({ error: msg }, { status });
    }
}