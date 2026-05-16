import verifyAdminAuth from "@/lib/verifyAuth";
import Admin from "@/models/Admin";
import { connectDB } from "@/utils/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const authRes = await verifyAdminAuth();
    if (authRes instanceof NextResponse) {
        return authRes;
    }
    try {
        await connectDB();
        const admin = await Admin.findOne().select("-password").lean();
        return NextResponse.json({ admin });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const authRes = await verifyAdminAuth();
    if (authRes instanceof NextResponse) {
        return authRes;
    }
    try {
        const body = await req.json();

        const updateData = {} as any;
        let hasChanges = false;

        // Email update (optional)
        if (body.newEmail) {
            const email = body.newEmail.toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email) || email.length > 50) {
                return NextResponse.json({
                    error: "Invalid email format or too long (max 50 chars)"
                }, { status: 400 });
            }
            updateData.email = email;
            hasChanges = true;
        }

        // Password update (optional) 
        if (body.newPassword) {
            if (typeof body.newPassword !== 'string' ||
                body.newPassword.length < 8 ||
                body.newPassword.length > 16) {
                return NextResponse.json({
                    error: "Password must be 8-16 characters"
                }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(body.newPassword, 10);
            hasChanges = true;
        }

        if (!hasChanges) {
            return NextResponse.json({
                error: "No changes provided (send newEmail or newPassword)"
            }, { status: 400 });
        }

        await connectDB();
        const result = await Admin.updateOne({}, { $set: updateData });

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "No admin found" }, { status: 404 });
        }

        const admin = await Admin.findOne().select("-password").lean();
        return NextResponse.json({
            message: "Admin updated successfully",
            admin
        });


    } catch (error) {
        console.error('Admin update error:', error);
        return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
    }
}