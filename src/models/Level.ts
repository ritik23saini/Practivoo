import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  defaultName: { type: String, required: true },
  code: { type: String , required: true },
  createdBy: { type: String, default: "admin" },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Level || mongoose.model("Level", levelSchema);