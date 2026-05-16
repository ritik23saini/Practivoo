import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from '@/utils/db';
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import ClassModel from "@/models/Class";
import SchoolTask from "@/models/schooltask";
import { getTeacherIdFromAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);
    const teacherObjId = new mongoose.Types.ObjectId(teacherId);

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") ? Number(searchParams.get("term")) : undefined;
    const week = searchParams.get("week") ? Number(searchParams.get("week")) : undefined;
    const level = searchParams.get("level")?.trim() || undefined;
    const statusParam = (searchParams.get("status") || "pending").toLowerCase();
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)));

    // ---------- 1) Get classes taught by this teacher ---------- 
    const classMatchCondition: any = { teachers: teacherObjId };
    if (level) {
      classMatchCondition.level = level;
    }
    console.log(teacherId,level)
    const classes = await ClassModel.aggregate([
      { $match: classMatchCondition },
         {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "class",
            as: "students"
          }
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: 1,
            level: 1,
            school: 1,
            studentCount: { $size: "$students" }
          }
        },
        { $sort: { name: 1 } } 
    ]);
    console.log(classes)
    if (classes.length === 0) {
      return NextResponse.json({
        classes: [],
        report: null,
        evaluations: { items: [], page, limit, total: 0 }
      });
    }

    const teacherClassIds = classes.map(cls => cls.id);
    const schoolId = classes[0].school;

    // ---------- 2) Report - Count UNIQUE TASKS ----------
    const reportData = await TaskResult.aggregate([
      {
        $match: {
          classId: { $in: teacherClassIds },
          ...(term !== undefined && { term: term }),
          ...(week !== undefined && { week: week })
        }
      },
      {
        $group: {
          _id: {
            task: "$task",
            term: "$term",
            week: "$week"
          },
          evaluationStatuses: { $push: "$evaluationStatus" }
        }
      },
      {
        $addFields: {
          hasPending: { $in: ["pending", "$evaluationStatuses"] },
          hasCompleted: { $in: ["completed", "$evaluationStatuses"] }
        }
      },
      {
        $group: {
          _id: null,
          pendingCount: {
            $sum: { $cond: ["$hasPending", 1, 0] }
          },
          completedCount: {
            $sum: { $cond: ["$hasCompleted", 1, 0] }
          }
        }
      }
    ]);

    const { pendingCount = 0, completedCount = 0 } = reportData[0] || {};

    const report = {
      totalTasks: pendingCount + completedCount,
      pending: pendingCount,
      completed: completedCount,
      ...(term !== undefined && { term }),
      ...(week !== undefined && { week })
    };

    // ---------- 3) Get level-to-student mapping for correct totals ----------
    const levelStudentCounts = await ClassModel.aggregate([
      {
        $match: {
          _id: { $in: teacherClassIds },
          school: schoolId
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "class",
          as: "students"
        }
      },
      {
        $group: {
          _id: "$level",
          totalStudents: { $sum: { $size: "$students" } },
          classes: { $push: { id: "$_id", name: "$name", count: { $size: "$students" } } }
        }
      }
    ]);

    const levelStudentMap = levelStudentCounts.reduce((acc, item) => {
      acc[item._id] = {
        total: item.totalStudents,
        classes: item.classes
      };
      return acc;
    }, {});

    // ---------- 4) Get paginated evaluations with correct student counts ----------
    const getTaskEvaluationsPipeline = () => [
      {
        $match: {
          school: schoolId,
          ...(term !== undefined && { term: term }),
          ...(week !== undefined && { week: week }),
          ...(level && { level: level })
        }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskDoc"
        }
      },
      { $unwind: "$taskDoc" },
      {
        $match: {
          "taskDoc.status": "Assigned"
        }
      },
      {
        $lookup: {
          from: "taskresults",
          let: { taskId: "$task", termNum: "$term", weekNum: "$week" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$task", "$$taskId"] },
                    { $eq: ["$term", "$$termNum"] },
                    { $eq: ["$week", "$$weekNum"] },
                    { $in: ["$classId", teacherClassIds] }
                  ]
                }
              }
            }
          ],
          as: "taskResults"
        }
      },
      {
        $addFields: {
          received: { $size: "$taskResults" },
          firstClassId: {
            $arrayElemAt: ["$taskResults.classId", 0]
          },
          pendingCount: {
            $size: {
              $filter: {
                input: "$taskResults",
                cond: { $eq: ["$$this.evaluationStatus", "pending"] }
              }
            }
          },
          completedCount: {
            $size: {
              $filter: {
                input: "$taskResults",
                cond: { $eq: ["$$this.evaluationStatus", "completed"] }
              }
            }
          },
          hasPending: {
            $gt: [{
              $size: {
                $filter: {
                  input: "$taskResults",
                  cond: { $eq: ["$$this.evaluationStatus", "pending"] }
                }
              }
            }, 0]
          },
          hasCompleted: {
            $gt: [{
              $size: {
                $filter: {
                  input: "$taskResults",
                  cond: { $eq: ["$$this.evaluationStatus", "completed"] }
                }
              }
            }, 0]
          },
          avgScore: {
            $cond: [
              { $gt: [{ $size: "$taskResults" }, 0] },
              { $round: [{ $avg: "$taskResults.score" }, 0] },
              0
            ]
          }
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "firstClassId",
          foreignField: "_id",
          as: "classDoc"
        }
      },
      { $unwind: { path: "$classDoc", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { $and: [{ hasPending: true }, { $expr: { $eq: [statusParam, "pending"] } }] },
            { $and: [{ hasCompleted: true }, { $expr: { $eq: [statusParam, "completed"] } }] }
          ]
        }
      }
    ];

    // ---------- 5) Paginated evaluations ----------
    const [items, total] = await Promise.all([
      SchoolTask.aggregate([
        ...getTaskEvaluationsPipeline(),
        {
          $project: {
            _id: 0,
            taskId: "$task",
            topic: "$taskDoc.topic",
            category: "$taskDoc.category",
            level: 1,
            term: 1,
            week: 1,
            totalQuestions: { $size: { $ifNull: ["$taskDoc.questions", []] } },
            received: 1,
            pendingCount: 1,
            completedCount: 1,
            avgScore: 1,
            classId: "$firstClassId",
            className: "$classDoc.name",
            status: statusParam,
          }
        },
        { $sort: { term: -1, week: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]),
      SchoolTask.aggregate([
        ...getTaskEvaluationsPipeline(),
        { $count: "n" }
      ]).then(r => r?.[0]?.n || 0)
    ]);

    // ---------- 6) Add student counts from level mapping ----------
    const enrichedItems = items.map(item => {
      const levelData = levelStudentMap[item.level];
      return {
        ...item,
        submissions: {
          received: item.received,
          total: levelData?.total || 0,
        }
      };
    });



    return NextResponse.json({
      classes,
      report,
      evaluations: {
        items: enrichedItems,
        page,
        limit,
        total
      }
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({
      error: err?.message || "Server error"
    }, {
      status: err?.status || 500
    });
  }
}