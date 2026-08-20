import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery(''); 
    }
  };

  return (
    <nav className="bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl fixed w-full top-0 z-50 border-b border-light-border dark:border-dark-border transition-colors duration-500 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="text-2xl font-black flex items-center gap-2 tracking-tight text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
          <span className="text-primary">🎮</span> GameVault
        </Link>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
          <input 
            type="text" 
            placeholder="Search for games..." 
            className="w-full px-6 py-2.5 rounded-l-full bg-light-bg dark:bg-dark-card border border-light-border dark:border-dark-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-slate-900 dark:text-white shadow-inner font-medium placeholder-slate-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-r-full font-bold transition-colors shadow-md">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <NavLink 
            to="/discover" 
            className={({ isActive }) => `px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm ${
              isActive 
                ? 'bg-primary text-white shadow-md' 
                : 'text-slate-700 dark:text-slate-200 hover:bg-light-bg dark:hover:bg-dark-card'
            }`}
          >
            Discover
          </NavLink>
          <NavLink 
            to="/backlog" 
            className={({ isActive }) => `px-6 py-2.5 rounded-full font-bold transition-all duration-300 text-sm ${
              isActive 
                ? 'bg-primary text-white shadow-md' 
                : 'text-slate-700 dark:text-slate-200 hover:bg-light-bg dark:hover:bg-dark-card'
            }`}
          >
            My Library
          </NavLink>
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-light-bg dark:bg-dark-card border border-light-border dark:border-dark-border text-xl hover:scale-110 transition-transform shadow-sm flex items-center justify-center w-11 h-11"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}