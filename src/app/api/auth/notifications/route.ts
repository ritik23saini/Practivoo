import { connectDB } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Notification from "@/models/Notification";
import "@/models/Task";
import "@/models/UserMessage";
import "@/models/Message";
import School from "@/models/School";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: { id: string; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: string;
      };
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // ⏳ Only fetch last 3 days notifications
    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 2);

    const getNotification = await Notification.find({
      receiver: decoded.id,
      createdAt: { $gte: threeDaysAgo }
    })
      .populate({
        path: "refId",
        select: "content topic message createdAt"
      })
      .select("receiver type isRead message title refId refModel createdAt")
      .sort({ createdAt: -1 });

    // Mapper function
    const notifications = getNotification.map(n => {
      let refContent: string | null = null;
      let title: string | null = null;

      switch (n.refModel) {
        case "UserMessage":
          if (n.message) {
            refContent = n.message;
          } else {
            refContent = n.refId?.content || null;
          }
          title = n.title || null;
          break;
        case "Task":
          refContent = n.refId?.topic || null;
          break;
        case "Assignment":
          refContent = n.refId?.message || null;
          break;
        default:
          refContent = null;
      }

      const filterresult = {
        _id: n._id,
        receiver: n.receiver,
        message: refContent,
        title: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      };

      // only add title for MESSAGE type
      if (n.type === "MESSAGE") {
        return { ...filterresult, title };
      }
      return filterresult;
    });


    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ message: "No Notification Found" }, { status: 200 });
    }

    // 📌 Group notifications
    const groups: Record<string, any[]> = { Today: [], Yesterday: [], "2 Days Ago": [] };

    for (let n of notifications) {
      const notificationDate = new Date(n.createdAt);
      
      // Reset time to midnight for accurate day comparison
      const notificationDay = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());
      const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diff = Math.floor(
        (todayDay.getTime() - notificationDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === 0) groups.Today.push(n);
      else if (diff === 1) groups.Yesterday.push(n);
      else if (diff === 2) groups["2 Days Ago"].push(n);
    }

    return NextResponse.json({ Notifications: groups }, { status: 200 });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: error }, { status: 404 });
  }
}
