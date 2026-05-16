import mongoose from 'mongoose';

const SchoollevelSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    customName: { type: String, required: true },
    code: { type: String, required: true },

});

export default mongoose.models.SchoolLevel || mongoose.model("SchoolLevel", SchoollevelSchema);