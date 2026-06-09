const jwt = require("jsonwebtoken");
const User = require("../models/User");


const registerUser = async (req, res) => {
  try {
    const {name, email, password} = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res
        .status(400)
        .json({message: "User already exists with this email."});
    }

    // Create new user (Storing password as-is for local testing)
    const newUser = new User({name, email, password});
    await newUser.save();

    res.status(201).json({message: "User registered successfully!"});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error during registration."});
  }
}

const loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;

    // Find the user
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({message: "Invalid email or password."});
    }

    // Check password (Direct string comparison for local testing)
    if (password !== user.password) {
      return res.status(400).json({message: "Invalid email or password."});
    }

    // Generate JWT Token so React remembers who is logged in
    const token = jwt.sign(
      {userId: user._id, name: user.name},
      process.env.JWT_SECRET,
      {expiresIn: "7d"}
    );

    res.json({
      message: "Login successful",
      token,
      user: {id: user._id, name: user.name, email: user.email},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Server error during login."});
  }
}

module.exports = {
    registerUser, loginUser
}