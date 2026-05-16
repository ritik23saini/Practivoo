import  { verifySchoolAuth } from "@/lib/verifyAuth";
import schooltask from "@/models/schooltask";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import { connectDB } from "@/utils/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,

) {
     const authRes = await verifySchoolAuth();
    if (authRes instanceof NextResponse) {
        return authRes;
    }
    const schoolId = authRes.user._id;
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(schoolId)) {
            return NextResponse.json(
                { success: false, error: "Invalid school ID" },
                { status: 400 }
            );
        }

        const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

        // Find all school tasks and populate
        const schoolTasks = await schooltask
            .find({ school: schoolObjectId })
            .populate({ path: "task", model: Task })
            .lean();
        console.log("schoolTasks", schoolTasks)
        // Filter for assigned tasks and remove duplicates
        const taskMap = new Map();

        schoolTasks.forEach((st: any) => {
            if (st.task && st.task.status === "Assigned") {
                const taskId = st.task._id.toString();

                // Only add if not already in map (ensures uniqueness)
                if (!taskMap.has(taskId)) {
                    taskMap.set(taskId, {
                        _id: st.task._id,
                        category: st.task.category || "",
                        createdAt: st.task.createdAt || st.createdAt,
                        level: st.level || "",
                        status: st.task.status || "",
                        term: st.term,
                        topic: st.task.topic || "",
                        totalquestions: st.task.questions?.length || 0,
                        week: st.week,
                        __v: st.__v
                    });
                }
            }
        });

        // Convert map to array
        const uniqueAssignedTasks = Array.from(taskMap.values());

        return NextResponse.json(uniqueAssignedTasks, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching task results:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
