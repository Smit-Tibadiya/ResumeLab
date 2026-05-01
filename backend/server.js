// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User.js');

const app = express();

// Middleware
app.use(cors()); // Allows your React app on port 5173 to talk to this server on port 5000
app.use(express.json({ limit: '50mb' })); // Allows the server to read JSON bodies from React

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// 1. Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Create new user (Storing password as-is for local testing)
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 2. Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check password (Direct string comparison for local testing)
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT Token so React remembers who is logged in
    const token = jwt.sign(
      { userId: user._id, name: user.name }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

const Resume = require('./models/Resume.js'); // Add this at the top with your other imports

// ==========================================
// RESUME ROUTES
// ==========================================

// Middleware to verify who is logged in
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// Analyze & Save Route
app.post('/api/resumes/analyze', authenticateToken, async (req, res) => {
  try {
    const { companyName, jobTitle, jobDescription, resumeText, imageBase64 } = req.body;

    // 1. Send the text to Groq (Server-to-Server, so your key is hidden!)
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
messages: [
          {
            role: "system",
            content: `You are an expert ATS software and senior technical recruiter. You must strictly output valid JSON. Use this exact schema:
            { "overallScore": number, "ATS": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, "toneAndStyle": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, "content": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, "structure": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] }, "skills": { "score": number, "tips": [{ "type": "improve" | "good", "tip": string, "explanation": string }] } }`
          },
          {
            role: "user",
            content: `Analyze this resume. 
            ${jobTitle ? `The candidate is applying for a ${jobTitle} role.` : ''} 
            ${jobDescription ? `Here is the job description to compare it against: ${jobDescription}` : 'Provide a general review of the resume.'}
            
            Resume Text: ${resumeText}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      })
    });

    if (!groqResponse.ok) throw new Error("Failed to get response from Groq");
    const groqData = await groqResponse.json();
    const parsedFeedback = JSON.parse(groqData.choices[0].message.content);

    // 2. Save everything to MongoDB
    const newResume = new Resume({
      userId: req.user.userId, // Pulled from the JWT token
      companyName,
      jobTitle,
      jobDescription,
      imagePath: imageBase64,
      feedback: parsedFeedback
    });

    const savedResume = await newResume.save();

    // 3. Send the new MongoDB ID back to React
    res.status(201).json({ id: savedResume._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during analysis.' });
  }
});

// ==========================================
// FETCH RESUMES ROUTES (Read from Database)
// ==========================================

// 1. Get all resumes for the logged-in user (For the Home Dashboard)
app.get('/api/resumes', authenticateToken, async (req, res) => {
  try {
    // Find all resumes matching this user's ID, sorted by newest first
    const resumes = await Resume.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching dashboard data.' });
  }
});

// 2. Get a single specific resume by its ID (For the Results Page)
app.get('/api/resumes/:id', authenticateToken, async (req, res) => {
  try {
    // Ensure the resume belongs to the person requesting it
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied.' });
    }
    
    res.json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching resume details.' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));