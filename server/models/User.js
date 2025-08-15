const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    cuisine: [{
      type: String,
      enum: ['italian', 'chinese', 'japanese', 'indian', 'mexican', 'american', 'french', 'thai', 'mediterranean', 'other']
    }],
    priceRange: {
      type: String,
      enum: ['budget', 'moderate', 'expensive', 'luxury'],
      default: 'moderate'
    },
    atmosphere: [{
      type: String,
      enum: ['quiet', 'vibrant', 'romantic', 'family-friendly', 'casual', 'formal', 'outdoor', 'cozy']
    }],
    activities: [{
      type: String,
      enum: ['work', 'relax', 'explore', 'dine', 'nightlife', 'culture', 'shopping', 'outdoor']
    }]
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    city: String,
    country: String
  },
  favorites: [{
    placeId: {
      type: String,
      required: true
    },
    name: String,
    category: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  visitedPlaces: [{
    placeId: {
      type: String,
      required: true
    },
    name: String,
    category: String,
    visitedAt: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user profile without sensitive data
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Add points method
userSchema.methods.addPoints = function(points) {
  this.points += points;
  return this.save();
};

// Add badge method
userSchema.methods.addBadge = function(badgeName, description) {
  const existingBadge = this.badges.find(badge => badge.name === badgeName);
  if (!existingBadge) {
    this.badges.push({ name: badgeName, description });
  }
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 