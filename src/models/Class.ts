import mongoose from "mongoose";
import "@/models/Teacher";

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
  school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
}, { timestamps: true });

export default mongoose.models.Class || mongoose.model("Class", classSchema);