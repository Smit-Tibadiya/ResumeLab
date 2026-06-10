const Resume = require("../models/Resume.js");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const analyzeResume = async (req, res) => {
  try {
    // 1. Extract isRoastMode from the request body
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
            resolve(result.secure_url); // Resolves with the live secure URL
          }
        );

          // This guarantees the stream flows and CLOSES properly!
          streamifier.createReadStream(fileBuffer).pipe(cStream);
      });
    };

    let uploadedImageUrl = null;

    // If a file buffer exists from Multer, stream it directly
    if (req.file && req.file.buffer) {
      uploadedImageUrl = await uploadToCloudinary(req.file.buffer);
    }
      
    // 2. Set the default persona
    let aiPersona = `You are an expert ATS (Applicant Tracking System) software and a highly experienced technical recruiter. Your job is to strictly analyze the provided resume against the provided job description.Don't be too harsh consider this for freshers and come from 2nd or 3rd tier cities`;

    // 3. Override it if Roast Mode is turned on
    if (isRoastMode) {
      aiPersona = `You are an incredibly elitist, brutally honest, and sarcastic senior technical recruiter at a FAANG company. You review 500 resumes a day, and you have zero patience for fluff, bad formatting, or weak bullet points. 
  Your job is to ROAST the provided resume. Be absolutely brutal, funny, and sarcastic. Tear apart their cliches. However, your underlying feedback must still be factually accurate.`;
    }

    // 1. Send the text to Groq (Server-to-Server, so your key is hidden!)
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
              content: `${aiPersona}\n\n CRITICAL RULES: \nYou are an expert ATS software and senior technical recruiter. You must strictly output valid JSON. Use this exact schema:
            { "overallScore": number, "ATS": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, "toneAndStyle": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, "content": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, "structure": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, "skills": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] } }`,
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
                : "Provide a general review of the resume."
            }
            
            Resume Text: ${resumeText}`,
            },
          ],
          response_format: {type: "json_object"},
          temperature: 0.6,
        }),
      }
    );

    if (!groqResponse.ok) throw new Error("Failed to get response from Groq");
    const groqData = await groqResponse.json();
    const parsedFeedback = JSON.parse(groqData.choices[0].message.content);

    // 2. Save everything to MongoDB
    const newResume = new Resume({
      userId: req.user.userId, // Pulled from the JWT token
      companyName,
      jobTitle,
      jobDescription,
      imagePath: uploadedImageUrl,
      feedback: parsedFeedback,
    });

    const savedResume = await newResume.save();

    // 3. Send the new MongoDB ID back to React
    res.status(201).json({id: savedResume._id});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error during analysis."});
  }
}

const fetchAllResume = async (req, res) => {
  try {
    // Find all resumes matching this user's ID, sorted by newest first
    const resumes = await Resume.find({userId: req.user.userId}).sort({
      createdAt: -1,
    });
    res.json(resumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error fetching dashboard data."});
  }
}

const getResumeResult = async (req, res) => {
  try {
    // Ensure the resume belongs to the person requesting it
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!resume) {
      return res
        .status(404)
        .json({message: "Resume not found or access denied."});
    }

    res.json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error fetching resume details."});
  }
}

const deleteResume = async (req, res) => {
    try {
        // Find the resume by ID and ensure it belongs to the logged-in user
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