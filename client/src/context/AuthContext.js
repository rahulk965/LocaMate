import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import { authAPI } from '../services/api';

const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  UPDATE_LOCATION: 'UPDATE_LOCATION'
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false
      };
    
    case AUTH_ACTIONS.SET_TOKEN:
      localStorage.setItem('token', action.payload);
      return {
        ...state,
        token: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    
    case AUTH_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...action.payload
          }
        }
      };
    
    case AUTH_ACTIONS.UPDATE_LOCATION:
      return {
        ...state,
        user: {
          ...state.user,
          location: {
            ...state.user.location,
            ...action.payload
          }
        }
      };
    
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Fetch user profile if token exists
  const { data: userData, error: userError } = useQuery(
    ['user', 'profile'],
    () => authAPI.getProfile(),
    {
      enabled: !!state.token,
      retry: false,
      onSuccess: (data) => {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: data.user });
      },
      onError: () => {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    }
  );

  // Initialize auth state
  useEffect(() => {
    if (!state.token) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.token]);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.login(email, password);
      
      dispatch({ type: AUTH_ACTIONS.SET_TOKEN, payload: response.data.token });
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await authAPI.register(userData);
      
      dispatch({ type: AUTH_ACTIONS.SET_TOKEN, payload: response.data.token });
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.user });
      
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.data.user });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update preferences function
  const updatePreferences = async (preferences) => {
    try {
      const response = await authAPI.updatePreferences(preferences);
      
      dispatch({ type: AUTH_ACTIONS.UPDATE_PREFERENCES, payload: preferences });
      toast.success('Preferences updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Preferences update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update location function
  const updateLocation = async (location) => {
    try {
      const response = await authAPI.updateLocation(location);
      
      dispatch({ type: AUTH_ACTIONS.UPDATE_LOCATION, payload: location });
      toast.success('Location updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Location update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    try {
      await authAPI.deleteAccount();
      logout();
      toast.success('Account deleted successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Account deletion failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get user stats
  const getUserStats = async () => {
    try {
      const response = await authAPI.getUserStats();
      return response.data.stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return null;
    }
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    updateLocation,
    changePassword,
    deleteAccount,
    getUserStats
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 