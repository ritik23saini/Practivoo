import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import Question from '@/models/Question';
import TaskResult from '@/models/TaskResult';
import Student from '@/models/Student';
import Class from '@/models/Class';
import { verifyToken } from '@/utils/verifyToken';
import { Types } from 'mongoose';

export async function GET(req: NextRequest, context: any) {
    await connectDB();
    const { id } = context.params; // no await here

    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term");
    const week = searchParams.get("week");

    const termNum = term ? Number(term) : undefined;
    const weekNum = week ? Number(week) : undefined;

    try {
        const decoded = verifyToken(req);
        const student = await Student.findById(decoded.id);
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
        }

        const task = await Task.findById(id);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Fetch single result for student and task
        const result = await TaskResult.findOne({ student: student._id, task: id }).populate({
            path: "answers.question",
            model: Question
        });

        const allquestion = result?.answers || [];

        const totalQuestions = task.questions?.length || 0;

        // Count correct answers in this single result
        const correct = allquestion.filter((ans: { isCorrect: boolean }) => ans.isCorrect === true).length;

        // Fetch all task results by student for stats (optional)
        const allResults = await TaskResult.find({ student: student._id });
        const scores = allResults.map(r => r.score);
        const maxScore = scores.length ? Math.max(...scores) : 0;
        const minScore = scores.length ? Math.min(...scores) : 0;
        const totalTasks = allResults.length;

        const scorePercentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

        // Get student's class info
        const studentClass = await Class.findById(student.class).lean();
        const className = (studentClass && !Array.isArray(studentClass) && studentClass.name) ? studentClass.name : "Unknown Class";

        // Dynamic CLASS leaderboard for this student's class, filtered by term/week/task
        const classLeaderboardAgg = await TaskResult.aggregate([
            { $match: { classId: student.class, task: task._id, term: termNum, week: weekNum } },
            {
                $group: {
                    _id: "$student",
                    totalScore: { $sum: "$score" }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentDoc"
                }
            },
            { $unwind: "$studentDoc" },
            {
                $project: {
                    studentId: { $toString: "$_id" },
                    studentName: "$studentDoc.name",
                    totalScore: 1
                }
            },
            { $sort: { totalScore: -1, studentName: 1 } }
        ]);

        let prevScore: number | null = null;
        let currentRank = 0;
        classLeaderboardAgg.forEach((entry, idx) => {
            if (entry.totalScore !== prevScore) {
                currentRank = idx + 1;
                prevScore = entry.totalScore;
            }
            entry.rank = currentRank;
        });

        // Build recap array to show question details with student's answers and correct answers
        const recap = allquestion.map((ans: {
            question: {
                _id: Types.ObjectId;
                question?: string;
                questiontype?: string;
                correctAnswer?: any[];

            };
            selected?: any[];
            isCorrect: boolean;
        }) => ({
            questionId: ans.question._id.toString(),
            questionText: ans.question.question || "",
            questionType: ans.question.questiontype || "",
            correctAnswer: ans.question.correctAnswer || [],
            selectedAnswer: ans.selected || [],
            isCorrect: ans.isCorrect
        }));

        return NextResponse.json({
            message: "Task Result",
            scorePercentage,
            starsEarned: correct,
            correctAnswers: correct,
            wrongAnswers: totalQuestions - correct,
            totalQuestions,
            weeklyStats: {
                totalTasks,
                maxScore,
                minScore,
            },
            class: {
                id: student.class.toString(),
                name: className
            },
            classLeaderboard: classLeaderboardAgg,
            recap
        });
    } catch (error) {
        console.error('[SUBMIT_TASK_ERROR]', error);
        return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
    }
}
