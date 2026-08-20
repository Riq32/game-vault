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
    <nav className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-xl sticky top-0 z-50 border-b border-light-border dark:border-dark-border p-4 transition-colors duration-500 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="text-2xl font-black flex items-center gap-2 tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-primary">🎮</span> GameVault
        </Link>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
          <input 
            type="text" 
            placeholder="Search for games..." 
            className="w-full px-5 py-2.5 rounded-l-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:outline-none focus:border-primary transition-colors shadow-inner"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-r-full font-bold transition-colors shadow-md">
            Search
          </button>
        </form>

        <div className="flex items-center gap-4">
          <NavLink 
            to="/backlog" 
            className={({ isActive }) => `px-5 py-2 rounded-full font-semibold transition-all duration-300 ${
              isActive 
                ? 'bg-primary text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-border'
            }`}
          >
            My Backlog
          </NavLink>
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-xl hover:scale-110 transition-transform shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}