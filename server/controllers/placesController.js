const foursquareService = require('../services/foursquareService');
const Place = require('../models/Place');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Search places nearby
// @route   GET /api/places/search
// @access  Public
const searchPlaces = asyncHandler(async (req, res) => {
  const {
    query,
    near,
    ll, // latitude,longitude
    radius = 5000,
    categories,
    limit = 20,
    sort = 'RATING'
  } = req.query;

  // Use user's location if available and no specific location provided
  let searchLocation = ll;
  if (!searchLocation && req.user?.location?.coordinates) {
    searchLocation = req.user.location.coordinates.join(',');
  }

  const searchParams = {
    query,
    near,
    ll: searchLocation,
    radius: parseInt(radius),
    categories,
    limit: parseInt(limit),
    sort
  };

  const places = await foursquareService.searchPlaces(searchParams);

  res.json({
    success: true,
    data: {
      places,
      total: places.length,
      searchParams
    }
  });
});

// @desc    Get place details
// @route   GET /api/places/:id
// @access  Public
const getPlaceDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try to get from cache first
  let place = await Place.findOne({ foursquareId: id });
  
  if (!place) {
    // Fetch from Foursquare API
    const placeData = await foursquareService.getPlaceDetails(id);
    place = placeData;
  } else {
    place = foursquareService.formatPlace(place);
  }

  // Get additional data if user is authenticated
  let userInteraction = null;
  if (req.user) {
    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.some(fav => fav.placeId === id);
    const visited = user.visitedPlaces.find(visit => visit.placeId === id);
    
    userInteraction = {
      isFavorite,
      visited: !!visited,
      rating: visited?.rating || null
    };
  }

  res.json({
    success: true,
    data: {
      place,
      userInteraction
    }
  });
});

// @desc    Get place photos
// @route   GET /api/places/:id/photos
// @access  Public
const getPlacePhotos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 10 } = req.query;

  const photos = await foursquareService.getPlacePhotos(id, parseInt(limit));

  res.json({
    success: true,
    data: {
      photos,
      total: photos.length
    }
  });
});

// @desc    Get place tips/reviews
// @route   GET /api/places/:id/tips
// @access  Public
const getPlaceTips = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 10 } = req.query;

  const tips = await foursquareService.getPlaceTips(id, parseInt(limit));

  res.json({
    success: true,
    data: {
      tips,
      total: tips.length
    }
  });
});

// @desc    Search places by category
// @route   GET /api/places/category/:category
// @access  Public
const searchByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { ll, radius = 5000, limit = 20 } = req.query;

  // Use user's location if available and no specific location provided
  let searchLocation = ll;
  if (!searchLocation && req.user?.location?.coordinates) {
    searchLocation = req.user.location.coordinates.join(',');
  }

  if (!searchLocation) {
    return res.status(400).json({
      success: false,
      message: 'Location is required for category search'
    });
  }

  const places = await foursquareService.searchByCategory(
    category,
    searchLocation,
    parseInt(radius),
    parseInt(limit)
  );

  res.json({
    success: true,
    data: {
      places,
      category,
      total: places.length
    }
  });
});

// @desc    Get trending places
// @route   GET /api/places/trending
// @access  Public
const getTrendingPlaces = asyncHandler(async (req, res) => {
  const { ll, limit = 10 } = req.query;

  // Use user's location if available and no specific location provided
  let searchLocation = ll;
  if (!searchLocation && req.user?.location?.coordinates) {
    searchLocation = req.user.location.coordinates.join(',');
  }

  if (!searchLocation) {
    return res.status(400).json({
      success: false,
      message: 'Location is required for trending places'
    });
  }

  const places = await foursquareService.getTrendingPlaces(
    searchLocation,
    parseInt(limit)
  );

  res.json({
    success: true,
    data: {
      places,
      total: places.length
    }
  });
});

// @desc    Add place to favorites
// @route   POST /api/places/favorite
// @access  Private
const addToFavorites = asyncHandler(async (req, res) => {
  const { placeId, name, category } = req.body;

  const user = await User.findById(req.user._id);
  
  // Check if already in favorites
  const existingFavorite = user.favorites.find(fav => fav.placeId === placeId);
  if (existingFavorite) {
    return res.status(400).json({
      success: false,
      message: 'Place is already in favorites'
    });
  }

  // Add to favorites
  user.favorites.push({
    placeId,
    name,
    category,
    addedAt: new Date()
  });

  await user.save();

  // Award points for adding to favorites
  await user.addPoints(5);

  res.json({
    success: true,
    message: 'Added to favorites successfully',
    data: {
      favorites: user.favorites
    }
  });
});

// @desc    Remove place from favorites
// @route   DELETE /api/places/favorite/:placeId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  const user = await User.findById(req.user._id);
  
  // Remove from favorites
  user.favorites = user.favorites.filter(fav => fav.placeId !== placeId);
  await user.save();

  res.json({
    success: true,
    message: 'Removed from favorites successfully',
    data: {
      favorites: user.favorites
    }
  });
});

// @desc    Mark place as visited
// @route   POST /api/places/visited
// @access  Private
const markAsVisited = asyncHandler(async (req, res) => {
  const { placeId, name, category, rating } = req.body;

  const user = await User.findById(req.user._id);
  
  // Check if already visited
  const existingVisit = user.visitedPlaces.find(visit => visit.placeId === placeId);
  if (existingVisit) {
    // Update rating if provided
    if (rating) {
      existingVisit.rating = rating;
    }
    existingVisit.visitedAt = new Date();
  } else {
    // Add to visited places
    user.visitedPlaces.push({
      placeId,
      name,
      category,
      visitedAt: new Date(),
      rating: rating || null
    });
  }

  await user.save();

  // Award points for visiting
  await user.addPoints(10);

  // Check for badges
  if (user.visitedPlaces.length === 1) {
    await user.addBadge('First Explorer', 'Visited your first place!');
  } else if (user.visitedPlaces.length === 10) {
    await user.addBadge('Adventure Seeker', 'Visited 10 different places!');
  }

  res.json({
    success: true,
    message: 'Marked as visited successfully',
    data: {
      visitedPlaces: user.visitedPlaces
    }
  });
});

// @desc    Get user favorites
// @route   GET /api/places/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Get detailed information for favorite places
  const favoritesWithDetails = await Promise.all(
    user.favorites.map(async (favorite) => {
      try {
        const placeDetails = await foursquareService.getPlaceDetails(favorite.placeId);
        return {
          ...favorite.toObject(),
          details: placeDetails
        };
      } catch (error) {
        return {
          ...favorite.toObject(),
          details: null
        };
      }
    })
  );

  res.json({
    success: true,
    data: {
      favorites: favoritesWithDetails
    }
  });
});

// @desc    Get user visited places
// @route   GET /api/places/visited
// @access  Private
const getVisitedPlaces = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Get detailed information for visited places
  const visitedWithDetails = await Promise.all(
    user.visitedPlaces.map(async (visited) => {
      try {
        const placeDetails = await foursquareService.getPlaceDetails(visited.placeId);
        return {
          ...visited.toObject(),
          details: placeDetails
        };
      } catch (error) {
        return {
          ...visited.toObject(),
          details: null
        };
      }
    })
  );

  res.json({
    success: true,
    data: {
      visitedPlaces: visitedWithDetails
    }
  });
});

// @desc    Get nearby places from cache
// @route   GET /api/places/nearby
// @access  Public
const getNearbyPlaces = asyncHandler(async (req, res) => {
  const { ll, radius = 5000, limit = 20 } = req.query;

  if (!ll) {
    return res.status(400).json({
      success: false,
      message: 'Location coordinates are required'
    });
  }

  const coordinates = ll.split(',').map(coord => parseFloat(coord));
  
  const places = await Place.findNearby(
    coordinates,
    parseInt(radius),
    parseInt(limit)
  );

  const formattedPlaces = places.map(place => foursquareService.formatPlace(place));

  res.json({
    success: true,
    data: {
      places: formattedPlaces,
      total: formattedPlaces.length
    }
  });
});

module.exports = {
  searchPlaces,
  getPlaceDetails,
  getPlacePhotos,
  getPlaceTips,
  searchByCategory,
  getTrendingPlaces,
  addToFavorites,
  removeFromFavorites,
  markAsVisited,
  getFavorites,
  getVisitedPlaces,
  getNearbyPlaces
}; 