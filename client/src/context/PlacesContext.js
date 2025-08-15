import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import { placesAPI } from '../services/api';

const PlacesContext = createContext();

// Action types
const PLACES_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PLACES: 'SET_PLACES',
  SET_SELECTED_PLACE: 'SET_SELECTED_PLACE',
  SET_SEARCH_PARAMS: 'SET_SEARCH_PARAMS',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  MARK_AS_VISITED: 'MARK_AS_VISITED',
  SET_FAVORITES: 'SET_FAVORITES',
  SET_VISITED: 'SET_VISITED',
  CLEAR_PLACES: 'CLEAR_PLACES'
};

// Initial state
const initialState = {
  places: [],
  selectedPlace: null,
  searchParams: {
    query: '',
    category: '',
    radius: 5000,
    sort: 'RATING'
  },
  favorites: [],
  visited: [],
  loading: false
};

// Reducer
const placesReducer = (state, action) => {
  switch (action.type) {
    case PLACES_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case PLACES_ACTIONS.SET_PLACES:
      return {
        ...state,
        places: action.payload,
        loading: false
      };
    
    case PLACES_ACTIONS.SET_SELECTED_PLACE:
      return {
        ...state,
        selectedPlace: action.payload
      };
    
    case PLACES_ACTIONS.SET_SEARCH_PARAMS:
      return {
        ...state,
        searchParams: {
          ...state.searchParams,
          ...action.payload
        }
      };
    
    case PLACES_ACTIONS.ADD_TO_FAVORITES:
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      };
    
    case PLACES_ACTIONS.REMOVE_FROM_FAVORITES:
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.placeId !== action.payload)
      };
    
    case PLACES_ACTIONS.MARK_AS_VISITED:
      const existingVisit = state.visited.find(v => v.placeId === action.payload.placeId);
      if (existingVisit) {
        return {
          ...state,
          visited: state.visited.map(v => 
            v.placeId === action.payload.placeId 
              ? { ...v, ...action.payload }
              : v
          )
        };
      }
      return {
        ...state,
        visited: [...state.visited, action.payload]
      };
    
    case PLACES_ACTIONS.SET_FAVORITES:
      return {
        ...state,
        favorites: action.payload
      };
    
    case PLACES_ACTIONS.SET_VISITED:
      return {
        ...state,
        visited: action.payload
      };
    
    case PLACES_ACTIONS.CLEAR_PLACES:
      return {
        ...state,
        places: [],
        selectedPlace: null
      };
    
    default:
      return state;
  }
};

// Places Provider Component
export const PlacesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(placesReducer, initialState);
  const queryClient = useQueryClient();

  // Search places
  const searchPlaces = useCallback(async (params = {}) => {
    try {
      dispatch({ type: PLACES_ACTIONS.SET_LOADING, payload: true });
      
      const searchParams = { ...state.searchParams, ...params };
      dispatch({ type: PLACES_ACTIONS.SET_SEARCH_PARAMS, payload: searchParams });
      
      const response = await placesAPI.searchPlaces(searchParams);
      
      dispatch({ type: PLACES_ACTIONS.SET_PLACES, payload: response.data.places });
      return response.data.places;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search places';
      toast.error(message);
      dispatch({ type: PLACES_ACTIONS.SET_LOADING, payload: false });
      return [];
    }
  }, [state.searchParams]);

  // Get place details
  const getPlaceDetails = useCallback(async (placeId) => {
    try {
      const response = await placesAPI.getPlaceDetails(placeId);
      const place = response.data.place;
      
      dispatch({ type: PLACES_ACTIONS.SET_SELECTED_PLACE, payload: place });
      return place;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get place details';
      toast.error(message);
      return null;
    }
  }, []);

  // Add to favorites
  const addToFavorites = useCallback(async (place) => {
    try {
      await placesAPI.addToFavorites({
        placeId: place.id,
        name: place.name,
        category: place.category
      });
      
      dispatch({ type: PLACES_ACTIONS.ADD_TO_FAVORITES, payload: place });
      toast.success('Added to favorites');
      
      // Invalidate favorites query
      queryClient.invalidateQueries(['places', 'favorites']);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to favorites';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [queryClient]);

  // Remove from favorites
  const removeFromFavorites = useCallback(async (placeId) => {
    try {
      await placesAPI.removeFromFavorites(placeId);
      
      dispatch({ type: PLACES_ACTIONS.REMOVE_FROM_FAVORITES, payload: placeId });
      toast.success('Removed from favorites');
      
      // Invalidate favorites query
      queryClient.invalidateQueries(['places', 'favorites']);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from favorites';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [queryClient]);

  // Mark as visited
  const markAsVisited = useCallback(async (place, rating = null) => {
    try {
      await placesAPI.markAsVisited({
        placeId: place.id,
        name: place.name,
        category: place.category,
        rating
      });
      
      dispatch({ 
        type: PLACES_ACTIONS.MARK_AS_VISITED, 
        payload: {
          placeId: place.id,
          name: place.name,
          category: place.category,
          rating,
          visitedAt: new Date()
        }
      });
      
      toast.success('Marked as visited');
      
      // Invalidate visited places query
      queryClient.invalidateQueries(['places', 'visited']);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark as visited';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [queryClient]);

  // Get favorites
  const getFavorites = useCallback(async () => {
    try {
      const response = await placesAPI.getFavorites();
      const favorites = response.data.favorites;
      
      dispatch({ type: PLACES_ACTIONS.SET_FAVORITES, payload: favorites });
      return favorites;
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }, []);

  // Get visited places
  const getVisitedPlaces = useCallback(async () => {
    try {
      const response = await placesAPI.getVisitedPlaces();
      const visited = response.data.visitedPlaces;
      
      dispatch({ type: PLACES_ACTIONS.SET_VISITED, payload: visited });
      return visited;
    } catch (error) {
      console.error('Failed to get visited places:', error);
      return [];
    }
  }, []);

  // Search by category
  const searchByCategory = useCallback(async (category, location) => {
    try {
      dispatch({ type: PLACES_ACTIONS.SET_LOADING, payload: true });
      
      const response = await placesAPI.searchByCategory(category, location);
      
      dispatch({ type: PLACES_ACTIONS.SET_PLACES, payload: response.data.places });
      return response.data.places;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search by category';
      toast.error(message);
      dispatch({ type: PLACES_ACTIONS.SET_LOADING, payload: false });
      return [];
    }
  }, []);

  // Get trending places
  const getTrendingPlaces = useCallback(async (location) => {
    try {
      dispatch({ type: PLACES_ACTIONS.SET_LOADING, payload: true });
      
      const response = await placesAPI.getTrendingPlaces(location);
      
      dispatch({ type: PLACES_ACTIONS.SET_PLACES, payload: response.data.places });
      return response.data.places;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get trending places';
      toast.error(message);
      dispatch({ type: PLACES_ACTIONS.SET_LOADING, payload: false });
      return [];
    }
  }, []);

  // Get nearby places
  const getNearbyPlaces = useCallback(async (location, radius = 5000) => {
    try {
      dispatch({ type: PLACES_ACTIONS.SET_LOADING, payload: true });
      
      const response = await placesAPI.getNearbyPlaces(location, radius);
      
      dispatch({ type: PLACES_ACTIONS.SET_PLACES, payload: response.data.places });
      return response.data.places;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get nearby places';
      toast.error(message);
      dispatch({ type: PLACES_ACTIONS.SET_LOADING, payload: false });
      return [];
    }
  }, []);

  // Clear places
  const clearPlaces = useCallback(() => {
    dispatch({ type: PLACES_ACTIONS.CLEAR_PLACES });
  }, []);

  // Check if place is in favorites
  const isFavorite = useCallback((placeId) => {
    return state.favorites.some(fav => fav.placeId === placeId);
  }, [state.favorites]);

  // Check if place is visited
  const isVisited = useCallback((placeId) => {
    return state.visited.some(visit => visit.placeId === placeId);
  }, [state.visited]);

  // Get place rating
  const getPlaceRating = useCallback((placeId) => {
    const visited = state.visited.find(visit => visit.placeId === placeId);
    return visited?.rating || null;
  }, [state.visited]);

  const value = {
    // State
    places: state.places,
    selectedPlace: state.selectedPlace,
    searchParams: state.searchParams,
    favorites: state.favorites,
    visited: state.visited,
    loading: state.loading,
    
    // Actions
    searchPlaces,
    getPlaceDetails,
    addToFavorites,
    removeFromFavorites,
    markAsVisited,
    getFavorites,
    getVisitedPlaces,
    searchByCategory,
    getTrendingPlaces,
    getNearbyPlaces,
    clearPlaces,
    
    // Utilities
    isFavorite,
    isVisited,
    getPlaceRating
  };

  return (
    <PlacesContext.Provider value={value}>
      {children}
    </PlacesContext.Provider>
  );
};

// Custom hook to use places context
export const usePlaces = () => {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
}; 