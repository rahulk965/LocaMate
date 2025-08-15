import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import { placesAPI, apiUtils } from '../services/api';
import PlaceList from '../components/places/PlaceList';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Search = () => {
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites } = usePlaces();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchParams, setSearchParams] = useState({
    query: '',
    near: '',
    category: '',
    radius: 5000,
    limit: 20
  });

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setUserLocation({ lat, lng });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const handleSearch = async (query = searchQuery, near = location) => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setSearchPerformed(true);

    try {
      const params = {
        query: query.trim(),
        near: near.trim() || (userLocation ? `${userLocation.lat},${userLocation.lng}` : ''),
        radius: searchParams.radius,
        limit: searchParams.limit
      };

      const response = await placesAPI.searchPlaces(params);
      setPlaces(response.data.places || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search places');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (category) => {
    const queries = {
      restaurants: 'restaurants',
      coffee: 'coffee shops',
      attractions: 'tourist attractions',
      hotels: 'hotels',
      shopping: 'shopping centers',
      parks: 'parks and recreation'
    };

    const query = queries[category] || category;
    setSearchQuery(query);
    handleSearch(query, location);
  };

  const handleFavorite = async (place) => {
    try {
      if (place.isFavorite) {
        await placesAPI.removeFromFavorites(place.id);
        removeFromFavorites(place.id);
      } else {
        await placesAPI.addToFavorites(place);
        addToFavorites(place);
      }
      
      // Update the place in the list
      setPlaces(prev => prev.map(p => 
        p.id === place.id 
          ? { ...p, isFavorite: !p.isFavorite }
          : p
      ));
    } catch (err) {
      console.error('Failed to update favorite:', err);
    }
  };

  const handleAddToItinerary = (place) => {
    // TODO: Implement add to itinerary functionality
    console.log('Add to itinerary:', place);
  };

  const useMyLocation = () => {
    if (userLocation) {
      setLocation(`${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Discover Amazing Places</h1>
            <p className="text-xl text-primary-100 mb-8">
              Find the best restaurants, attractions, and hidden gems near you
            </p>
            
            {/* Search Form */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    size="lg"
                  />
                </div>
                
                <div className="sm:w-64">
                  <Input
                    placeholder="Location (optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    icon={<MapPinIcon className="h-5 w-5" />}
                    size="lg"
                  />
                </div>
                
                <Button
                  onClick={() => handleSearch()}
                  loading={loading}
                  size="lg"
                  className="sm:w-auto"
                >
                  Search
                </Button>
              </div>
              
              {userLocation && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={useMyLocation}
                    className="text-primary-100 hover:text-white"
                  >
                    Use my location
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Popular Searches</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['restaurants', 'coffee', 'attractions', 'hotels', 'shopping', 'parks'].map((category) => (
              <button
                key={category}
                onClick={() => handleQuickSearch(category)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-colors"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchPerformed && (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            <PlaceList
              places={places}
              loading={loading}
              onFavorite={handleFavorite}
              onAddToItinerary={handleAddToItinerary}
            />
          </div>
        )}

        {/* Empty State */}
        {!searchPerformed && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to explore?</h3>
            <p className="text-gray-600">
              Enter a search term above to discover amazing places around you
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
