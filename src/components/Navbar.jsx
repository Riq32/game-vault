import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // NEW: Import the auth hook

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth(); // NEW: Get current user state

  // Handle transparent to solid background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[var(--color-vault-black)]/90 backdrop-blur-md border-b border-[var(--color-vault-border)] py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2 z-50">
          <span className="text-[var(--color-neon-cyan)]">Game</span>Vault
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/discover" className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">Discover</Link>
          <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">About</Link>
          
          {/* Conditionally Rendered Protected Links */}
          {user && (
            <Link to="/backlog" className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">My Vault</Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">
            <Search size={20} />
          </Link>
          
          {/* Conditional Profile / Login Button */}
          {user ? (
            <Link to="/profile" className="flex items-center gap-2 bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)] px-4 py-2 rounded-full font-bold uppercase tracking-widest text-xs transition-all">
              <User size={16} /> {user.username}
            </Link>
          ) : (
            <Link to="/auth" className="bg-transparent border border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-[var(--color-text-secondary)] hover:text-white z-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Navigation Dropdown */}
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
            
            <div className="h-px bg-[var(--color-vault-border)] w-full"></div>
            
            {user ? (
              <>
                <Link to="/backlog" className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:text-[var(--color-neon-cyan)]">My Vault</Link>
                <Link to="/profile" className="text-lg font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:text-[var(--color-neon-cyan)] flex items-center gap-2">
                  <User size={18} /> Profile ({user.username})
                </Link>
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