import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  MessageCircle, 
  Route, 
  Star, 
  Clock, 
  Users, 
  Zap,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { apiUtils } from '../services/api';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: 'Conversational AI',
      description: 'Chat naturally with LocaMate to find the perfect places based on your mood, preferences, and context.'
    },
    {
      icon: MapPin,
      title: 'Smart Location Search',
      description: 'Discover nearby places with intelligent filtering based on time, purpose, and your personal preferences.'
    },
    {
      icon: Route,
      title: 'AI-Generated Itineraries',
      description: 'Get personalized micro-itineraries that adapt to your schedule, interests, and current location.'
    },
    {
      icon: Star,
      title: 'Context-Aware Recommendations',
      description: 'Receive suggestions that consider the time of day, weather, and your current situation.'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Get live information about opening hours, current status, and real-time availability.'
    },
    {
      icon: Users,
      title: 'Social Features',
      description: 'Share your favorite places and itineraries with friends, and discover recommendations from the community.'
    }
  ];

  const benefits = [
    'Find the right place at the right time',
    'Save time with AI-powered recommendations',
    'Discover hidden gems in your area',
    'Plan perfect outings with micro-itineraries',
    'Get personalized suggestions based on your preferences',
    'Access real-time information and updates'
  ];

  const stats = [
    { number: '10K+', label: 'Places Discovered' },
    { number: '5K+', label: 'Happy Users' },
    { number: '50K+', label: 'AI Conversations' },
    { number: '1K+', label: 'Itineraries Created' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6"
            >
              Your AI-Powered
              <span className="text-gradient block">Travel Companion</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto"
            >
              Find the perfect places based on your mood, preferences, and context. 
              LocaMate understands what you need and delivers personalized recommendations in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              {isAuthenticated ? (
                <Link
                  to="/chat"
                  className="btn btn-primary btn-lg group"
                >
                  Start Chatting
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-lg group"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-outline btn-lg"
                  >
                    Sign In
                  </Link>
                </>
              )}
              
              <button className="btn btn-ghost btn-lg flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-secondary-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20"
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-40 right-20 w-16 h-16 bg-accent-200 rounded-full opacity-20"
          />
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-20 left-20 w-12 h-12 bg-primary-300 rounded-full opacity-20"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Why Choose LocaMate?
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Experience the future of travel planning with AI-powered recommendations 
              that understand your needs and adapt to your context.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-6 hover:shadow-medium transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Get started with LocaMate in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Tell Us What You Need',
                description: 'Chat with LocaMate naturally. Describe your mood, purpose, or simply ask for recommendations.'
              },
              {
                step: '2',
                title: 'Get AI-Powered Suggestions',
                description: 'Receive personalized recommendations based on your preferences, location, and context.'
              },
              {
                step: '3',
                title: 'Explore & Plan',
                description: 'Discover new places, create itineraries, and share your experiences with the community.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-secondary-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
                Transform Your Travel Experience
              </h2>
              <p className="text-lg text-secondary-600 mb-8">
                Stop settling for generic recommendations. LocaMate understands your unique preferences 
                and delivers suggestions that match your mood, schedule, and context.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                    <span className="text-secondary-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-medium">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">LocaMate AI</h3>
                      <p className="text-sm text-secondary-500">Online</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="chat-bubble chat-bubble-ai">
                      Hi! I'm here to help you find the perfect places. What are you in the mood for today?
                    </div>
                    <div className="chat-bubble chat-bubble-user">
                      I need a quiet cafe to work for a few hours
                    </div>
                    <div className="chat-bubble chat-bubble-ai">
                      Perfect! I found 3 great options nearby with good WiFi and quiet atmospheres. Would you like me to show you the details?
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Ready to Discover Amazing Places?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto"
          >
            Join thousands of users who are already using LocaMate to find their perfect spots.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <Link
                to="/chat"
                className="btn bg-white text-primary-600 hover:bg-secondary-50 btn-lg"
              >
                Start Chatting Now
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn bg-white text-primary-600 hover:bg-secondary-50 btn-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 