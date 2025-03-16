import { connectDB } from '@/lib/db';
import { checkLimit } from '@/middleware/checkLimit';
import User from '@/models/User';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import multer from 'multer';
import { analyzeResume } from '@/lib/analyzeResume';

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Middleware ko handle karne ka function
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
};

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  await connectDB();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed!" });
  }

  try {
    // 1. Multer middleware ko run karo (File parse karega)
    await runMiddleware(req, res, upload.single('resume'));

    // 2. File aur UserID extract karo
    const file = req.file; // Multer ne file req.file mein daali hai
    const userId = req.body.userId;
    const jobRole = req.body.jobRole  // Form-data se aaya hua userId

    if (!file || !userId) {
      return res.status(400).json({ error: "File aur UserID dono required hain!" });
    }

    // 3. Subscription limit check karo
    const canUpload = await checkLimit(userId);
    if (!canUpload) {
      return res.status(429).json({ error: "Aaj ka limit khatam ho gaya hai!" });
    }

    // 4. File process karo
    let text = '';
    const buffer = file.buffer; // Multer ne buffer directly diya hai

    if (file.mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      text = data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { value } = await mammoth.extractRawText({ buffer });
      text = value;
    } else {
      return res.status(400).json({ error: "Sirf PDF ya DOCX files allowed hain!" });
    }

    // 5. AI Analysis
    const analysis = await analyzeResume(text, jobRole);

    // 6. Update user count
    await User.findByIdAndUpdate(userId, {
      $inc: { resumesAnalyzedToday: 1 },
      lastAnalysisDate: new Date()
    });

    // 7. Return response
    res.status(200).json({
      success: true,
      analysis,
      fileName: file.originalname,
      analyzedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: error.message.startsWith("AI analysis")
        ? error.message
        : "Internal server error"
    });
  }
}