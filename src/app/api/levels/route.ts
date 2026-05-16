import { connectDB } from "@/utils/db";
import Level from "@/models/Level";
import { NextResponse } from "next/server";
import SchoolLevel from "@/models/SchoolLevel";
import Student from "@/models/Student";
import Class from "@/models/Class";
import schooltask from "@/models/schooltask";
import mongoose from "mongoose";
import verifyAdminAuth, { verifySchoolAuth } from "@/lib/verifyAuth";


// GET /api/levels
export async function GET(req: Request) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const schoolId = authRes.user._id;
  await connectDB();
 // console.log(schoolId)
  const levels = await Level.find().sort({ order: 1 }).lean();
  const schoollevel = await SchoolLevel.find({ schoolId });
  // Create a map of school levels by code for quick lookup
  const schoolLevelMap = new Map(
    schoollevel.map(sl => [sl.code, sl.customName])
  );
  console.log(schoolLevelMap)

  const mergedlevel = levels.map(level => ({
    _id: level._id,
    code: level.code,
    customName: schoolLevelMap.get(level.code) || level.code,
  }));

  return NextResponse.json(mergedlevel);
}


// POST /api/levels (admin creates)
export async function POST(req: Request) {
  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const body = await req.json();

  const newLevel = await Level.create({
    code: body.code,
    defaultName: body.defaultName,
    createdBy: "admin"
  });

  return NextResponse.json(newLevel);
}

export async function PATCH(req: Request) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const schoolId = authRes.user._id;
  await connectDB();

  if (!schoolId) {
    return Response.json({ success: false, error: 'SchoolId is required' }, { status: 400 });
  }
  const { oldName, newName, code } = await req.json();

  try {
    // Update or create SchoolLevel
    const result = await SchoolLevel.findOneAndUpdate(
      { code, schoolId },
      {
        $set: { customName: newName },
        $setOnInsert: {
          schoolId: schoolId,
          code
        }
      },
      {
        new: true,
        upsert: true
      }
    );


    // Convert schoolId string to ObjectId for Student query
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);


    // Update all students with matching school and level (oldName)
    await Promise.all([
      Student.updateMany({ school: schoolObjectId, level: oldName }, { $set: { level: newName } }),
      Class.updateMany({ school: schoolObjectId, level: oldName }, { $set: { level: newName } }),
      schooltask.updateMany({ school: schoolObjectId, level: oldName }, { $set: { level: newName } }),
    ])
    return Response.json({
      success: true,
      data: result,
    }, { status: 200 });
  }
  catch (error) {
    console.error('Update failed:', error);
    return Response.json({
      success: false,
      error: 'Failed to update level',
    }, { status: 500 });
  }
}