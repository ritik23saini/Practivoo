// app/api/student/leaderboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import Student from "@/models/Student";
import Class from "@/models/Class";
import TaskResult from "@/models/TaskResult";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    // 1) Auth → studentId from Authorization header
    const decoded = verifyToken(req); // must return { id: string }
    console.log(Class.find({}))
    const me = await Student.findById(decoded.id).populate("class", "name");
    if (!me) {
      return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });
    }

    // 2) Filters from query (?term=&week=)
    const { searchParams } = new URL(req.url);
    const term = Number(searchParams.get("term"));
    const week = Number(searchParams.get("week"));

    const filter: Record<string, any> = {};
    if (Number.isFinite(term)) filter.term = term;
    if (Number.isFinite(week)) filter.week = week;

    // 3) My points (within filter)
    const myAgg = await TaskResult.aggregate([
      { $match: { ...filter, student: new Types.ObjectId(me._id) } },
      { $group: { _id: null, points: { $sum: "$score" } } },
    ]);
    const myPoints = myAgg[0]?.points || 0;

    // 4) Rank within my class
    const classRanks = await TaskResult.aggregate([
      { $match: { ...filter, classId: new Types.ObjectId(me.class._id) } },
      { $group: { _id: "$student", points: { $sum: "$score" } } },
      { $sort: { points: -1 } },
    ]);

    let myRankInClass: number | null = null;
    let rank = 0;
    let prev: number | null = null;

    for (const row of classRanks) {
      if (row.points !== prev) {
        rank += 1;
        prev = row.points;
      }
      if (String(row._id) === String(me._id)) {
        myRankInClass = rank;
        break;
      }
    }

    // 5) Class leaderboard (all classes)
    const classAgg = await TaskResult.aggregate([
      { $match: filter },
      { $group: { _id: "$classId", points: { $sum: "$score" } } },
      { $sort: { points: -1 } },
    ]);

    const leaderboard: Array<{ rank: number; classId: string; className?: string; points: number }> = [];
    let classRank: number | null = null;
    rank = 0;
    prev = null;

    for (const row of classAgg) {
      if (row.points !== prev) {
        rank += 1;
        prev = row.points;
      }
      leaderboard.push({
        rank,
        classId: String(row._id),
        points: row.points,
      });
      if (String(row._id) === String(me.class._id)) classRank = rank;
    }

    // (Optional) populate class names for leaderboard cards
    // If you want names here without extra client calls, do a lightweight fetch:
    // NOTE: Avoid if you prefer fewer queries; UI can map ids to names separately.
    // --- BEGIN optional name enrichment ---
    // import ClassModel from "@/models/Class";
    // const ids = leaderboard.map(l => l.classId);
    // const classes = await ClassModel.find({ _id: { $in: ids } }, { name: 1 }).lean();
    // const nameMap = new Map(classes.map((c: any) => [String(c._id), c.name]));
    // leaderboard.forEach(l => (l.className = nameMap.get(l.classId)));
    // --- END optional name enrichment ---

    return NextResponse.json(
      {
        ok: true,
        filter,
        myCard: {
          student: { id: me._id, name: me.name },
          class: { id: me.class._id, name: (me.class as any).name },
          points: myPoints,
          myRankInClass,
          classRank,
        },
        leaderboard,
      },
      { headers: { "Cache-Control": "private, max-age=20" } }
    );
  } catch (err) {
    console.error("[LEADERBOARD_GET_ERROR]", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}