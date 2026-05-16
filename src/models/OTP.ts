// models/OTP.ts
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: Number, required: true },
    userType: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    expiresAt: {
        type: Date,
        required: true,
        default: () => Date.now() + 10 * 60 * 1000, // 10 minutes from now
    },
});

// TTL index - MongoDB will auto-remove after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTP || mongoose.model("OTP", otpSchema);
