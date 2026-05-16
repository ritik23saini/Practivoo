import { connectDB } from "@/utils/db";
import Class from "@/models/Class";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import TaskResult from "@/models/TaskResult";
import { verifySchoolAuth } from "@/lib/verifyAuth";


export async function GET(req: NextRequest) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const schoolId = authRes.user._id;
  await connectDB();

  const level = req.nextUrl.searchParams.get("level");

  const filter: any = {};
  if (level) filter.level = level;

  if (schoolId) {
    try {
      filter.school = new mongoose.Types.ObjectId(schoolId);
    } catch (error) {
      return NextResponse.json({ error: "Invalid schoolId format" }, { status: 400 });
    }
  }

  const classes = await Class.find(filter).populate("teachers", "name email");
  return NextResponse.json({ classes }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const { classId, teachers } = await req.json();

  if (!classId) {
    return NextResponse.json({ error: "Class ID required" }, { status: 400 });
  }

  if (!teachers || teachers.length === 0) {
    return NextResponse.json({ error: "At least one teacher required" }, { status: 400 });
  }

  // Get the class before update to check for existing teachers
  const existingClass = await Class.findById(classId);

  if (!existingClass) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Check which teachers already exist
  const existingTeacherIds = existingClass.teachers.map((t: any) => t.toString());
  const newTeachers = teachers.filter((teacherId: string) => !existingTeacherIds.includes(teacherId));
  const duplicateTeachers = teachers.filter((teacherId: string) => existingTeacherIds.includes(teacherId));

  // If all teachers already exist
  if (newTeachers.length === 0) {
    return NextResponse.json({
      message: "All selected teachers already exist in the class",
      duplicates: duplicateTeachers.length
    }, { status: 200 });
  }

  // Add only new teachers to the class
  const updatedClass = await Class.findByIdAndUpdate(
    classId,
    {
      $addToSet: {
        teachers: { $each: newTeachers }
      }
    },
    { new: true }
  )

  // Prepare response message based on duplicates
  let message = "";
  if (duplicateTeachers.length > 0) {
    message = `${newTeachers.length} teacher(s) added successfully. ${duplicateTeachers.length} teacher(s) already existed in the class.`;
  } else {
    message = `${newTeachers.length} teacher(s) added successfully`;
  }

  return NextResponse.json({
    message,
    class: updatedClass,
    added: newTeachers.length,
    duplicates: duplicateTeachers.length
  }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const schoolId = authRes.user._id;

  await connectDB();
  const { name, levelCode, teachers } = await req.json();

  if (!name || !levelCode || !schoolId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }


  const newClass = await Class.create({
    name,
    level: levelCode,
    teachers,
    school: schoolId,
  });

  return NextResponse.json(newClass, { status: 201 });
}

// Used for "Edit Class" (Full Update: Name, Level, Replace Teachers)
export async function PUT(req: NextRequest) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  try {
    const { classId, name, teachers, } = await req.json();

    console.log(classId, name, teachers)
    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    // Update object
    const updateData: any = {};
    if (name) updateData.name = name;
    if (teachers) updateData.teachers = teachers;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      updateData,
      { new: true }
    );

    if (!updatedClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Class updated successfully",
      class: updatedClass
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  try {
    const classId = req.nextUrl.searchParams.get("classId");
    console.log(classId)
    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    // 1. Check if any tasks have been submitted for this class
    // Assuming 'class' or 'classId' is the field in your TaskResult model
    const taskExists = await TaskResult.findOne({ classId });
    console.log(taskExists);

    if (taskExists) {
      return NextResponse.json({
        error: "Task is submitted by student, cannot delete class."
      }, { status: 400 });
    }

    // 2. If no tasks found, proceed with delete
    const deletedClass = await Class.findByIdAndDelete(classId);

    if (!deletedClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Class deleted successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}