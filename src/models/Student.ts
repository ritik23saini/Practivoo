import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    level: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentId: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
      unique: true,
    },
    image: {
      type: String,
      default: "/user.png",
    },
    score: { type: Number, default: 0 },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  },
  { timestamps: true }
);

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.models.Student || mongoose.model("Student", studentSchema);