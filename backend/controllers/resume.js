const Resume = require("../models/Resume.js");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

const analyzeResume = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      jobDescription,
      resumeText,
      isRoastMode,
    } = req.body;

    // Helper function to handle the native Cloudinary stream upload
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const cStream = cloudinary.uploader.upload_stream(
          {
            folder: 'resumelab_previews',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(cStream);
      });
    };

    let uploadedImageUrl = null;
    if (req.file && req.file.buffer) {
      uploadedImageUrl = await uploadToCloudinary(req.file.buffer);
    }
      
    // --- 1. PERSONA ALIGNMENT ---
    let aiPersona = `You are a supportive, insightful technical recruiter and career mentor specializing in entry-level tech talent. 
Your goal is to evaluate this resume constructively. The candidate is a fresher/student often coming from a Tier-2 or Tier-3 college. 
Do not penalize them for a lack of corporate years of experience. Instead, look for foundational skills, academic projects, technical problem-solving capabilities, and structural clarity. 
Your feedback should be encouraging, realistic, and highly actionable, offering clear guidance on how they can improve.`;

    // Check if Roast Mode is active (handling both boolean and FormData string forms)
    const checkRoast = isRoastMode === true || isRoastMode === 'true';

    if (checkRoast) {
      aiPersona = `You are an incredibly elitist, brutally honest, and deeply sarcastic senior technical recruiter at a top-tier FAANG company. You review 500 resumes a day and have zero patience for fluff, cliches, bad formatting, or generic templates. 
Your job is to completely ROAST the provided resume. Be absolutely brutal, funny, and highly sarcastic. Mock their buzzwords and weak project bullet points mercilessly. However, your underlying core feedback points must still be factually accurate so they can actually fix it.`;
    }

// 2. TRIGGER THE GROQ API PIPELINE

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing from environment variables");
}

const groqResponse = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `${aiPersona}

CRITICAL SCORING & OUTPUT RULES:
1. Output valid JSON only. No markdown or backticks.
2. Every score must be an integer between 0 and 100.
3. Normal mode should be fair and encouraging.
4. Roast mode can use lower scores and sarcastic tips.

JSON Schema:
{
  "overallScore": 0,
  "ATS": {
    "score": 0,
    "tips": [
      {
        "type": "improve",
        "tip": "Example tip",
        "explanation": "Example explanation"
      }
    ]
  },
  "toneAndStyle": {
    "score": 0,
    "tips": []
  },
  "content": {
    "score": 0,
    "tips": []
  },
  "structure": {
    "score": 0,
    "tips": []
  },
  "skills": {
    "score": 0,
    "tips": []
  }
}`,
        },
        {
          role: "user",
          content: `Analyze this resume.

${jobTitle ? `The candidate is applying for ${jobTitle}.` : ""}

${
  jobDescription
    ? `Job Description: ${jobDescription}`
    : "Provide a general review of the resume."
}

Resume Text: ${resumeText}`,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: checkRoast ? 0.75 : 0.4,
    }),
  }
);

// Read the actual API response
const rawResponse = await groqResponse.text();

let groqData;

try {
  groqData = JSON.parse(rawResponse);
} catch (error) {
  console.error("Invalid Groq response:", rawResponse);

  throw new Error("Groq returned an invalid response");
}

// Check API status
if (!groqResponse.ok) {
  console.error("Groq Status:", groqResponse.status);
  console.error("Groq Error:", groqData);

  return res.status(502).json({
    message: "Groq API request failed",
    details: groqData.error?.message || "Unknown Groq API error",
  });
}

// Extract AI response
const aiContent = groqData.choices?.[0]?.message?.content;

if (!aiContent) {
  console.error("Groq returned no message:", groqData);

  throw new Error("Groq returned an empty response");
}

// Parse AI-generated JSON
let parsedFeedback;

try {
  parsedFeedback = JSON.parse(aiContent);
} catch (error) {
  console.error("AI JSON parsing error:", aiContent);

  throw new Error("AI returned invalid JSON");
}
    // 3. Save everything to MongoDB
    const newResume = new Resume({
      userId: req.user.userId, 
      companyName,
      jobTitle,
      jobDescription,
      imagePath: uploadedImageUrl,
      feedback: parsedFeedback,
    });

    const savedResume = await newResume.save();
    res.status(201).json({ id: savedResume._id });
  } catch (error) {
    console.error("Resume Analysis Error:", error);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
};

const fetchAllResume = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(resumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching dashboard data." });
  }
};

const getResumeResult = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found or access denied." });
    }

    res.json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching resume details." });
  }
};

const deleteResume = async (req, res) => {
    try {
        const deletedResume = await Resume.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId,
        });

        if (!deletedResume) {
            return res
                .status(404)
                .json({ message: "Resume not found or access denied." });
        }

        res.json({ message: "Resume deleted successfully." });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Server error deleting resume." });
    }
};

module.exports = { analyzeResume, fetchAllResume, getResumeResult, deleteResume };