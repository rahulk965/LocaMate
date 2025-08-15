const openaiService = require('../services/openaiService');
const foursquareService = require('../services/foursquareService');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Process chat message
// @route   POST /api/chat/conversation
// @access  Public
const processChatMessage = asyncHandler(async (req, res) => {
  const { message, location, context } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  // Get user context if authenticated
  let userContext = {};
  if (req.user) {
    const user = await User.findById(req.user._id);
    userContext = {
      preferences: user.preferences,
      location: user.location,
      history: {
        favorites: user.favorites.length,
        visited: user.visitedPlaces.length,
        points: user.points
      }
    };
  }

  // Extract intent and entities from message
  const intent = await openaiService.extractIntent(message);
  
  // Get available places if location is provided
  let availablePlaces = [];
  if (location || userContext.location) {
    try {
      const searchLocation = location || userContext.location.coordinates.join(',');
      availablePlaces = await foursquareService.searchPlaces({
        ll: searchLocation,
        radius: 5000,
        limit: 10
      });
    } catch (error) {
      console.error('Error fetching available places:', error);
    }
  }

  // Process message with AI
  const aiResponse = await openaiService.processChatMessage(
    message,
    userContext,
    availablePlaces
  );

  // Add intent information to response
  const response = {
    ...aiResponse,
    intent,
    context: {
      location: location || userContext.location,
      timeOfDay: getTimeOfDay(),
      availablePlaces: availablePlaces.length
    }
  };

  res.json({
    success: true,
    data: response
  });
});

// @desc    Get personalized recommendations
// @route   POST /api/chat/recommendations
// @access  Private
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const { context, location } = req.body;

  const user = await User.findById(req.user._id);
  
  if (!user.location && !location) {
    return res.status(400).json({
      success: false,
      message: 'Location is required for personalized recommendations'
    });
  }

  const searchLocation = location || user.location.coordinates.join(',');
  
  // Get AI recommendations
  const aiRecommendations = await openaiService.generateRecommendations(
    user.preferences,
    searchLocation,
    context
  );

  // Get actual places based on recommendations
  let recommendedPlaces = [];
  if (aiRecommendations.success && aiRecommendations.recommendations) {
    try {
      const places = await foursquareService.searchPlaces({
        ll: searchLocation,
        radius: 5000,
        limit: 20
      });

      // Match AI recommendations with actual places
      recommendedPlaces = aiRecommendations.recommendations.recommendations.map(rec => {
        const matchingPlace = places.find(place => 
          place.name.toLowerCase().includes(rec.place.toLowerCase()) ||
          place.category.toLowerCase().includes(rec.category.toLowerCase())
        );
        
        return {
          ...rec,
          place: matchingPlace || null
        };
      }).filter(rec => rec.place);
    } catch (error) {
      console.error('Error fetching recommended places:', error);
    }
  }

  res.json({
    success: true,
    data: {
      recommendations: recommendedPlaces,
      summary: aiRecommendations.recommendations?.summary || '',
      userPreferences: user.preferences
    }
  });
});

// @desc    Get contextual suggestions
// @route   GET /api/chat/suggestions
// @access  Public
const getContextualSuggestions = asyncHandler(async (req, res) => {
  const { location, timeOfDay, mood, purpose } = req.query;

  const suggestions = generateContextualSuggestions({
    location,
    timeOfDay: timeOfDay || getTimeOfDay(),
    mood,
    purpose
  });

  res.json({
    success: true,
    data: {
      suggestions
    }
  });
});

// @desc    Get quick responses
// @route   GET /api/chat/quick-responses
// @access  Public
const getQuickResponses = asyncHandler(async (req, res) => {
  const { context } = req.query;

  const quickResponses = generateQuickResponses(context);

  res.json({
    success: true,
    data: {
      quickResponses
    }
  });
});

// @desc    Analyze user preferences from conversation
// @route   POST /api/chat/analyze-preferences
// @access  Private
const analyzePreferences = asyncHandler(async (req, res) => {
  const { conversationHistory } = req.body;

  if (!conversationHistory || conversationHistory.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Conversation history is required'
    });
  }

  // Analyze conversation to extract preferences
  const analysis = await analyzeConversationForPreferences(conversationHistory);

  // Update user preferences if new insights found
  if (analysis.newPreferences) {
    const user = await User.findById(req.user._id);
    
    // Merge new preferences with existing ones
    user.preferences = {
      ...user.preferences,
      ...analysis.newPreferences
    };
    
    await user.save();
  }

  res.json({
    success: true,
    data: {
      analysis,
      updatedPreferences: analysis.newPreferences ? true : false
    }
  });
});

// Helper function to get time of day
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Helper function to generate contextual suggestions
const generateContextualSuggestions = ({ location, timeOfDay, mood, purpose }) => {
  const suggestions = [];

  // Time-based suggestions
  switch (timeOfDay) {
    case 'morning':
      suggestions.push(
        'Find me a good coffee shop for breakfast',
        'Show me places to start my day',
        'I need a quiet place to work this morning'
      );
      break;
    case 'afternoon':
      suggestions.push(
        'Find me a lunch spot',
        'Show me places to explore this afternoon',
        'I need a place to relax and recharge'
      );
      break;
    case 'evening':
      suggestions.push(
        'Find me a nice restaurant for dinner',
        'Show me evening entertainment options',
        'I want to unwind after work'
      );
      break;
    case 'night':
      suggestions.push(
        'Find me late-night food options',
        'Show me nightlife spots',
        'I need a quiet place to work late'
      );
      break;
  }

  // Mood-based suggestions
  if (mood) {
    switch (mood.toLowerCase()) {
      case 'energetic':
        suggestions.push('Find me active and vibrant places');
        break;
      case 'relaxed':
        suggestions.push('Find me peaceful and quiet spots');
        break;
      case 'romantic':
        suggestions.push('Find me romantic date spots');
        break;
      case 'social':
        suggestions.push('Find me great places to meet people');
        break;
    }
  }

  // Purpose-based suggestions
  if (purpose) {
    switch (purpose.toLowerCase()) {
      case 'work':
        suggestions.push('Find me coworking spaces', 'Show me quiet cafes for work');
        break;
      case 'explore':
        suggestions.push('Find me interesting places to discover', 'Show me local attractions');
        break;
      case 'dine':
        suggestions.push('Find me the best restaurants', 'Show me unique dining experiences');
        break;
      case 'relax':
        suggestions.push('Find me peaceful spots', 'Show me wellness places');
        break;
    }
  }

  return suggestions.slice(0, 5); // Limit to 5 suggestions
};

// Helper function to generate quick responses
const generateQuickResponses = (context) => {
  const responses = [
    'Find me a coffee shop nearby',
    'Show me restaurants in the area',
    'What\'s popular around here?',
    'Find me a quiet place to work',
    'Show me places to explore',
    'Find me a good spot for dinner',
    'What\'s trending in this area?',
    'Find me outdoor activities'
  ];

  if (context) {
    switch (context.toLowerCase()) {
      case 'food':
        responses.unshift('Find me the best pizza', 'Show me healthy food options');
        break;
      case 'work':
        responses.unshift('Find me coworking spaces', 'Show me quiet cafes');
        break;
      case 'entertainment':
        responses.unshift('Find me live music', 'Show me movie theaters');
        break;
    }
  }

  return responses.slice(0, 8);
};

// Helper function to analyze conversation for preferences
const analyzeConversationForPreferences = async (conversationHistory) => {
  try {
    const analysis = {
      detectedPreferences: {},
      confidence: 0,
      newPreferences: null
    };

    // Simple keyword analysis (in a real implementation, this would use more sophisticated NLP)
    const text = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();
    
    // Detect cuisine preferences
    const cuisines = ['italian', 'chinese', 'japanese', 'indian', 'mexican', 'american', 'french', 'thai'];
    const detectedCuisines = cuisines.filter(cuisine => text.includes(cuisine));
    
    if (detectedCuisines.length > 0) {
      analysis.detectedPreferences.cuisine = detectedCuisines;
    }

    // Detect atmosphere preferences
    const atmospheres = ['quiet', 'vibrant', 'romantic', 'casual', 'formal', 'outdoor'];
    const detectedAtmospheres = atmospheres.filter(atmosphere => text.includes(atmosphere));
    
    if (detectedAtmospheres.length > 0) {
      analysis.detectedPreferences.atmosphere = detectedAtmospheres;
    }

    // Detect price preferences
    if (text.includes('cheap') || text.includes('budget') || text.includes('affordable')) {
      analysis.detectedPreferences.priceRange = 'budget';
    } else if (text.includes('expensive') || text.includes('luxury') || text.includes('high-end')) {
      analysis.detectedPreferences.priceRange = 'expensive';
    }

    // Calculate confidence based on number of detected preferences
    const totalDetected = Object.keys(analysis.detectedPreferences).length;
    analysis.confidence = Math.min(totalDetected * 0.3, 1);

    // Only suggest new preferences if confidence is high enough
    if (analysis.confidence > 0.5) {
      analysis.newPreferences = analysis.detectedPreferences;
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    return {
      detectedPreferences: {},
      confidence: 0,
      newPreferences: null
    };
  }
};

module.exports = {
  processChatMessage,
  getPersonalizedRecommendations,
  getContextualSuggestions,
  getQuickResponses,
  analyzePreferences
}; 