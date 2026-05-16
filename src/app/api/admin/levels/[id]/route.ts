import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Level from "@/models/Level";
import  verifyAdminAuth  from "@/lib/verifyAuth";

// PUT /api/admin/levels/[id]
export async function PUT(req: NextRequest, context: any) {
 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();

  const { id } = context.params;
  const { code, defaultName } = await req.json();

  if (!code || !defaultName) {
    return NextResponse.json({ error: "code and defaultName are required" }, { status: 400 });
  }

  const level = await Level.findByIdAndUpdate(
    id,
    { code, defaultName },
    { new: true }
  );

  if (!level) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json({ level }, { status: 200 });
}

// DELETE /api/admin/levels/[id]
export async function DELETE(req: NextRequest, context: any) {
 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();

  const { id } = context.params;

  const deleted = await Level.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Level not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Level deleted successfully" }, { status: 200 });
}