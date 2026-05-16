import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subcategories: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Category || mongoose.model("Category", categorySchema);