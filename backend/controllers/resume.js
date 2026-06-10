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
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `${aiPersona}\n\nCRITICAL SCORING & OUTPUT RULES:
1. You must strictly output valid JSON matching the exact schema provided below. Do not include any introductory markdown prose or backticks.
2. EVERY score field ("overallScore" and the "score" inside each category) MUST be an integer between 0 and 100 representing a percentage match (e.g., 75, not 7.5 or 7). Never use single-digit ratings.
3. For normal mode, be fair and encouraging (scores for decent fresher resumes should realistically land between 60 and 90). For Roast Mode, you can score much lower and write sarcastic tips.

JSON Schema to follow precisely:
{ 
  "overallScore": number, 
  "ATS": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, 
  "toneAndStyle": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, 
  "content": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, 
  "structure": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, 
  "skills": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] } 
}`,
            },
            {
              role: "user",
              content: `Analyze this resume. 
            ${
              jobTitle
                ? `The candidate is applying for a ${jobTitle} role.`
                : ""
            } 
            ${
              jobDescription
                ? `Here is the job description to compare it against: ${jobDescription}`
                : "Provide a general review of the resume highlighting strengths and entry-level career improvements."
            }
            
            Resume Text: ${resumeText}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: checkRoast ? 0.75 : 0.4, // Higher temperature for wilder roasts, lower for stable, structured evaluation
        }),
      }
    );

    if (!groqResponse.ok) throw new Error("Failed to get response from Groq");
    const groqData = await groqResponse.json();
    const parsedFeedback = JSON.parse(groqData.choices[0].message.content);

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
    console.error(error);
    res.status(500).json({ message: "Server error during analysis." });
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