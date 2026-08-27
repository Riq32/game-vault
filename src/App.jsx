import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 

// Component Imports
import Navbar from './components/Navbar';
import Splash from './components/Splash';

// Page Imports
import Landing from './pages/Landing';
import Discover from './pages/Discover';
import Search from './pages/Search';
import GameDetail from './pages/GameDetail';
import Backlog from './pages/Backlog';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import About from './pages/About';

// Security wrapper to prevent unauthorized access to private pages
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <div className="bg-[var(--color-vault-black)] text-[var(--color-text-primary)] min-h-screen font-sans selection:bg-[var(--color-neon-cyan)] selection:text-black">
        
        {/* Cinematic Splash Screen */}
        {showSplash && <Splash onComplete={() => setShowSplash(false)} />}
        
        {/* Main Application Wrapper */}
        <div className={`flex flex-col min-h-screen transition-opacity duration-1000 ${showSplash ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <Navbar />
          
          {/* Page Content */}
          <main className="flex-grow pt-20"> 
            <Routes>
              {/* Core Browsing (Public) */}
              <Route path="/" element={<Landing />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/search" element={<Search />} />
              <Route path="/game/:id" element={<GameDetail />} />
              <Route path="/about" element={<About />} />
              
              {/* User Access & Setup (Public) */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Personalized Vault Space & Setup (Protected) */}
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/backlog" 
                element={
                  <ProtectedRoute>
                    <Backlog />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}