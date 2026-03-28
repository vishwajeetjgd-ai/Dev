const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/constants');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register - Register student or teacher
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Only students and teachers can register (admin is pre-seeded)
  if (role === ROLES.ADMIN) {
    throw new ApiError(400, 'Admin registration is not allowed');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || ROLES.STUDENT,
    phone: phone || '',
  });

  // Generate welcome coupon for new user (valid for 4 days)
  const welcomeCode = `WELCOME-${user._id.toString().slice(-6).toUpperCase()}`;
  const now = new Date();
  const validUntil = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  await Coupon.create({
    code: welcomeCode,
    type: 'percentage',
    value: 20,
    minOrderAmount: 50,
    maxDiscount: 100,
    isWelcome: true,
    validFrom: now,
    validUntil,
    usageLimit: 1,
    isActive: true,
    createdBy: user._id,
  });

  user.welcomeCouponAssigned = true;
  await user.save();

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
      welcomeCoupon: welcomeCode,
    },
  });
});

// POST /api/auth/login - Login any role
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Find user and include password field for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    },
  });
});

// GET /api/auth/me - Get current user profile
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        createdAt: req.user.createdAt,
      },
    },
  });
});

// PUT /api/auth/me - Update current user profile
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Profile updated',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    },
  });
});

module.exports = { register, login, getMe, updateMe };
