// app/api/auth/verify-otp/route.ts (FIXED)
import { connectDB } from "@/utils/db";
import { verifyOTP } from "@/utils/otpService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, otp, usertype } = body;

        const lowerCaseEmail = email.toLowerCase()
        const userType = usertype;

        if (typeof email !== 'string' || typeof usertype !== 'string') {
            return NextResponse.json({ error: "Invalid input types" }, { status: 400 });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(lowerCaseEmail)) {
            return NextResponse.json({
                message: 'Invalid email format',
                success: false
            }, { status: 400 });
        }

        // Length validation
        if (lowerCaseEmail.length > 50) {
            return NextResponse.json({ error: "Email must be within 50 charaters long" }, { status: 400 });
        }

        // Validate input
        if (!lowerCaseEmail || !userType) {
            return NextResponse.json({
                message: 'Email and user type are required',
                success: false
            }, { status: 400 });
        }

        // Validate OTP format (4 digits)
        if (!/^\d{4}$/.test(otp)) {
            return NextResponse.json({
                success: false,
                message: 'OTP must be 4 digits'
            }, { status: 400 });
        }

        // Verify OTP

        await connectDB();
        const verification = await verifyOTP(lowerCaseEmail, otp, userType);

        if (!verification.isValid) {
            return NextResponse.json({
                success: false,
                message: 'Invalid or expired OTP'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
            userId: verification.userId // Include userId for next step
        }, { status: 200 });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error during OTP verification'
        }, { status: 500 });
    }
}
