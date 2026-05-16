import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, default: "Title" },
    type: {
        type: String,
        required: true,
    },
    message: String,
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Make optional
        refPath: "refModel", // Dynamic reference
    },
    refModel: {
        type: String,
        required: false, // Make optional
        enum: ["Message", "Task", "UserMessage"],
    },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);
