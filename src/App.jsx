import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // NEW: Import the Provider

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
              {/* Core Browsing */}
              <Route path="/" element={<Landing />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/search" element={<Search />} />
              <Route path="/game/:id" element={<GameDetail />} />
              
              {/* User Access & Setup */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Personalized Vault Space */}
              <Route path="/backlog" element={<Backlog />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Meta */}
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}