import { connectDB } from "@/utils/db";
import Teacher from "@/models/Teacher";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifySchoolAuth } from "@/lib/verifyAuth";


export async function PUT(
  req: NextRequest,
  context: any
) {

  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const { id } = await context.params;
  const body = await req.json();

  try {
    //  Hash password before update if password is provided
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }
    const updated = await Teacher.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    const { password, ...teacherWithoutPassword } = updated.toObject();

    return NextResponse.json(
      { message: "Updated successfully", data: teacherWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Update failed", details: error }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  context: any
) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const { id } = context.params; //teacherid

  try {
    const deleted = await Teacher.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}

