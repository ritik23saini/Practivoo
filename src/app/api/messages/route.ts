// /app/api/messages/route.ts
import { connectDB } from "@/utils/db";
import Message from "@/models/Message"; // Define a Message model
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await connectDB();
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

   let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return NextResponse.json({ error: "Invalid ObjectId format" }, { status: 400 });
    }

  const messages = await Message.find({ to: objectId }).sort({ createdAt: 1 });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const { from, to, content } = body;

  if (!from || !to || !content)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const message = await Message.create({ from, to, content });
  return NextResponse.json(message, { status: 201 });
}