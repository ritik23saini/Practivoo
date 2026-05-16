// services/otpService.ts
import OTP from '../models/OTP';
import { sendEmail } from '../utils/sendEmail';

export const generateOTP = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

export const createAndSendOTP = async (
    email: string,
    userId: string,
    userType: string,
    userName: string
): Promise<void> => {
    // Delete existing OTPs for this email and userType
    await OTP.deleteMany({ email, userType });

    // Generate new OTP
    const otp = generateOTP();
    console.log(otp)
    // Save OTP to database
    await new OTP({
        email,
        otp,
        userType,
        userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    }).save();

    // Send email
    const userTypeDisplay = userType.charAt(0).toUpperCase() + userType.slice(1);

    await sendEmail({
        to: email,
        subject: `Password Reset OTP - ${userTypeDisplay} Account`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <p>Hello ${userName},</p>
                    <p>You have requested to reset your password for ${email}.</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <div style="background-color: #007bff; color: white; padding: 15px; border-radius: 5px; display: inline-block; font-size: 24px; letter-spacing: 2px;">
                            ${otp}
                        </div>
                    </div>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This code expires in 10 minutes</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                </div>
            </div>
        `
    });
};

export const
    verifyOTP = async (
        email: string,
        otp: string,
        userType: string
    ): Promise<{ isValid: boolean; userId?: string }> => {
        const otpRecord = await OTP.findOne({ email, userType });

        if (!otpRecord) {
            return { isValid: false };
        }

        // Expired?
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id }); // cleanup
            return { isValid: false };
        }

        if (otpRecord.otp !== otp) {
            return { isValid: false };
        }

        // Success → delete OTP after use

        return { isValid: true, userId: otpRecord.userId.toString() };
    };
