import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import Student from "@/models/Student";
import ClassModel from "@/models/Class";

// Optional: verify that the requesting teacher actually owns this class
async function verifyTeacherOwnsClass(classId: string, teacherId?: string) {
  if (!teacherId) return true; // skip if you don't enforce yet
  const cls = await ClassModel.findOne({ _id: classId, teachers: teacherId }).select("_id").lean();
  return !!cls;
}

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const teacherId = searchParams.get("teacherId") || undefined;

    const classId = context?.params?.classId;
    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    // Optional ownership check (recommended when auth added)
    const owns = await verifyTeacherOwnsClass(classId, teacherId);
    if (!owns) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const filter: any = { class: classId };

    if (search) {
      // case-insensitive partial name match
      filter.name = { $regex: search, $options: "i" };
    }

    const [items, total] = await Promise.all([
      Student.find(filter)
        .select("_id name gender image email phone level score")
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        students: items.map(s => ({
          _id: String(s._id),
          name: s.name,
          gender: s.gender,
          image: s.image,
          email: s.email,
          phone: s.phone,
          level: s.level,
          score: s.score ?? 0
        })),
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
    console.error("GET /api/teacher/classes/[classId]/students error:", err);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}