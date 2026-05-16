import mongoose from 'mongoose';

const matchThePairsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);


const questionSchema = new mongoose.Schema({
  heading: String,
  question: String,
  media: {
    image: String,
    audio: String,
  },
  options: [String],
  correctAnswer: [String],
  explanation: { type: String },
  type: { type: String, enum: ['single', 'multi'], default: 'single' },
  questiontype: {
    type: String, enum: [
      "MCQs",
      "Fill in the gaps",
      "Match The Pairs",
      "Word Order exercise",
      "Find the Mistakes",
      "Complete The Sentence"
    ],
    required: true
  },
  matchThePairs: [matchThePairsSchema],
}, { timestamps: true });


export default mongoose.models.Question || mongoose.model('Question', questionSchema);