import React, { useState, useEffect } from 'react';
import { PlusIcon, CalendarIcon, MapIcon, ClockIcon, StarIcon, ShareIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { itineraryAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Itinerary = () => {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    preferences: ''
  });

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    try {
      setLoading(true);
      const response = await itineraryAPI.getUserItineraries();
      setItineraries(response.data.itineraries || []);
    } catch (err) {
      setError('Failed to load itineraries');
      console.error('Failed to load itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItinerary = async (e) => {
    e.preventDefault();
    
    if (!createForm.title.trim() || !createForm.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await itineraryAPI.generateItinerary(
        createForm.description || `Create an itinerary for ${createForm.title}`,
        createForm.location,
        createForm.preferences ? { preferences: createForm.preferences } : {}
      );

      // Add the new itinerary to the list
      setItineraries(prev => [response.data.itinerary, ...prev]);
      
      // Reset form
      setCreateForm({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        preferences: ''
      });
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItinerary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      await itineraryAPI.deleteItinerary(id);
      setItineraries(prev => prev.filter(it => it._id !== id));
    } catch (err) {
      setError('Failed to delete itinerary');
    }
  };

  const handleToggleLike = async (id) => {
    try {
      await itineraryAPI.toggleLike(id);
      setItineraries(prev => prev.map(it => 
        it._id === id 
          ? { ...it, isLiked: !it.isLiked, likes: it.isLiked ? it.likes - 1 : it.likes + 1 }
          : it
      ));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleShareItinerary = async (id) => {
    try {
      const response = await itineraryAPI.shareItinerary(id);
      // Copy share link to clipboard
      navigator.clipboard.writeText(response.data.shareUrl);
      alert('Share link copied to clipboard!');
    } catch (err) {
      setError('Failed to share itinerary');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Not specified';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  if (loading && itineraries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Itineraries</h1>
              <p className="text-gray-600 mt-1">
                Plan and manage your travel adventures
              </p>
            </div>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create Itinerary
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Create Itinerary Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Itinerary</h2>
            
            <form onSubmit={handleCreateItinerary} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title *"
                  placeholder="e.g., Weekend in Paris"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                
                <Input
                  label="Location *"
                  placeholder="e.g., Paris, France"
                  value={createForm.location}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
              
              <Input
                label="Description"
                placeholder="Tell me what you want to do..."
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
                
                <Input
                  label="End Date"
                  type="date"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              
              <Input
                label="Preferences"
                placeholder="e.g., budget-friendly, family-friendly, adventure activities"
                value={createForm.preferences}
                onChange={(e) => setCreateForm(prev => ({ ...prev, preferences: e.target.value }))}
              />
              
              <div className="flex gap-3">
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  Create Itinerary
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Itineraries List */}
        {itineraries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <div key={itinerary._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {itinerary.title}
                    </h3>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleLike(itinerary._id)}
                        className={`p-1 rounded-full transition-colors ${
                          itinerary.isLiked 
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <HeartIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleShareItinerary(itinerary._id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {itinerary.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {itinerary.description}
                    </p>
                  )}
                  
                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapIcon className="h-4 w-4" />
                      <span>{itinerary.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDuration(itinerary.startDate, itinerary.endDate)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Places Preview */}
                {itinerary.places && itinerary.places.length > 0 && (
                  <div className="px-6 pb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Places ({itinerary.places.length})</h4>
                    <div className="space-y-1">
                      {itinerary.places.slice(0, 3).map((place, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span className="truncate">{place.name}</span>
                        </div>
                      ))}
                      {itinerary.places.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{itinerary.places.length - 3} more places
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{itinerary.likes || 0} likes</span>
                      <span>{itinerary.places?.length || 0} places</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/itinerary/${itinerary._id}`}
                      >
                        View
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItinerary(itinerary._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CalendarIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No itineraries yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first itinerary to start planning your next adventure
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Itinerary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;
