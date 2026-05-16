import mongoose, { Schema, models, model } from 'mongoose';

// models/Issue.ts
const IssueSchema = new Schema({
  user: { type: String, required: true },     // display label or studentId
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },   // <— add this for reliable filtering
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  type: { type: String, required: true },
  message: { type: String, default: "" },     // optional in UI
  topic: { type: String },
  additionalNote: { type: String },            
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
  status: { type: String, enum: ["pending", "resolved"], default: "pending", index: true },
}, { timestamps: true });


export default models.Issue || model('Issue', IssueSchema);