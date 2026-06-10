const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * POST /api/auth/login
 * Login for both ADMIN and EMPLOYEE
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
      .select('+password')
      .populate('companyId', 'name description')
      .populate('departmentId', 'name description');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    // Update last seen
    await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Login successful.',
      data: { token, user: userObj }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('companyId', 'name description')
      .populate('departmentId', 'name description');

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getMe };
