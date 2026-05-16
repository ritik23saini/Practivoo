import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/db";
import { getTeacherIdFromAuth } from "@/lib/auth";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import Task from "@/models/Task";
import TaskResult from "@/models/TaskResult";
import SchoolTask from "@/models/schooltask";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const teacherId = getTeacherIdFromAuth(req);
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") ? Number(searchParams.get("term")) : undefined;
    const week = searchParams.get("week") ? Number(searchParams.get("week")) : undefined;

    if (term === undefined || week === undefined) {
      return NextResponse.json({ error: "Term and week are required" }, { status: 400 });
    }

    const teacherObjId = new mongoose.Types.ObjectId(teacherId);

    // Get all classes with student counts
    const allClasses = await ClassModel.aggregate([
      { $match: { teachers: { $in: [teacherObjId] } } },
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
          id: { $toString: "$_id" },
          name: 1,
          level: 1,
          school: 1,
          studentCount: { $size: "$students" }
        }
      },
      { $sort: { level: 1, name: 1 } }
    ]);

    if (allClasses.length === 0) {
      return NextResponse.json({ error: "No classes found for teacher" }, { status: 404 });
    }

    const schoolId = allClasses[0].school;
    const classIds = allClasses.map(cls => new mongoose.Types.ObjectId(cls.id));
    const uniqueClassNames = [...new Set(allClasses.map(c => c.name))].sort();
    const uniqueLevels = [...new Set(allClasses.map(c => c.level))].sort();

    // Get all tasks for term/week that have submissions from this teacher's classes
    const schoolTasks = await SchoolTask.aggregate([
      {
        $match: {
          school: schoolId,
          term,
          week
        }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "task"
        }
      },
      { $unwind: "$task" },
      {
        $lookup: {
          from: "taskresults",
          let: { taskId: "$task._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$task", "$$taskId"] },
                    { $in: ["$classId", classIds] }, // Only submissions from teacher's classes
                    { $eq: ["$evaluationStatus", "completed"] }
                  ]
                }
              }
            }
          ],
          as: "submissions"
        }
      },
      // Only include school tasks that have submissions
      { $match: { submissions: { $ne: [] } } },
      {
        $project: {
          _id: 1,
          school: 1,
          term: 1,
          week: 1,
          task: 1,
          level: 1
        }
      }
    ]);
    console.log(schoolTasks)
    const taskIds = schoolTasks.map((st: any) => st.task?._id).filter(Boolean);


    const [results] = await TaskResult.aggregate([
      {
        $match: {
          classId: { $in: classIds },
          task: { $in: taskIds },
          evaluationStatus: "completed"
        }
      },
      {
        $facet: {
          // Student scores by class
          studentScores: [
            {
              $group: {
                _id: { classId: "$classId", studentId: "$student" },
                totalScore: { $sum: "$score" }
              }
            },
            {
              $lookup: {
                from: "students",
                localField: "_id.studentId",
                foreignField: "_id",
                as: "s"
              }
            },
            { $unwind: "$s" },
            {
              $lookup: {
                from: "classes",
                localField: "_id.classId",
                foreignField: "_id",
                as: "c"
              }
            },
            { $unwind: "$c" },
            {
              $project: {
                classId: { $toString: "$_id.classId" },
                classLevel: "$c.level",
                studentId: { $toString: "$s._id" },
                studentName: "$s.name",
                image: "$s.image",
                gender: "$s.gender",
                totalScore: 1
              }
            }
          ],
          // Per-task scores for min/max calculation
          taskScores: [
            {
              $group: {
                _id: "$task",
                taskScore: { $sum: "$score" },
                submissions: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "_id",
                as: "t"
              }
            },
            { $unwind: "$t" },
            {
              $project: {
                taskId: { $toString: "$_id" },
                taskScore: 1,
                submissions: 1,
                totalQuestions: { $size: { $ifNull: ["$t.questions", []] } }
              }
            }
          ],
          // Total submissions count
          totalSubmissions: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ],
          /*   // Common mistakes
            commonMistakes: [
              { $unwind: "$answers" },
              { $match: { "answers.isCorrect": false } },
              { $group: { _id: "$answers.question", wrongCount: { $sum: 1 } } },
              { $match: { wrongCount: { $gt: 1 } } },
              { $count: "count" }
            ], */
          // Task submissions by class
          taskSubmissions: [
            {
              $group: {
                _id: { task: "$task", classId: "$classId" },
                submissions: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: "classes",
                localField: "_id.classId",
                foreignField: "_id",
                as: "c"
              }
            },
            { $unwind: "$c" },
            {
              $project: {
                taskId: { $toString: "$_id.task" },
                classId: { $toString: "$_id.classId" },
                className: "$c.name",
                classLevel: "$c.level",
                submissions: 1
              }
            }
          ]
        }
      }
    ]);

    // Build level-based leaderboard
    const levelMap: Record<string, { level: string; classes: any[] }> = {};

    allClasses.forEach(cls => {
      if (!levelMap[cls.level]) {
        levelMap[cls.level] = { level: cls.level, classes: [] };
      }
      levelMap[cls.level].classes.push({
        classId: cls.id,
        className: cls.name,
        overallScore: 0,
        studentCount: cls.studentCount,
        students: []
      });
    });

    // Populate students
    results.studentScores?.forEach((student: any) => {
      const levelData = levelMap[student.classLevel];
      if (levelData) {
        const classData = levelData.classes.find((c: any) => c.classId === student.classId);
        if (classData) {
          classData.students.push({
            rank: 0,
            studentId: student.studentId,
            studentName: student.studentName,
            image: student.image,
            gender: student.gender,
            totalScore: student.totalScore
          });
          classData.overallScore += student.totalScore;
        }
      }
    });

    // Rank students
    Object.values(levelMap).forEach(levelData => {
      levelData.classes.forEach(classData => {
        classData.students.sort((a: any, b: any) =>
          b.totalScore !== a.totalScore ? b.totalScore - a.totalScore : a.studentName.localeCompare(b.studentName)
        );
        let prevScore: number | null = null;
        let currentRank = 0;
        classData.students.forEach((student: any, idx: number) => {
          if (student.totalScore !== prevScore) {
            currentRank = idx + 1;
            prevScore = student.totalScore;
          }
          student.rank = currentRank;
        });
      });
    });

    // Calculate metrics based on tasks
    const taskScores = results.taskScores || [];
    const totalSubmissionsReceived = results.totalSubmissions[0]?.count || 0;
    /*     const commonMistakesCount = results.commonMistakes[0]?.count || 0;
     */
    // Find min/max task scores and their questions
    let minTaskScore = 0;
    let maxTaskScore = 0;
    let minTaskQuestions = 0;
    let maxTaskQuestions = 0;
    let avgScore = 0;
    let avgQuestions = 0;

    if (taskScores.length > 0) {
      // Calculate average across all tasks
      const totalScore = taskScores.reduce((sum: number, t: any) => sum + t.taskScore, 0);
      const totalQuestions = taskScores.reduce((sum: number, t: any) => sum + t.totalQuestions, 0);
      avgScore = Math.round(totalScore / taskScores.length);
      avgQuestions = Math.round(totalQuestions / taskScores.length);

      // Find min and max scoring tasks
      const minTask = taskScores.reduce((min: any, t: any) =>
        t.taskScore < min.taskScore ? t : min
      );
      const maxTask = taskScores.reduce((max: any, t: any) =>
        t.taskScore > max.taskScore ? t : max
      );

      minTaskScore = minTask.taskScore;
      minTaskQuestions = minTask.totalQuestions;
      maxTaskScore = maxTask.taskScore;
      maxTaskQuestions = maxTask.totalQuestions;
    }

    // Build task list
    const taskList = schoolTasks.flatMap((st: any) => {
      if (!st.task) return [];
      const taskSubmissions = results.taskSubmissions?.filter((ts: any) =>
        ts.taskId === st.task._id.toString()
      ) || [];

      return taskSubmissions.length > 0 && taskSubmissions.map((ts: any) => ({
        taskId: ts.taskId,
        topic: st.task.topic,
        category: st.task.category,
        totalQuestions: st.task.questions?.length || 0,
        submissions: ts.submissions,
        className: ts.className,
        classLevel: ts.classLevel,
        classId: ts.classId
      }))

    });

    return NextResponse.json({
      termWeek: { term, week },
      tabs: { classNames: uniqueClassNames, levels: uniqueLevels },
      leaderboard: Object.values(levelMap),
      metrics: {
        /*         
        avgScore: avgQuestions > 0 ? `${avgScore}/${avgQuestions}` : "0/0",
        minScore: minTaskQuestions > 0 ? `${minTaskScore}/${minTaskQuestions}` : "0/0",
        maxScore: maxTaskQuestions > 0 ? `${maxTaskScore}/${maxTaskQuestions}` : "0/0",
        */
        avgScore: "-",
        maxScore: "-",
        minScore: "-",
        totalSubmissions: `${totalSubmissionsReceived}`,
        totalTask: taskList.length,
/*         commonMistakes: `${commonMistakesCount}/${avgQuestions}`
 */      },
      tasks: taskList
    });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: /unauthorized/i.test(err?.message) ? 401 : 500 }
    );
  }
}