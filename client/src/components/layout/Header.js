import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  MessageCircle, 
  Route, 
  User, 
  Menu, 
  X, 
  LogOut,
  Settings,
  Heart,
  Map
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: MapPin },
    { name: 'Search', href: '/search', icon: Search },
    ...(isAuthenticated ? [
      { name: 'Chat', href: '/chat', icon: MessageCircle },
      { name: 'Itinerary', href: '/itinerary', icon: Route }
    ] : [])
  ];

  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Favorites', href: '/profile?tab=favorites', icon: Heart },
    { name: 'Settings', href: '/profile?tab=settings', icon: Settings },
    { name: 'Logout', action: logout, icon: LogOut }
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">LocaMate</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-secondary-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-secondary-700">
                    {user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-secondary-200 py-1 z-50"
                    >
                      {userMenuItems.map((item) => (
                        <div key={item.name}>
                          {item.action ? (
                            <button
                              onClick={item.action === logout ? handleLogout : item.action}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </button>
                          ) : (
                            <Link
                              to={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn btn-outline btn-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-secondary-600 hover:text-primary-600 hover:bg-secondary-50"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-secondary-200 bg-white"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated && (
                <div className="border-t border-secondary-200 pt-2 mt-2">
                  {userMenuItems.map((item) => (
                    <div key={item.name}>
                      {item.action ? (
                        <button
                          onClick={() => {
                            item.action === logout ? handleLogout() : item.action();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </button>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 transition-colors"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header; 