import User from "@/models/User";

export const checkLimit = async (userId) => {
  const user = await User.findById(userId);
  const today = new Date().toISOString().split("T")[0];
  
  // Reset counter if last analysis was yesterday
  if (user.lastAnalysisDate?.toISOString().split("T")[0] !== today) {
    user.resumesAnalyzedToday = 0;
    user.lastAnalysisDate = new Date();
    await user.save();
  }

  const limits = { free: 10, pro: 50, master: 100 };
  return user.resumesAnalyzedToday < limits[user.plan];
};