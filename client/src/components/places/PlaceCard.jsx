import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, MapPinIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { apiUtils } from '../../services/api';

const PlaceCard = ({ 
  place, 
  onFavorite, 
  onAddToItinerary,
  showActions = true,
  className = '' 
}) => {
  const {
    id,
    name,
    categories,
    location,
    rating,
    price,
    hours,
    photos,
    distance,
    isFavorite = false,
    isVisited = false
  } = place;

  const primaryCategory = categories?.[0];
  const photoUrl = photos?.[0] || '/placeholder-place.jpg';

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(place);
  };

  const handleAddToItinerary = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToItinerary?.(place);
  };

  return (
    <Link 
      to={`/place/${id}`}
      className={`block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group ${className}`}
    >
      <div className="relative">
        <img 
          src={photoUrl} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {showActions && (
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={handleFavorite}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
              )}
            </button>
          </div>
        )}
        
        {isVisited && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Visited
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {name}
          </h3>
        </div>
        
        {primaryCategory && (
          <p className="text-sm text-gray-600 mb-2">
            {primaryCategory.name}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          {location?.address && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              <span className="truncate">{location.address}</span>
            </div>
          )}
          
          {distance && (
            <span>{apiUtils.formatDistance(distance)}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {rating && (
              <div className="flex items-center gap-1">
                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{rating}/10</span>
              </div>
            )}
            
            {price && (
              <span className="text-sm text-gray-600">
                {apiUtils.formatPrice(price)}
              </span>
            )}
          </div>
          
          {hours?.isOpen !== undefined && (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span className={`text-sm font-medium ${hours.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {hours.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          )}
        </div>
        
        {showActions && onAddToItinerary && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleAddToItinerary}
              className="w-full py-2 px-3 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              Add to Itinerary
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PlaceCard;
