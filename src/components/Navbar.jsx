// src/components/Navbar.jsx
import { NavLink, Link } from 'react-router-dom';
import { Search, Compass, Library, User } from 'lucide-react';

export default function Navbar() {
  const navLinkStyle = ({ isActive }) => 
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
      isActive 
        ? 'bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] border border-[var(--color-neon-cyan)]/30' 
        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-vault-surface-hover)]'
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--color-vault-black)]/80 backdrop-blur-lg border-b border-[var(--color-vault-border)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/image_0bcf85.png" 
            alt="Game Vault" 
            className="h-8 object-contain transition-transform group-hover:scale-105" 
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 bg-[var(--color-vault-surface)] p-1 rounded-full border border-[var(--color-vault-border)]">
          <NavLink to="/discover" className={navLinkStyle}>
            <Compass size={16} /> Discover
          </NavLink>
          <NavLink to="/search" className={navLinkStyle}>
            <Search size={16} /> Search
          </NavLink>
          <NavLink to="/backlog" className={navLinkStyle}>
            <Library size={16} /> Vault
          </NavLink>
        </div>

        {/* Profile / Auth Action */}
        <div className="flex items-center">
          <Link to="/auth" className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] flex items-center justify-center group-hover:border-[var(--color-neon-cyan)]">
              <User size={18} />
            </div>
            <span className="hidden sm:block">Sign In</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}