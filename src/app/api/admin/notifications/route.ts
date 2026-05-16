// app/api/admin/notifications/route.ts
import  verifyAdminAuth  from '@/lib/verifyAuth';
import Admin from '@/models/Admin';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {

 const authRes = await verifyAdminAuth();

  // If authRes is a NextResponse (has json/error), return it
  if (authRes instanceof NextResponse) {
    return authRes;
  }
  const getadminid = await Admin.findOne().select("_id").lean() as { _id: mongoose.Types.ObjectId } | null;

  const getnotification = await Notification.find({ receiver: getadminid?._id }).lean();
  console.log("Notifications fetched:", getnotification);

  return NextResponse.json(getnotification, { status: 200 });
}