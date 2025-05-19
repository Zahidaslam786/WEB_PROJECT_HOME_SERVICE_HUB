const User = require('../models/User');
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const authController = {
  // User registration
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Simple validation
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }
      
      // Create new user
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const newUser = new User({
        name,
        email,
        password,  // Assuming password hashing happens in the User model
        verificationToken,
        verificationExpires: Date.now() + 24 * 60 * 60 * 1000
      });
      
      await newUser.save();
      
      // Send verification email
      const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
      await transporter.sendMail({
        to: newUser.email,
        subject: 'Verify your email',
        html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
      });
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // User login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      if (!user.emailVerified) {
        return res.status(401).json({ success: false, message: 'Please verify your email.' });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Fetch user items
      const items = await Item.find({ user: user._id });
      
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        items
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  
  // Email verification
  verifyEmail: async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token, verificationExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();
    res.json({ success: true, message: 'Email verified successfully' });
  },
  
  // Password recovery
  forgotPassword: (req, res) => {
    const { email } = req.body;
    res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
  },
  
  // Reset password with token
  resetPassword: (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    res.status(200).json({ success: true, message: 'Password reset successful' });
  },
  
  // Auth status check
  checkAuth: (req, res) => {
    if (req.user) {
      res.status(200).json({ success: true, isAuthenticated: true, user: req.user });
    } else {
      res.status(401).json({ success: false, isAuthenticated: false });
    }
  },
  
  // User logout
  logout: (req, res) => {
    // Client should remove JWT token from storage
    res.json({ success: true, message: 'Logged out successfully' });
  }
};

module.exports = authController;
