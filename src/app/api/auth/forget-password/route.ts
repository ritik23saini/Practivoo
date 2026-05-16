// app/api/auth/forgot-password/route.ts (FIXED)
import { connectDB } from '@/utils/db';
import Admin from '@/models/Admin';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import School from '@/models/School';
import { createAndSendOTP } from '@/utils/otpService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email, usertype }: { email: string; usertype: string } = await req.json();

        const lowerCaseEmail = email.toLowerCase()
        const userType = usertype;
        console.log(userType)
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

        if (!['school', 'teacher', 'student', 'admin'].includes(userType)) {
            return NextResponse.json({
                message: 'Invalid user type',
                success: false
            }, { status: 400 });
        }

        await connectDB();
        let UserModel;
        switch (userType.toLowerCase()) {
            case 'school':
                UserModel = School;
                break;
            case 'teacher':
                UserModel = Teacher;
                break;
            case 'admin':
                UserModel = Admin;
                break
            case 'student':
                UserModel = Student;
                break;
            default:
                return NextResponse.json({
                    success: false,
                    message: 'Invalid user type'
                }, { status: 400 });
        }


        const user = await UserModel.findOne({ email: lowerCaseEmail }).select("email name");
        if (!user) {
            // Don't reveal if user exists or not for security
            return NextResponse.json({
                message: 'If an account exists, an OTP has been sent to your email',
                success: true
            }, { status: 200 }); // Added status code
        }
        createAndSendOTP(lowerCaseEmail, user._id, userType, user.name);
        return NextResponse.json({
            message: 'OTP sent to your email address',
            email: lowerCaseEmail.replace(/(.{2})(.*)(?=.{2})/, '$1***'), // Mask email
            success: true
        }, { status: 200 }); // Added status code

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({
            message: 'Internal server error',
            success: false
        }, { status: 500 }); // Added status code
    }
}
