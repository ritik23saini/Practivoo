import Admin from "@/models/Admin";
import Notification from "@/models/Notification";
import { connectDB } from "@/utils/db";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json();
        console.log("Contact Form Submission:", { name, email, message });


        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (typeof email !== 'string' || typeof message !== 'string' || typeof name !== 'string') {
            return NextResponse.json({ error: "Invalid input types" }, { status: 400 });
        }
        const safeemail: string = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!safeemail || !emailRegex.test(safeemail)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Length validation
        if (safeemail.length > 50 || name.length > 50) {
            return NextResponse.json({ error: "Email & name must be within 50 charaters long" }, { status: 400 });
        }

        if (!message || message.length < 8 || message.length > 50) {
            return NextResponse.json({ error: "Message must be 8-50 characters" }, { status: 400 });
        }

        await connectDB();
        const getadmin = await Admin.findOne().lean() as { _id: mongoose.Types.ObjectId; email: string } | null;

        if (!getadmin) {
            console.error("No admin found");
            return NextResponse.json(
                { success: false, error: "Admin not found" },
                { status: 500 }
            );
        }

        // Create notification in database
        await Notification.create({
            receiver: getadmin._id,
            title: `Inquiry received from ${name} | ${email}`,
            type: "Inquiry",
            message,
            isRead: false
        });

        // Send email to admin
        try {
            await sendAdminNotificationEmail(name, safeemail, getadmin.email, message);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // Continue even if email fails - notification is created
        }

        return NextResponse.json({
            success: true,
            message: "We will be in touch with you as soon as possible!"
        });
    } catch (error) {
        console.error("Error handling contact form submission:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

async function sendAdminNotificationEmail(
    name: string,
    email: string,
    adminmail: string,
    message: string
) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminmail,
        subject: `New Inquiry from ${name}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Inquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">New Inquiry Received</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Someone wants to connect with you</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            
            <!-- Welcome Message -->
            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Hello! You've received a new inquiry through your contact form. Here are the details:
            </p>

            <!-- User Info Card -->
            <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                
                <div style="margin-bottom: 20px;">
                    <p style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">From</p>
                    <p style="color: #333333; font-size: 18px; font-weight: 600; margin: 0;">${name}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <p style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Email Address</p>
                    <a href="mailto:${email}" style="color: #667eea; font-size: 16px; text-decoration: none; font-weight: 500;">${email}</a>
                </div>

                <div>
                    <p style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Date</p>
                    <p style="color: #333333; font-size: 14px; margin: 0;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <!-- Message Section -->
            <div style="margin-bottom: 30px;">
                <p style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0; font-weight: 600;">Message</p>
                <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 4px; color: #333333; font-size: 15px; line-height: 1.8;">
                    ${message.replace(/\n/g, "<br>")}
                </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 30px;">
                <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s;">
                    Reply to ${name}
                </a>
            </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #666666; font-size: 13px; margin: 0;">
                This is an automated notification from your Practivoo app contact form.
            </p>
          <p style="color: #999999; font-size: 12px; margin: 8px 0 0 0;">
    © ${new Date().getFullYear()} Practivoo. All rights reserved.
        </p>
        </div>

    </div>
</body>
</html>
    `,
    };



    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", adminmail);
        return true;
    } catch (error) {
        console.error("Email sending error:", error);
        throw error;
    }
}
