import { School } from 'lucide-react';
import { connectDB } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from 'mongoose';
import schooltask from '@/models/schooltask';
import Task from '@/models/Task';
import Question from '@/models/Question';
import { verifySchoolAuth } from '@/lib/verifyAuth';

export async function POST(
    req: NextRequest,

) {
     const authRes = await verifySchoolAuth();
    if (authRes instanceof NextResponse) {
        return authRes;
    }
    const schoolId = authRes.user._id;
    try {
        await connectDB();
        const { taskIds, week, term, level } = await req.json();

        console.log(schoolId, taskIds)

        if (!mongoose.Types.ObjectId.isValid(schoolId)) {
            return NextResponse.json(
                { success: false, error: "Invalid school ID" },
                { status: 400 }
            );
        }

        if (!taskIds || taskIds.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Task IDs are required"
            }, { status: 400 });
        }

        if (!term || !week! || !level) {
            return NextResponse.json({
                success: false,
                message: "Level ,Term and week are required"
            }, { status: 400 });
        }

        console.log(taskIds, week, term);

        // Check if tasks are already assigned to this school, term, and week
        const existingTasks = await schooltask.find({
            school: schoolId,
            task: { $in: taskIds },
            term: term,
            week: week,
            level
        }).select('task');

        if (existingTasks.length > 0) {
            const existingTaskIds = existingTasks.map(t => t.task.toString());
            return NextResponse.json({
                success: false,
                message: `Some tasks are already assigned: ${existingTaskIds.join(', ')}`
            }, { status: 400 });
        }

        // Create an array of documents to insert (one per task)
        const documentsToCreate = taskIds.map((taskId: string) => ({
            school: schoolId,
            task: taskId,
            term,
            week,
            level
        }));

        // Use insertMany for better performance with multiple documents
        const result = await schooltask.insertMany(documentsToCreate);

        console.log(`Created ${result.length} school task assignments`);

        return NextResponse.json({
            success: true,
            message: `Successfully assigned ${result.length} tasks`,
        }, { status: 200 });

    } catch (error) {
        console.error("Error assigning tasks:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error occurred. Please try again later."
        }, { status: 500 });
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
        .select('task')
        .lean();

    // Extract the task IDs into an array
    const assignedTaskIds = schoolAssignedTasks.map((st) => st.task.toString());

    const unassignedTasks = await Task.find({
        _id: { $nin: assignedTaskIds },
        status: "Assigned"
    })
        .populate({ path: "questions", model: Question })
        .lean();
    console.log(unassignedTasks)
    return NextResponse.json({
        tasks: unassignedTasks,
        count: unassignedTasks.length
    });
}
