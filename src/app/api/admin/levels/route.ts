import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Level from "@/models/Level";
import Student from "@/models/Student";
import Task from "@/models/Task";
import Class from "@/models/Class";
import verifyAdminAuth from "@/lib/verifyAuth";

// GET: Fetch all levels
export async function GET() {
  try {
    const authRes = await verifyAdminAuth();

    // If authRes is a NextResponse (has json/error), return it
    if (authRes instanceof NextResponse) {
      return authRes;
    }
    await connectDB();
    const levels = await Level.find().sort({ order: 1, code: 1 });
    return NextResponse.json({ levels }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/levels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 }
    );
  }
}

// POST: Create a new level (auto-generate code from defaultName)
export async function POST(req: NextRequest) {
  try {
    const authRes = await verifyAdminAuth();

    // If authRes is a NextResponse (has json/error), return it
    if (authRes instanceof NextResponse) {
      return authRes;
    }
    await connectDB();
    const body = await req.json();
    const { defaultName, createdBy } = body;

    if (!defaultName || defaultName.trim() === "") {
      return NextResponse.json(
        { error: "defaultName is required" },
        { status: 400 }
      );
    }

    // Make only first letter uppercase
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);


    const exists = await Level.findOne({ defaultName: formattedName });
    if (exists) {
      return NextResponse.json(
        { error: "Level with this name already exists" },
        { status: 409 }
      );
    }

    const level = await Level.create({
      defaultName: formattedName,
      code: formattedName,
      createdBy: createdBy || "admin",
    });

    return NextResponse.json({ level }, { status: 201 });
  } catch (error) {
    console.error("GET /api/admin/levels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 }
    );
  }

}

// PATCH: Update defaultName only (not code)
export async function PATCH(req: NextRequest) {
  try {
    const authRes = await verifyAdminAuth();

    // If authRes is a NextResponse (has json/error), return it
    if (authRes instanceof NextResponse) {
      return authRes;
    }
    await connectDB();
    const body = await req.json();
    const { id, defaultName } = body;

    if (!id || !defaultName) {
      return NextResponse.json(
        { error: "id and defaultName are required" },
        { status: 400 }
      );
    }
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

    const exists = await Level.findOne({ defaultName: formattedName });
    if (exists) {
      return NextResponse.json(
        { error: "Level with this name already exists" },
        { status: 409 }
      );
    }
    const updated = await Level.findByIdAndUpdate(
      id,
      { defaultName: formattedName },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    return NextResponse.json({ level: updated }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/levels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 }
    );
  }

}

// DELETE: Delete level by ID
export async function DELETE(req: NextRequest) {

  try {
    const authRes = await verifyAdminAuth();

    // If authRes is a NextResponse (has json/error), return it
    if (authRes instanceof NextResponse) {
      return authRes;
    }
    await connectDB();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const deleted = await Level.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Level deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/levels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 }
    );
  }

}