import React, { useState, useEffect } from 'react';
import { UserIcon, EnvelopeIcon, MapPinIcon, CogIcon, KeyIcon, TrashIcon, HeartIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    preferences: user?.preferences || ''
  });
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // User stats
  const [stats, setStats] = useState({
    totalPlaces: 0,
    favoritePlaces: 0,
    visitedPlaces: 0,
    itineraries: 0,
    totalTrips: 0
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await authAPI.getUserStats();
      setStats(response.data.stats || {});
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.updateProfile(profileForm);
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.deleteAccount();
      logout();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-10 w-10 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{user?.email}</p>
                
                {user?.location && (
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Favorite Places</span>
                  <span className="font-medium">{stats.favoritePlaces}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Visited Places</span>
                  <span className="font-medium">{stats.visitedPlaces}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Itineraries</span>
                  <span className="font-medium">{stats.itineraries}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Trips</span>
                  <span className="font-medium">{stats.totalTrips}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      icon={<UserIcon className="h-5 w-5" />}
                    />
                    
                    <Input
                      label="Email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      icon={<EnvelopeIcon className="h-5 w-5" />}
                    />
                  </div>
                  
                  <Input
                    label="Location"
                    placeholder="e.g., New York, NY"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                    icon={<MapPinIcon className="h-5 w-5" />}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full md:w-auto"
                  >
                    Update Profile
                  </Button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    
                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full md:w-auto"
                    >
                      Change Password
                    </Button>
                  </form>
                </div>

                {/* Delete Account */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h3>
                  <p className="text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    loading={loading}
                    className="flex items-center gap-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Delete Account
                  </Button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Travel Preferences</h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travel Preferences
                    </label>
                    <textarea
                      value={profileForm.preferences}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, preferences: e.target.value }))}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., I prefer budget-friendly options, love outdoor activities, interested in local cuisine..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Help us provide better recommendations by sharing your travel preferences.
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full md:w-auto"
                  >
                    Save Preferences
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
