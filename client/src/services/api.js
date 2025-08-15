import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  updateLocation: (location) => api.put('/auth/location', location),
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/password', { currentPassword, newPassword }),
  deleteAccount: () => api.delete('/auth/account'),
  getUserStats: () => api.get('/auth/stats'),
};

// Places API
export const placesAPI = {
  searchPlaces: (params) => api.get('/places/search', { params }),
  getPlaceDetails: (id) => api.get(`/places/${id}`),
  getPlacePhotos: (id, limit = 10) => 
    api.get(`/places/${id}/photos`, { params: { limit } }),
  getPlaceTips: (id, limit = 10) => 
    api.get(`/places/${id}/tips`, { params: { limit } }),
  searchByCategory: (category, location) => 
    api.get(`/places/category/${category}`, { params: { ll: location } }),
  getTrendingPlaces: (location, limit = 10) => 
    api.get('/places/trending', { params: { ll: location, limit } }),
  getNearbyPlaces: (location, radius = 5000, limit = 20) => 
    api.get('/places/nearby', { params: { ll: location, radius, limit } }),
  addToFavorites: (placeData) => api.post('/places/favorite', placeData),
  removeFromFavorites: (placeId) => api.delete(`/places/favorite/${placeId}`),
  markAsVisited: (placeData) => api.post('/places/visited', placeData),
  getFavorites: () => api.get('/places/favorites'),
  getVisitedPlaces: () => api.get('/places/visited'),
};

// Chat API
export const chatAPI = {
  processMessage: (message, location, context) => 
    api.post('/chat/conversation', { message, location, context }),
  getRecommendations: (context, location) => 
    api.post('/chat/recommendations', { context, location }),
  getSuggestions: (params) => api.get('/chat/suggestions', { params }),
  getQuickResponses: (context) => 
    api.get('/chat/quick-responses', { params: { context } }),
  analyzePreferences: (conversationHistory) => 
    api.post('/chat/analyze-preferences', { conversationHistory }),
};

// Itinerary API
export const itineraryAPI = {
  generateItinerary: (prompt, location, preferences) => 
    api.post('/itineraries/generate', { prompt, location, preferences }),
  getUserItineraries: (params) => api.get('/itineraries', { params }),
  getItinerary: (id) => api.get(`/itineraries/${id}`),
  updateItinerary: (id, data) => api.put(`/itineraries/${id}`, data),
  deleteItinerary: (id) => api.delete(`/itineraries/${id}`),
  addPlaceToItinerary: (id, placeData) => 
    api.post(`/itineraries/${id}/places`, placeData),
  removePlaceFromItinerary: (id, placeId) => 
    api.delete(`/itineraries/${id}/places/${placeId}`),
  markPlaceVisited: (id, placeId, rating) => 
    api.put(`/itineraries/${id}/places/${placeId}/visited`, { rating }),
  getPopularItineraries: (limit = 10) => 
    api.get('/itineraries/popular', { params: { limit } }),
  getItinerariesByLocation: (location, radius = 50000, limit = 20) => 
    api.get('/itineraries/location', { params: { ll: location, radius, limit } }),
  toggleLike: (id) => api.post(`/itineraries/${id}/like`),
  shareItinerary: (id) => api.post(`/itineraries/${id}/share`),
};

// Utility functions
export const apiUtils = {
  // Format coordinates for API
  formatCoordinates: (lat, lng) => `${lng},${lat}`,
  
  // Parse coordinates from API
  parseCoordinates: (coordString) => {
    const [lng, lat] = coordString.split(',').map(Number);
    return { lat, lng };
  },
  
  // Get user location
  getUserLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          resolve({ lat, lng });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },
  
  // Calculate distance between two points
  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
  
  // Format distance for display
  formatDistance: (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  },
  
  // Format rating for display
  formatRating: (rating) => {
    if (!rating) return 'No rating';
    return `${rating}/10`;
  },
  
  // Format price for display
  formatPrice: (price) => {
    if (!price) return 'Price not available';
    return '$'.repeat(price);
  },
  
  // Get time of day
  getTimeOfDay: () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  },
  
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

export default api; 