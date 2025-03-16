import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  plan: { type: String, enum: ["free", "pro", "master"], default: "free" },
  resumesAnalyzedToday: { type: Number, default: 0 },
  lastAnalysisDate: { type: Date }
});

export default mongoose.models.User || mongoose.model("User", userSchema);