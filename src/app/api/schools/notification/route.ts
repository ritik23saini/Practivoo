import { connectDB } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Notification from "@/models/Notification";
import "@/models/Task";
import "@/models/UserMessage";
import "@/models/Message";
import School from "@/models/School";
import { verifySchoolAuth } from "@/lib/verifyAuth";

export async function GET(req: NextRequest) {
    const authRes = await verifySchoolAuth();
    if (authRes instanceof NextResponse) {
        return authRes;
    }
    const schoolId = authRes.user._id;
    try {
        await connectDB();

        // Fetch all notifications for the user
        const getNotification = await Notification.find({
            receiver: schoolId,
        })
            .populate({
                path: "refId",
                select: "content topic message createdAt"
            })
            .select("receiver type isRead message title refId refModel createdAt")
            .sort({ createdAt: -1 });

        // Convert to plain array to allow modifications
        let notifications = getNotification.map(doc => doc.toObject());

        // Check if school is expiring soon
        const checkSchoolExpiry = await School.findById(schoolId);

        if (checkSchoolExpiry && checkSchoolExpiry.endDate) {
            const endDate = new Date(checkSchoolExpiry.endDate);
            const currentDate = new Date();

            // Calculate difference in days
            const timeDiff = endDate.getTime() - currentDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            // If expiring within 30 days or already expired
            if (daysDiff <= 30 && daysDiff >= 0) {
                const expiryNotification = {
                    _id: "school-expiry-warning",
                    receiver: schoolId,
                    message: `Your school subscription will expire in ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}. Please renew to continue services.`,
                    title: "Subscription Expiring Soon",
                    type: "EXPIRY_WARNING",
                    isRead: false,
                    createdAt: currentDate,
                    refId: null,
                    refModel: null
                };
                notifications.unshift(expiryNotification); // Add to the beginning
            } else if (daysDiff < 0) {
                // Already expired
                const expiryNotification = {
                    _id: "school-expiry-expired",
                    receiver: schoolId,
                    message: `Your school subscription has expired. Please renew immediately to restore services.`,
                    title: "Subscription Expired",
                    type: "EXPIRY_ALERT",
                    isRead: false,
                    createdAt: currentDate,
                    refId: null,
                    refModel: null
                };
                notifications.unshift(expiryNotification); // Add to the beginning
            }
        }

        if (!notifications || notifications.length === 0) {
            return NextResponse.json({
                message: "No Notification Found",
                notifications: []
            }, { status: 200 });
        }

        return NextResponse.json({
            notifications,
            count: notifications.length
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({
            error: "Failed to fetch notifications"
        }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
     const authRes = await verifySchoolAuth();
    if (authRes instanceof NextResponse) {
        return authRes;
    }
    const schoolId = authRes.user._id;
    try {
        await connectDB();


        const updated = await Notification.updateMany(
            { receiver: schoolId, isRead: false },
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
