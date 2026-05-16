import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Issue from "@/models/Issue";
import mongoose from "mongoose";
import verifyAdminAuth from "@/lib/verifyAuth";

export const dynamic = "force-dynamic";

// GET single issue
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }

    await connectDB();

    // Await params (Next.js 15 requirement)
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const issue = await Issue.findById(id)
      .populate({
        path: "studentId",
        select: "name email class",
        populate: {
          path: "class",
          select: "name level"
        }
      })
      .populate("school", "name address")
      .populate("questionId", "text topic category level")
      .lean();

    if (!issue) {
      return NextResponse.json(
        { success: false, error: "Issue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      issue
    });
  } catch (err: any) {
    console.error("GET /api/issues/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update issue (mark as resolved)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await params (Next.js 15 requirement)
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Build updates object
    const updates: Record<string, any> = {};
    if (body.status) updates.status = body.status;
    if (body.message !== undefined) updates.message = String(body.message).slice(0, 1000);
    if (body.type) updates.type = String(body.type).slice(0, 100);
    if (body.additionalNote !== undefined) updates.additionalNote = String(body.additionalNote).slice(0, 100);

    const updated = await Issue.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Issue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Issue updated successfully"
    });
  } catch (err: any) {
    console.error("PATCH /api/issues/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete issue
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await params (Next.js 15 requirement)
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const deleted = await Issue.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Issue not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (err: any) {
    console.error("DELETE /api/issues/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
