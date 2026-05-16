// models/UserMessage.js
import mongoose, { Schema } from "mongoose";

const replySchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "Student" },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const userMessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: "Student" }], // who liked
  replies: [replySchema],
});

export default mongoose.models.UserMessage || mongoose.model("UserMessage", userMessageSchema);