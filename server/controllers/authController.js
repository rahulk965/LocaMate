const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, preferences } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    preferences: preferences || {}
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if password matches
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Update last active
  user.lastActive = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  res.json({
    success: true,
    data: {
      user: user.getPublicProfile()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, preferences, location } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
      preferences,
      location
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser.getPublicProfile()
    }
  });
});

// @desc    Update user location
// @route   PUT /api/auth/location
// @access  Private
const updateLocation = asyncHandler(async (req, res) => {
  const { coordinates, city, country } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      location: {
        type: 'Point',
        coordinates,
        city,
        country
      }
    },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: {
      user: updatedUser.getPublicProfile()
    }
  });
});

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { cuisine, priceRange, atmosphere, activities } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      preferences: {
        cuisine,
        priceRange,
        atmosphere,
        activities
      }
    },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      user: updatedUser.getPublicProfile()
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Delete account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// @desc    Get user stats
// @route   GET /api/auth/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const stats = {
    totalFavorites: user.favorites.length,
    totalVisited: user.visitedPlaces.length,
    totalPoints: user.points,
    totalBadges: user.badges.length,
    memberSince: user.createdAt,
    lastActive: user.lastActive
  };

  res.json({
    success: true,
    data: {
      stats
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updateLocation,
  updatePreferences,
  changePassword,
  deleteAccount,
  getUserStats
}; 