import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  level: { type: String, required: true },
  category: { type: String, required: true },
  postQuizFeedback: { type: Boolean },
  status: { type: String, enum: ['Assigned', 'Drafts'], default: 'Drafts' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model('Task', taskSchema);