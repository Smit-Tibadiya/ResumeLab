const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyName: { type: String },
  jobTitle: { type: String },
  jobDescription: { type: String },
  imagePath: { type: String }, // Storing the Base64 image string
  feedback: { type: Object, required: true }, // The generated JSON from Groq
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);