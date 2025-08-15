import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import Itinerary from './pages/Itinerary';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import PlaceDetails from './pages/PlaceDetails';

import { useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <Header />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Home />
                </motion.div>
              } 
            />
            
            <Route 
              path="/search" 
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Search />
                </motion.div>
              } 
            />
            
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Chat />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/itinerary" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Itinerary />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Profile />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/login" 
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Login />
                  </motion.div>
                )
              } 
            />
            
            <Route 
              path="/register" 
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Register />
                  </motion.div>
                )
              } 
            />
            
            <Route 
              path="/place/:id" 
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <PlaceDetails />
                </motion.div>
              } 
            />
            
            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-screen flex items-center justify-center"
                >
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
                    <p className="text-xl text-secondary-600 mb-8">Page not found</p>
                    <button 
                      onClick={() => window.history.back()}
                      className="btn btn-primary"
                    >
                      Go Back
                    </button>
                  </div>
                </motion.div>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}

export default App; 