import { verifySchoolAuth } from "@/lib/verifyAuth";
import schooltask from "@/models/schooltask";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import { connectDB } from "@/utils/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest
) {

    const authRes = await verifySchoolAuth();
    if (authRes instanceof NextResponse) {
        return authRes;
    }
    const schoolId = authRes.user._id;
    try {
        await connectDB();
        const { taskIds } = await req.json();
        console.log(taskIds)
        if (!taskIds || taskIds.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Task IDs are required"
            }, { status: 400 });
        }

        // First, get all students from this school
        const students = await Student.find({ school: schoolId })
            .select("_id")
            .lean();

        /*  if (students.length === 0) {
             return NextResponse.json([], { status: 200 });
         } */

        const studentIds = students.map(student => student._id);
        const ifsubmitted = await TaskResult.find({
            task: { $in: taskIds },
            student: { $in: studentIds },
        });
        console.log(ifsubmitted)
        if (ifsubmitted.length != 0) {
            console.log("Already assigned to student ")
            return NextResponse.json({ message: "Task in use by student " }, { status: 400 });
        }

        const assignedTask = await schooltask.deleteMany(
            { _id: { $in: taskIds } }
        )

        console.log(assignedTask)

        return NextResponse.json({
            message: "Task unassigned successfully",
        });

    } catch (error) {
        console.error("Error deleting task results:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const authRes = await verifySchoolAuth();
    if (authRes instanceof NextResponse) {
        return authRes;
    }
    const schoolId = authRes.user._id;

    await connectDB();

    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

    // Get all task IDs that are already assigned to this school
    const schoolAssignedTasks = await schooltask
        .find({ school: schoolObjectId })
        .select("-school")
        .populate({
            path: 'task',
            populate: {
                path: 'questions',
                model: 'Question'
            }
        })
        .lean();



    return NextResponse.json({
        tasks: schoolAssignedTasks,
        count: schoolAssignedTasks.length
    });
}
