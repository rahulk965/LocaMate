const axios = require('axios');
const config = require('../config/config');
const Place = require('../models/Place');

class FoursquareService {
  constructor() {
    this.baseURL = config.foursquare.baseUrl;
    this.apiKey = config.foursquareApiKey;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': this.apiKey,
        'Accept': 'application/json'
      },
      timeout: 10000
    });
  }

  // Search for places nearby
  async searchPlaces(params) {
    try {
      const {
        query = '',
        near = '',
        ll = '', // latitude,longitude
        radius = config.foursquare.defaultRadius,
        categories = '',
        limit = 20,
        sort = 'RATING' // RATING, POPULARITY, DISTANCE
      } = params;

      const searchParams = {
        query,
        near,
        ll,
        radius,
        categories,
        limit,
        sort
      };

      // Remove empty parameters
      Object.keys(searchParams).forEach(key => {
        if (!searchParams[key]) delete searchParams[key];
      });

      const response = await this.client.get('/places/search', {
        params: searchParams
      });

      const places = response.data.results || [];
      
      // Cache places in database
      await this.cachePlaces(places);
      
      return this.formatPlaces(places);
    } catch (error) {
      console.error('Foursquare search error:', error.response?.data || error.message);
      throw new Error('Failed to search places');
    }
  }

  // Get detailed information about a specific place
  async getPlaceDetails(fsqId) {
    try {
      // Check cache first
      const cachedPlace = await Place.findOne({ foursquareId: fsqId });
      if (cachedPlace && this.isCacheValid(cachedPlace.lastUpdated)) {
        return this.formatPlace(cachedPlace);
      }

      const response = await this.client.get(`/places/${fsqId}`);
      const placeData = response.data;
      
      // Cache the place
      await this.cachePlace(placeData);
      
      return this.formatPlace(placeData);
    } catch (error) {
      console.error('Foursquare place details error:', error.response?.data || error.message);
      throw new Error('Failed to get place details');
    }
  }

  // Get place photos
  async getPlacePhotos(fsqId, limit = 10) {
    try {
      const response = await this.client.get(`/places/${fsqId}/photos`, {
        params: { limit }
      });
      
      return response.data.photos || [];
    } catch (error) {
      console.error('Foursquare photos error:', error.response?.data || error.message);
      return [];
    }
  }

  // Get place tips/reviews
  async getPlaceTips(fsqId, limit = 10) {
    try {
      const response = await this.client.get(`/places/${fsqId}/tips`, {
        params: { limit }
      });
      
      return response.data.tips || [];
    } catch (error) {
      console.error('Foursquare tips error:', error.response?.data || error.message);
      return [];
    }
  }

  // Search by category
  async searchByCategory(category, location, radius = 5000, limit = 20) {
    try {
      const categoryId = this.getCategoryId(category);
      if (!categoryId) {
        throw new Error('Invalid category');
      }

      return await this.searchPlaces({
        categories: categoryId,
        ll: location,
        radius,
        limit
      });
    } catch (error) {
      console.error('Category search error:', error);
      throw error;
    }
  }

  // Get trending places
  async getTrendingPlaces(location, limit = 10) {
    try {
      const response = await this.client.get('/places/trending', {
        params: {
          ll: location,
          limit
        }
      });
      
      const places = response.data.results || [];
      await this.cachePlaces(places);
      
      return this.formatPlaces(places);
    } catch (error) {
      console.error('Trending places error:', error.response?.data || error.message);
      throw new Error('Failed to get trending places');
    }
  }

  // Cache place in database
  async cachePlace(placeData) {
    try {
      const placeDoc = {
        foursquareId: placeData.fsq_id,
        name: placeData.name,
        description: placeData.description || '',
        category: placeData.categories?.[0]?.name || 'Unknown',
        categories: placeData.categories || [],
        location: {
          address: placeData.location?.address || '',
          city: placeData.location?.locality || '',
          state: placeData.location?.region || '',
          country: placeData.location?.country || '',
          coordinates: {
            type: 'Point',
            coordinates: [
              placeData.geocodes?.main?.longitude || 0,
              placeData.geocodes?.main?.latitude || 0
            ]
          },
          formattedAddress: placeData.location?.formatted_address || ''
        },
        contact: {
          phone: placeData.tel || '',
          website: placeData.website || '',
          email: placeData.email || ''
        },
        social: {
          facebook: placeData.social_media?.facebook || '',
          instagram: placeData.social_media?.instagram || '',
          twitter: placeData.social_media?.twitter || ''
        },
        hours: {
          isOpen: placeData.hours?.is_open || false,
          open: placeData.hours?.open || []
        },
        price: placeData.price || 0,
        rating: placeData.rating || 0,
        stats: {
          totalPhotos: placeData.stats?.total_photos || 0,
          totalTips: placeData.stats?.total_tips || 0,
          totalCheckins: placeData.stats?.total_checkins || 0
        },
        attributes: {
          atmosphere: placeData.attributes?.groups?.[0]?.items?.map(item => item.name) || [],
          cuisine: placeData.attributes?.groups?.[1]?.items?.map(item => item.name) || [],
          features: placeData.attributes?.groups?.[2]?.items?.map(item => item.name) || [],
          accessibility: placeData.attributes?.groups?.[3]?.items?.map(item => item.name) || []
        }
      };

      await Place.findOneAndUpdate(
        { foursquareId: placeData.fsq_id },
        placeDoc,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Cache place error:', error);
    }
  }

  // Cache multiple places
  async cachePlaces(places) {
    try {
      for (const place of places) {
        await this.cachePlace(place);
      }
    } catch (error) {
      console.error('Cache places error:', error);
    }
  }

  // Check if cache is still valid (24 hours)
  isCacheValid(lastUpdated) {
    const cacheAge = Date.now() - new Date(lastUpdated).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return cacheAge < maxAge;
  }

  // Format place data for consistent response
  formatPlace(place) {
    return {
      id: place.foursquareId || place.fsq_id,
      name: place.name,
      description: place.description,
      category: place.category,
      categories: place.categories,
      location: place.location,
      contact: place.contact,
      social: place.social,
      hours: place.hours,
      price: place.price,
      rating: place.rating,
      stats: place.stats,
      photos: place.photos || [],
      tips: place.tips || [],
      attributes: place.attributes,
      popularity: place.popularity || 0,
      isOpen: place.hours?.isOpen || false
    };
  }

  // Format multiple places
  formatPlaces(places) {
    return places.map(place => this.formatPlace(place));
  }

  // Get category ID from category name
  getCategoryId(category) {
    const categoryMap = {
      'restaurant': '13065',
      'cafe': '13032',
      'bar': '13003',
      'coffee': '13032',
      'pizza': '13065',
      'italian': '13065',
      'chinese': '13065',
      'japanese': '13065',
      'indian': '13065',
      'mexican': '13065',
      'american': '13065',
      'french': '13065',
      'thai': '13065',
      'mediterranean': '13065',
      'park': '16032',
      'museum': '10000',
      'art': '10000',
      'theater': '14000',
      'cinema': '14000',
      'shopping': '17000',
      'retail': '17000',
      'gym': '18000',
      'fitness': '18000',
      'spa': '11100',
      'beauty': '11100',
      'hotel': '19000',
      'lodging': '19000'
    };
    
    return categoryMap[category.toLowerCase()];
  }
}

module.exports = new FoursquareService(); 