import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import ClassModel from "@/models/Class";
import Student from "@/models/Student";
import "@/models/Teacher"; 

function readTeacherId(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return searchParams.get("teacherId");
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const teacherId = readTeacherId(req);
    if (!teacherId) {
      return NextResponse.json(
        { error: "teacherId is required" },
        { status: 400 }
      );
    }

    // Find classes where the teacher is assigned
    // NOTE: your schema uses `teachers` as a single ObjectId (not array).
    const classes = await ClassModel.find({ teachers: teacherId })
      .select("_id name level school createdAt")
      .lean();

    // Attach student counts per class (1 aggregated query)
    const counts = await Student.aggregate([
      { $match: { class: { $in: classes.map(c => c._id) } } },
      { $group: { _id: "$class", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map(c => [String(c._id), c.count]));

    const data = classes.map(c => ({
      _id: String(c._id),
      name: c.name,
      level: c.level,
      school: String(c.school),
      studentCount: countMap.get(String(c._id)) || 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ classes: data }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/teacher/classes error:", err);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}