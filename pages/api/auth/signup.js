import User from "@/models/User";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await connectDB();
  const { email, password } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });
  
  res.status(201).json({ success: true, user });
}