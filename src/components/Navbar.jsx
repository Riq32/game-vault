import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 p-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="text-2xl font-black flex items-center gap-2 tracking-tight hover:text-accent transition-colors">
          <span className="text-accent">🎮</span> GameVault
        </Link>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
          <input 
            type="text" 
            placeholder="Search for games..." 
            className="w-full px-4 py-2.5 rounded-l-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-accent transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-accent hover:bg-blue-600 text-white px-6 py-2.5 rounded-r-xl font-bold transition-colors">
            Search
          </button>
        </form>

        <div className="flex items-center gap-6">
          <Link to="/backlog" className="font-semibold text-slate-600 hover:text-accent dark:text-slate-300 dark:hover:text-white transition-colors">
            My Backlog
          </Link>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xl hover:scale-110 transition-transform"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}