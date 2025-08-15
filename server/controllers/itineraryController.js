const openaiService = require('../services/openaiService');
const foursquareService = require('../services/foursquareService');
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Generate AI itinerary
// @route   POST /api/itineraries/generate
// @access  Private
const generateItinerary = asyncHandler(async (req, res) => {
  const { prompt, location, preferences } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: 'Prompt is required'
    });
  }

  const user = await User.findById(req.user._id);
  
  // Use user's location if not provided
  const searchLocation = location || user.location?.coordinates?.join(',');
  if (!searchLocation) {
    return res.status(400).json({
      success: false,
      message: 'Location is required for itinerary generation'
    });
  }

  // Generate AI itinerary
  const aiResponse = await openaiService.generateItinerary(
    prompt,
    user.preferences,
    searchLocation
  );

  if (!aiResponse.success) {
    return res.status(500).json({
      success: false,
      message: aiResponse.error || 'Failed to generate itinerary'
    });
  }

  // Get actual places for the itinerary
  const itineraryPlaces = await Promise.all(
    aiResponse.itinerary.places.map(async (place, index) => {
      try {
        // Search for the place
        const searchResults = await foursquareService.searchPlaces({
          query: place.name,
          ll: searchLocation,
          radius: 5000,
          limit: 5
        });

        // Find the best match
        const bestMatch = searchResults.find(result => 
          result.name.toLowerCase().includes(place.name.toLowerCase()) ||
          result.category.toLowerCase().includes(place.category.toLowerCase())
        );

        return {
          placeId: bestMatch?.id || `placeholder-${index}`,
          name: bestMatch?.name || place.name,
          category: bestMatch?.category || place.category,
          order: index + 1,
          estimatedDuration: place.estimatedDuration || 60,
          notes: place.notes || '',
          details: bestMatch || null
        };
      } catch (error) {
        console.error(`Error finding place ${place.name}:`, error);
        return {
          placeId: `placeholder-${index}`,
          name: place.name,
          category: place.category,
          order: index + 1,
          estimatedDuration: place.estimatedDuration || 60,
          notes: place.notes || '',
          details: null
        };
      }
    })
  );

  // Create itinerary in database
  const itinerary = await Itinerary.create({
    user: req.user._id,
    title: aiResponse.itinerary.title,
    description: aiResponse.itinerary.description,
    type: aiResponse.itinerary.type,
    mood: aiResponse.itinerary.mood,
    purpose: aiResponse.itinerary.purpose,
    location: {
      type: 'Point',
      coordinates: searchLocation.split(',').map(coord => parseFloat(coord)),
      city: user.location?.city,
      country: user.location?.country
    },
    places: itineraryPlaces,
    totalDuration: aiResponse.itinerary.totalDuration,
    estimatedCost: aiResponse.itinerary.estimatedCost,
    tags: aiResponse.itinerary.tags,
    aiGenerated: true,
    aiPrompt: prompt
  });

  // Award points for creating itinerary
  await user.addPoints(15);

  res.json({
    success: true,
    message: 'Itinerary generated successfully',
    data: {
      itinerary: await itinerary.populate('user', 'name avatar')
    }
  });
});

// @desc    Get user itineraries
// @route   GET /api/itineraries
// @access  Private
const getUserItineraries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, status } = req.query;

  const query = { user: req.user._id };
  
  if (type) query.type = type;
  if (status === 'completed') query.isCompleted = true;
  if (status === 'active') query.isCompleted = false;

  const itineraries = await Itinerary.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'name avatar');

  const total = await Itinerary.countDocuments(query);

  res.json({
    success: true,
    data: {
      itineraries,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Get itinerary by ID
// @route   GET /api/itineraries/:id
// @access  Private
const getItinerary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const itinerary = await Itinerary.findOne({
    _id: id,
    user: req.user._id
  }).populate('user', 'name avatar');

  if (!itinerary) {
    return res.status(404).json({
      success: false,
      message: 'Itinerary not found'
    });
  }

  // Get detailed place information
  const placesWithDetails = await Promise.all(
    itinerary.places.map(async (place) => {
      if (place.placeId.startsWith('placeholder-')) {
        return place;
      }

      try {
        const placeDetails = await foursquareService.getPlaceDetails(place.placeId);
        return {
          ...place.toObject(),
          details: placeDetails
        };
      } catch (error) {
        return {
          ...place.toObject(),
          details: null
        };
      }
    })
  );

  res.json({
    success: true,
    data: {
      itinerary: {
        ...itinerary.toObject(),
        places: placesWithDetails
      }
    }
  });
});

// @desc    Update itinerary
// @route   PUT /api/itineraries/:id
// @access  Private
const updateItinerary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, places, isPublic } = req.body;

  const itinerary = await Itinerary.findOne({
    _id: id,
    user: req.user._id
  });

  if (!itinerary) {
    return res.status(404).json({
      success: false,
      message: 'Itinerary not found'
    });
  }

  // Update fields
  if (title) itinerary.title = title;
  if (description) itinerary.description = description;
  if (places) {
    itinerary.places = places;
    itinerary.updateTotals();
  }
  if (typeof isPublic === 'boolean') itinerary.isPublic = isPublic;

  await itinerary.save();

  res.json({
    success: true,
    message: 'Itinerary updated successfully',
    data: {
      itinerary: await itinerary.populate('user', 'name avatar')
    }
  });
});

// @desc    Delete itinerary
// @route   DELETE /api/itineraries/:id
// @access  Private
const deleteItinerary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const itinerary = await Itinerary.findOneAndDelete({
    _id: id,
    user: req.user._id
  });

  if (!itinerary) {
    return res.status(404).json({
      success: false,
      message: 'Itinerary not found'
    });
  }

  res.json({
    success: true,
    message: 'Itinerary deleted successfully'
  });
});

// @desc    Mark place as visited in itinerary
// @route   PUT /api/itineraries/:id/places/:placeId/visited
// @access  Private
const markPlaceVisited = asyncHandler(async (req, res) => {
  const { id, placeId } = req.params;
  const { rating } = req.body;

  const itinerary = await Itinerary.findOne({
    _id: id,
    user: req.user._id
  });

  if (!itinerary) {
    return res.status(404).json({
      success: false,
      message: 'Itinerary not found'
    });
  }

  await itinerary.markPlaceVisited(placeId, rating);

  res.json({
    success: true,
    message: 'Place marked as visited',
    data: {
      itinerary: await itinerary.populate('user', 'name avatar')
    }
  });
});

// @desc    Add place to itinerary
// @route   POST /api/itineraries/:id/places
// @access  Private
const addPlaceToItinerary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { placeId, name, category, estimatedDuration, notes } = req.body;

  const itinerary = await Itinerary.findOne({
    _id: id,
    user: req.user._id
  });

  if (!itinerary) {
    return res.status(404).json({
      success: false,
      message: 'Itinerary not found'
    });
  }

  await itinerary.addPlace({
    placeId,
    name,
    category,
    estimatedDuration: estimatedDuration || 60,
    notes: notes || ''
  });

  res.json({
    success: true,
    message: 'Place added to itinerary',
    data: {
      itinerary: await itinerary.populate('user', 'name avatar')
    }
  });
});

// @desc    Remove place from itinerary
// @route   DELETE /api/itineraries/:id/places/:placeId
// @access  Private
const removePlaceFromItinerary = asyncHandler(async (req, res) => {
  const { id, placeId } = req.params;

  const itinerary = await Itinerary.findOne({
    _id: id,
    user: req.user._id
  });

  if (!itinerary) {
    return res.status(404).json({
      success: false,
      message: 'Itinerary not found'
    });
  }

  await itinerary.removePlace(placeId);

  res.json({
    success: true,
    message: 'Place removed from itinerary',
    data: {
      itinerary: await itinerary.populate('user', 'name avatar')
    }
  });
});

// @desc    Get popular itineraries
// @route   GET /api/itineraries/popular
// @access  Public
const getPopularItineraries = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const itineraries = await Itinerary.findPopular(parseInt(limit));

  res.json({
    success: true,
    data: {
      itineraries
    }
  });
});

// @desc    Get itineraries by location
// @route   GET /api/itineraries/location
// @access  Public
const getItinerariesByLocation = asyncHandler(async (req, res) => {
  const { ll, radius = 50000, limit = 20 } = req.query;

  if (!ll) {
    return res.status(400).json({
      success: false,
      message: 'Location coordinates are required'
    });
  }

  const coordinates = ll.split(',').map(coord => parseFloat(coord));
  const itineraries = await Itinerary.findByLocation(coordinates, parseInt(radius), parseInt(limit));

  res.json({
    success: true,
    data: {
      itineraries
    }
  });
});

// @desc    Like/unlike itinerary
// @route   POST /api/itineraries/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const itinerary = await Itinerary.findById(id);
  if (!itinerary) {
    return res.status(404).json({
      success: false,
      message: 'Itinerary not found'
    });
  }

  await itinerary.toggleLike(req.user._id);

  res.json({
    success: true,
    message: 'Like toggled successfully',
    data: {
      likeCount: itinerary.likes.length
    }
  });
});

// @desc    Share itinerary
// @route   POST /api/itineraries/:id/share
// @access  Private
const shareItinerary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const itinerary = await Itinerary.findOne({
    _id: id,
    user: req.user._id
  });

  if (!itinerary) {
    return res.status(404).json({
      success: false,
      message: 'Itinerary not found'
    });
  }

  itinerary.shares += 1;
  await itinerary.save();

  res.json({
    success: true,
    message: 'Itinerary shared successfully',
    data: {
      shares: itinerary.shares
    }
  });
});

module.exports = {
  generateItinerary,
  getUserItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  markPlaceVisited,
  addPlaceToItinerary,
  removePlaceFromItinerary,
  getPopularItineraries,
  getItinerariesByLocation,
  toggleLike,
  shareItinerary
}; 