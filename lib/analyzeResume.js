import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeResume = async (text, jobRole) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json", 
    }
  });

  const prompt = `
    You are a senior HR analyst. Strictly return valid JSON only.
    Analyze this resume for ${jobRole} position:

    ${text}

    JSON Format:
    {
      "skills": {
        "matched": ["skill1", "skill2"],
        "missing": ["skill3"],
        "score": 8
      },
      "projects": {
        "summaries": ["Project 1 description", "Project 2 description"],
        "score": 7
      },
      "experience": {
        "years": 3,
        "company": "company name",
        "score": 9
      },
      "education": {
        "degrees": [
          {
            "type": "Degree Type",
            "institution": "University Name",
            "year": 2024
          }
        ],
        "score": 8
      },
      "overallScore": 85
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    // Clean response before parsing
    const cleanedResponse = response.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};