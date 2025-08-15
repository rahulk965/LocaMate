const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'full-day', 'custom'],
    default: 'custom'
  },
  mood: {
    type: String,
    enum: ['relaxed', 'energetic', 'romantic', 'adventurous', 'social', 'productive', 'cultural'],
    default: 'relaxed'
  },
  purpose: {
    type: String,
    enum: ['work', 'relax', 'explore', 'dine', 'nightlife', 'culture', 'shopping', 'outdoor'],
    default: 'explore'
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    city: String,
    country: String
  },
  places: [{
    placeId: {
      type: String,
      required: true
    },
    name: String,
    category: String,
    order: {
      type: Number,
      required: true
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 60
    },
    notes: String,
    isVisited: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  totalDistance: {
    type: Number, // in meters
    default: 0
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String, // The original prompt that generated this itinerary
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number,
    forecast: String
  }
}, {
  timestamps: true
});

// Indexes
itinerarySchema.index({ user: 1, createdAt: -1 });
itinerarySchema.index({ 'location.coordinates': '2dsphere' });
itinerarySchema.index({ type: 1, mood: 1, purpose: 1 });
itinerarySchema.index({ isPublic: 1, likes: -1 });

// Virtual for like count
itinerarySchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for completion percentage
itinerarySchema.virtual('completionPercentage').get(function() {
  if (this.places.length === 0) return 0;
  const visitedPlaces = this.places.filter(place => place.isVisited).length;
  return Math.round((visitedPlaces / this.places.length) * 100);
});

// Method to add a place to itinerary
itinerarySchema.methods.addPlace = function(placeData) {
  const maxOrder = this.places.length > 0 
    ? Math.max(...this.places.map(p => p.order)) 
    : 0;
  
  this.places.push({
    ...placeData,
    order: maxOrder + 1
  });
  
  this.updateTotals();
  return this.save();
};

// Method to remove a place from itinerary
itinerarySchema.methods.removePlace = function(placeId) {
  this.places = this.places.filter(place => place.placeId !== placeId);
  
  // Reorder remaining places
  this.places.forEach((place, index) => {
    place.order = index + 1;
  });
  
  this.updateTotals();
  return this.save();
};

// Method to mark place as visited
itinerarySchema.methods.markPlaceVisited = function(placeId, rating = null) {
  const place = this.places.find(p => p.placeId === placeId);
  if (place) {
    place.isVisited = true;
    if (rating) place.rating = rating;
  }
  
  // Check if all places are visited
  if (this.places.every(p => p.isVisited)) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Method to update totals
itinerarySchema.methods.updateTotals = function() {
  this.totalDuration = this.places.reduce((total, place) => total + place.estimatedDuration, 0);
  // Note: totalDistance would need to be calculated using a mapping service
  return this;
};

// Method to like/unlike itinerary
itinerarySchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

// Static method to find popular itineraries
itinerarySchema.statics.findPopular = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ 'likes.length': -1, shares: -1 })
    .limit(limit)
    .populate('user', 'name avatar')
    .populate('likes.user', 'name avatar');
};

// Static method to find itineraries by location
itinerarySchema.statics.findByLocation = function(coordinates, maxDistance = 50000, limit = 20) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isPublic: true
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('user', 'name avatar');
};

// Static method to generate AI itinerary
itinerarySchema.statics.generateAIItinerary = function(userId, prompt, location, preferences) {
  // This would integrate with OpenAI service
  // For now, return a basic structure
  return {
    user: userId,
    title: `AI Generated Itinerary`,
    description: `Generated based on: ${prompt}`,
    location: location,
    aiGenerated: true,
    aiPrompt: prompt,
    places: [],
    tags: ['ai-generated']
  };
};

module.exports = mongoose.model('Itinerary', itinerarySchema); 