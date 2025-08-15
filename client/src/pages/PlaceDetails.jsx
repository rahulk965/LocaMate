import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  StarIcon, 
  ClockIcon, 
  PhoneIcon, 
  GlobeAltIcon, 
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { placesAPI, apiUtils } from '../services/api';
import Button from '../components/ui/Button';

const PlaceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites } = usePlaces();
  
  const [place, setPlace] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    loadPlaceDetails();
  }, [id]);

  const loadPlaceDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Load place details
      const placeResponse = await placesAPI.getPlaceDetails(id);
      setPlace(placeResponse.data.place);

      // Load photos
      try {
        const photosResponse = await placesAPI.getPlacePhotos(id, 10);
        setPhotos(photosResponse.data.photos || []);
      } catch (err) {
        console.log('Failed to load photos:', err);
      }

      // Load tips
      try {
        const tipsResponse = await placesAPI.getPlaceTips(id, 10);
        setTips(tipsResponse.data.tips || []);
      } catch (err) {
        console.log('Failed to load tips:', err);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load place details');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      // Redirect to login
      return;
    }

    try {
      if (place.isFavorite) {
        await placesAPI.removeFromFavorites(place.id);
        removeFromFavorites(place.id);
      } else {
        await placesAPI.addToFavorites(place);
        addToFavorites(place);
      }
      
      setPlace(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    } catch (err) {
      console.error('Failed to update favorite:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `Check out ${place.name} on LocaNate!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleAddToItinerary = () => {
    // TODO: Implement add to itinerary functionality
    console.log('Add to itinerary:', place);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not available';
    return timeString;
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Not available';
    return phone;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Place Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The place you are looking for does not exist.'}</p>
          <Link to="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/search" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Search</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <ShareIcon className="h-4 w-4" />
                Share
              </Button>
              
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 ${
                    place.isFavorite ? 'text-red-600 border-red-300' : ''
                  }`}
                >
                  {place.isFavorite ? (
                    <HeartSolidIcon className="h-4 w-4" />
                  ) : (
                    <HeartIcon className="h-4 w-4" />
                  )}
                  {place.isFavorite ? 'Saved' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photos */}
            {photos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative">
                  <img
                    src={photos[activePhotoIndex]?.url || place.photos?.[0]}
                    alt={place.name}
                    className="w-full h-96 object-cover"
                  />
                  
                  {photos.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {photos.slice(0, 5).map((photo, index) => (
                          <button
                            key={index}
                            onClick={() => setActivePhotoIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                              index === activePhotoIndex ? 'border-primary-500' : 'border-white'
                            }`}
                          >
                            <img
                              src={photo.url}
                              alt={`${place.name} photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                        {photos.length > 5 && (
                          <button
                            onClick={() => setShowAllPhotos(true)}
                            className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-800 text-white flex items-center justify-center text-sm font-medium"
                          >
                            +{photos.length - 5}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Place Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{place.name}</h1>
                  {place.categories?.[0] && (
                    <p className="text-lg text-gray-600">{place.categories[0].name}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {place.rating && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-medium">{place.rating}/10</span>
                    </div>
                  )}
                  
                  {place.price && (
                    <span className="text-gray-600">{apiUtils.formatPrice(place.price)}</span>
                  )}
                </div>
              </div>

              {/* Location */}
              {place.location?.address && (
                <div className="flex items-start gap-3 mb-6">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{place.location.address}</p>
                    {place.location.city && (
                      <p className="text-gray-600">{place.location.city}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Hours */}
              {place.hours && (
                <div className="flex items-start gap-3 mb-6">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">
                      {place.hours.isOpen ? 'Open now' : 'Closed'}
                    </p>
                    {place.hours.status && (
                      <p className="text-gray-600">{place.hours.status}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {place.contact?.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <a 
                      href={`tel:${place.contact.phone}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {formatPhone(place.contact.phone)}
                    </a>
                  </div>
                )}
                
                {place.contact?.website && (
                  <div className="flex items-center gap-3">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                    <a 
                      href={place.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            {tips.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips from Visitors</h2>
                <div className="space-y-4">
                  {tips.map((tip, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4">
                      <p className="text-gray-700">{tip.text}</p>
                      {tip.user && (
                        <p className="text-sm text-gray-500 mt-1">- {tip.user}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleAddToItinerary}
                  fullWidth
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add to Itinerary
                </Button>
                
                {place.location?.lat && place.location?.lng && (
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
                      window.open(url, '_blank');
                    }}
                  >
                    Get Directions
                  </Button>
                )}
              </div>
            </div>

            {/* Similar Places */}
            {place.categories?.[0] && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  More {place.categories[0].name}
                </h3>
                <p className="text-gray-600 text-sm">
                  Discover more places like this in the area
                </p>
                <Link to={`/search?category=${place.categories[0].name}&location=${place.location?.address}`}>
                  <Button variant="outline" fullWidth className="mt-4">
                    Explore More
                  </Button>
                </Link>
              </div>
            )}

            {/* Place Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Information</h3>
              
              <div className="space-y-3 text-sm">
                {place.stats?.totalPhotos && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Photos</span>
                    <span className="font-medium">{place.stats.totalPhotos}</span>
                  </div>
                )}
                
                {place.stats?.totalTips && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tips</span>
                    <span className="font-medium">{place.stats.totalTips}</span>
                  </div>
                )}
                
                {place.stats?.totalCheckins && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-ins</span>
                    <span className="font-medium">{place.stats.totalCheckins}</span>
                  </div>
                )}
                
                {place.stats?.totalLikes && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Likes</span>
                    <span className="font-medium">{place.stats.totalLikes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;
