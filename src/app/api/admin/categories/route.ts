// src/app/api/admin/categories/route.ts

import { connectDB } from "@/utils/db";
import Category from "@/models/Category";
import { NextRequest, NextResponse } from "next/server";
import TaskResult from "@/models/TaskResult";
import Task from "@/models/Task";
import verifyAdminAuth from "@/lib/verifyAuth";

export async function GET() {
  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const categories = await Category.find();
  return Response.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const { name, subcategories } = await req.json();
  const newCategory = await Category.create({ name, subcategories });
  return Response.json({ success: true, data: newCategory });
}

export async function PUT(req: NextRequest) {
  const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const { id, name, subcategories } = await req.json();

  const updated = await Category.findByIdAndUpdate(
    id,
    { name, subcategories },
    { new: true }
  );

  if (!updated) {
    return new Response(JSON.stringify({ error: "Category not found" }), {
      status: 404,
    });
  }

  return Response.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest) {
  const authRes = await verifyAdminAuth();

  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const { id } = await req.json();
  const category = await Category.findById(id).select("name");
  if (!category) {
    return Response.json({ success: false, message: "Category not found." }, { status: 404 });
  }
  const tasksInCategory = await Task.find({ category: category.name }).select("_id");

  if (tasksInCategory.length > 0) {
    const taskIds = tasksInCategory.map(task => task._id);
    const count = await TaskResult.countDocuments({ task: { $in: taskIds } });

    if (count > 0) {
      return Response.json({
        success: false,
        message: "category has tasks assigned to students and can't be deleted."
      }, { status: 400 });
    }
  }

  await Category.findByIdAndDelete(id);
  return Response.json({ success: true });
}