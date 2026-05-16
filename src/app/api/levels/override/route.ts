import { connectDB } from "@/utils/db";
import { NextResponse } from "next/server";
import Level from "@/models/Level";
import { verifySchoolAuth } from "@/lib/verifyAuth";

export async function GET(req: Request) {
  const authRes = await verifySchoolAuth();
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  await connectDB();
  const levels = await Level.find().sort({ order: 1, code: 1 }).select("defaultName code").lean();
  console.log(levels)
  return NextResponse.json({ levels }, { status: 200 });
}

