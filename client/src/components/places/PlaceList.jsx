import React, { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import PlaceCard from './PlaceCard';
import Button from '../ui/Button';
import Input from '../ui/Input';

const PlaceList = ({ 
  places = [], 
  loading = false, 
  onFavorite, 
  onAddToItinerary,
  onLoadMore,
  hasMore = false,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([1, 4]);
  const [ratingFilter, setRatingFilter] = useState(0);

  // Get unique categories from places
  const categories = useMemo(() => {
    const categorySet = new Set();
    places.forEach(place => {
      place.categories?.forEach(cat => categorySet.add(cat.name));
    });
    return Array.from(categorySet);
  }, [places]);

  // Filter and sort places
  const filteredPlaces = useMemo(() => {
    let filtered = places.filter(place => {
      // Search filter
      if (searchTerm && !place.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategories.length > 0) {
        const placeCategories = place.categories?.map(cat => cat.name) || [];
        if (!selectedCategories.some(cat => placeCategories.includes(cat))) {
          return false;
        }
      }
      
      // Price filter
      if (place.price && (place.price < priceRange[0] || place.price > priceRange[1])) {
        return false;
      }
      
      // Rating filter
      if (ratingFilter > 0 && (!place.rating || place.rating < ratingFilter)) {
        return false;
      }
      
      return true;
    });

    // Sort places
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'distance':
        filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        break;
      case 'price':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      default:
        // relevance - keep original order
        break;
    }

    return filtered;
  }, [places, searchTerm, sortBy, selectedCategories, priceRange, ratingFilter]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('relevance');
    setSelectedCategories([]);
    setPriceRange([1, 4]);
    setRatingFilter(0);
  };

  if (loading && places.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>
          
          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="relevance">Relevance</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="distance">Distance</option>
              <option value="price">Price</option>
            </select>
          </div>
          
          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setFilterOpen(!filterOpen)}
            className="lg:w-auto"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>
        
        {/* Filter Panel */}
        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategories.includes(category)
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price Range */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([1, parseInt(e.target.value)])}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">
                  ${priceRange[0]} - ${priceRange[1]}
                </span>
              </div>
            </div>
            
            {/* Rating Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Minimum Rating</h4>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">
                  {ratingFilter > 0 ? `${ratingFilter}+` : 'Any'}
                </span>
              </div>
            </div>
            
            {/* Clear Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'} found
        </p>
      </div>
      
      {/* Places Grid */}
      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaces.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              onFavorite={onFavorite}
              onAddToItinerary={onAddToItinerary}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
      
      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-6">
          <Button
            onClick={onLoadMore}
            loading={loading}
            variant="outline"
          >
            Load More Places
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlaceList;
