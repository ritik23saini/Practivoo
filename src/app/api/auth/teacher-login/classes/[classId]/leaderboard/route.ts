import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from '@/utils/db';
import Student from "@/models/Student";
import ClassModel from "@/models/Class";

type LeanClass = { _id: Types.ObjectId; name: string; level: string };

// ---- Helpers ----
async function verifyTeacherOwnsClass(classId: string, teacherId?: string) {
  if (!teacherId) return true; // relax until JWT wired
  const owns = await ClassModel.exists({
    _id: new Types.ObjectId(classId),
    teachers: new Types.ObjectId(teacherId), // works even if `teachers` is an array
  });
  return !!owns;
}

type ScoreRow = { _id: Types.ObjectId; score?: number | null };
type LeaderRow = {
  _id: Types.ObjectId;
  name: string;
  image: string;
  gender: string;
  score?: number | null;
};

// ---- GET /leaderboard ----
export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    await connectDB();

    const classId = context?.params?.classId;
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    // permissions (recommended to keep once auth is live)
    const allowed = await verifyTeacherOwnsClass(classId, teacherId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get ALL scores (tiny classes → fine). Needed to compute true rank with ties.
    const allScores = await Student.find({ class: classId })
      .select("_id score")
      .sort({ score: -1, _id: 1 })
      .lean<ScoreRow[]>();

    const total = allScores.length;

    // Build rank map (competition ranking: 100, 90, 90 → ranks 1, 2, 2, next rank 4)
    const rankMap = new Map<string, number>();
    let prevScore: number | null = null;
    let rank = 0;
    let index = 0;

    for (const row of allScores) {
      index += 1;
      const pts = typeof row.score === "number" ? row.score : 0;
      if (prevScore === null || pts < prevScore) {
        rank = index;
        prevScore = pts;
      }
      rankMap.set(String(row._id), rank);
    }

    // Page slice
    const leaders = await Student.find({ class: classId })
      .select("_id name image gender score")
      .sort({ score: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<LeaderRow[]>();

    const leaderboard = leaders.map((s) => ({
      _id: String(s._id),
      name: s.name,
      image: s.image,
      gender: s.gender,
      points: typeof s.score === "number" ? s.score : 0,
      rank: rankMap.get(String(s._id)) ?? null,
    }));

    // optional: class header (name/level) for the tabs bar
    const cls = await ClassModel.findById(classId)
                            .select("_id name level")
                             .lean<LeanClass | null>(); 

    return NextResponse.json(
      {
        class: cls ? { _id: String(cls._id), name: cls.name, level: cls.level } : null,
        leaderboard,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/teacher/classes/[classId]/leaderboard error:", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}