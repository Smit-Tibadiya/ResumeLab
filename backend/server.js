// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter  = require("./routes/auth.js");
const resumeRouter = require("./routes/resume.js");
const cloudinary = require("cloudinary");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', process.env.FRONTEND_DOMAIN],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(express.json({limit: "50mb"})); // Allows the server to read JSON bodies from React

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRouter);

app.use("/api/resumes", resumeRouter);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
