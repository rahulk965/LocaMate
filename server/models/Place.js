const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  foursquareId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  categories: [{
    id: String,
    name: String,
    icon: {
      prefix: String,
      suffix: String
    }
  }],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    formattedAddress: String
  },
  contact: {
    phone: String,
    website: String,
    email: String
  },
  social: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  hours: {
    isOpen: Boolean,
    open: [{
      day: Number,
      open: String,
      close: String
    }]
  },
  price: {
    type: Number,
    min: 1,
    max: 4
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  stats: {
    totalPhotos: {
      type: Number,
      default: 0
    },
    totalTips: {
      type: Number,
      default: 0
    },
    totalCheckins: {
      type: Number,
      default: 0
    }
  },
  photos: [{
    id: String,
    prefix: String,
    suffix: String,
    width: Number,
    height: Number
  }],
  tips: [{
    id: String,
    text: String,
    createdAt: Date,
    user: {
      id: String,
      name: String,
      photo: String
    }
  }],
  attributes: {
    atmosphere: [String],
    cuisine: [String],
    features: [String],
    accessibility: [String]
  },
  popularity: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
placeSchema.index({ 'location.coordinates': '2dsphere' });
placeSchema.index({ category: 1 });
placeSchema.index({ rating: -1 });
placeSchema.index({ popularity: -1 });
placeSchema.index({ foursquareId: 1 });

// Virtual for full address
placeSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.location.address,
    this.location.city,
    this.location.state,
    this.location.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Method to update popularity based on user interactions
placeSchema.methods.updatePopularity = function() {
  const checkins = this.stats.totalCheckins || 0;
  const tips = this.stats.totalTips || 0;
  const photos = this.stats.totalPhotos || 0;
  const rating = this.rating || 0;
  
  // Calculate popularity score
  this.popularity = (checkins * 0.4) + (tips * 0.3) + (photos * 0.2) + (rating * 0.1);
  return this.save();
};

// Method to get formatted hours
placeSchema.methods.getFormattedHours = function() {
  if (!this.hours || !this.hours.open) return null;
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return this.hours.open.map(day => ({
    day: days[day.day],
    hours: `${day.open} - ${day.close}`
  }));
};

// Method to check if place is currently open
placeSchema.methods.isCurrentlyOpen = function() {
  if (!this.hours || !this.hours.isOpen) return null;
  return this.hours.isOpen;
};

// Static method to find nearby places
placeSchema.statics.findNearby = function(coordinates, maxDistance = 5000, limit = 20) {
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
    isActive: true
  })
  .sort({ popularity: -1, rating: -1 })
  .limit(limit);
};

// Static method to search places by category
placeSchema.statics.searchByCategory = function(category, coordinates, maxDistance = 5000, limit = 20) {
  return this.find({
    category: { $regex: category, $options: 'i' },
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  })
  .sort({ rating: -1, popularity: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Place', placeSchema); 