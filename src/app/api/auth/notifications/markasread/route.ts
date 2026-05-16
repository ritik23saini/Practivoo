import { connectDB } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Notification from "@/models/Notification";

export async function PATCH(req: NextRequest) {
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

        const updated = await Notification.updateMany(
            { receiver: decoded.id, isRead: false },
            { $set: { isRead: true } }
        );

        return NextResponse.json(
            { success: true, message: "Notifications marked as read" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("PATCH error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
