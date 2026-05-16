import mongoose from 'mongoose';

const taskResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selected: [String],
    isCorrect: Boolean
  }],
  score: { type: Number, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  term: { type: Number, required: true, default: 1 }, // 1, 2, 3
  week: { type: Number, required: true, default: 1 }, // 1..10
  evaluationStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

taskResultSchema.index({ student: 1, task: 1 }, { unique: true });

export default mongoose.models.TaskResult || mongoose.model("TaskResult", taskResultSchema);