import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, Bell, Trophy, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; 
import axios from 'axios';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const location = useLocation();
  const { user, token, logout } = useAuth(); // Extracted logout from AuthContext

  // Scroll physics for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsNotifOpen(false);
  }, [location]);

  // Live polling for unread notifications
  useEffect(() => {
    if (!token) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get('https://game-vault-backend-n7ul.onrender.com/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const unread = response.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch comm-link status.");
      }
    };
    fetchUnreadCount();
    
    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [token, isNotifOpen]); // Re-fetch when panel closes to clear badge

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[var(--color-vault-black)]/90 backdrop-blur-md border-b border-[var(--color-vault-border)] py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2 z-50">
          <span className="text-[var(--color-neon-cyan)]">Game</span>Vault
        </Link>

        {/* Desktop Core Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/discover" className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">Discover</Link>
          <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">About</Link>
          {user && (
            <>
              <Link to="/backlog" className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">My Vault</Link>
              <Link to="/leaderboard" className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">Rankings</Link>
            </>
          )}
        </div>

        {/* Desktop Right Nav (Tools & Identity) */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">
            <Search size={20} />
          </Link>
          
          {user ? (
            <div className="flex items-center gap-5 relative">
              
              {/* Notification Trigger */}
              <div>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="text-[var(--color-text-secondary)] hover:text-white transition-colors relative flex items-center mt-1"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-neon-cyan)] rounded-full border-2 border-[var(--color-vault-black)]"></span>
                  )}
                </button>
                <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              </div>

              {/* Profile Pill */}
              <Link to="/profile" className="flex items-center gap-3 bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)] pl-2 pr-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-xs transition-all">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-[var(--color-vault-border)]" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] flex items-center justify-center">
                    <User size={12} />
                  </div>
                )}
                {user.displayName || user.username}
              </Link>

              {/* Logout Button (Desktop) */}
              <button 
                onClick={logout}
                className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors flex items-center justify-center"
                title="Disconnect"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="bg-transparent border border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button className="md:hidden text-[var(--color-text-secondary)] hover:text-white z-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-[var(--color-vault-black)] border-b border-[var(--color-vault-border)] shadow-2xl flex flex-col p-6 gap-6 md:hidden"
          >
            <Link to="/discover" className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:text-[var(--color-neon-cyan)]">Discover</Link>
            <Link to="/about" className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:text-[var(--color-neon-cyan)]">About</Link>
            <Link to="/search" className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:text-[var(--color-neon-cyan)] flex items-center gap-2">
              <Search size={18} /> Search
            </Link>
            
            {user && (
              <Link to="/leaderboard" className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:text-[var(--color-neon-cyan)] flex items-center gap-2">
                <Trophy size={18} /> Rankings
              </Link>
            )}
            
            <div className="h-px bg-[var(--color-vault-border)] w-full"></div>
            
            {user ? (
              <>
                <Link to="/backlog" className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:text-[var(--color-neon-cyan)]">My Vault</Link>
                
                <div className="flex items-center justify-between relative">
                  <Link to="/profile" className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:text-[var(--color-neon-cyan)] flex items-center gap-3">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-[var(--color-vault-border)]" />
                    ) : (
                      <User size={18} /> 
                    )}
                    Profile ({user.displayName || user.username})
                  </Link>

                  <div>
                    <button 
                      onClick={() => setIsNotifOpen(!isNotifOpen)} 
                      className="text-[var(--color-text-secondary)] hover:text-white relative p-2"
                    >
                      <Bell size={24} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-2 w-3 h-3 bg-[var(--color-neon-cyan)] rounded-full border-2 border-[var(--color-vault-black)]"></span>
                      )}
                    </button>
                    <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                  </div>
                </div>

                {/* Logout Button (Mobile) */}
                <button 
                  onClick={logout}
                  className="bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white text-center py-3 rounded-xl font-black uppercase tracking-widest mt-2 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="bg-[var(--color-neon-cyan)] text-black text-center py-3 rounded-xl font-black uppercase tracking-widest mt-2">
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}