import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery(''); // clear after search
    }
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="text-2xl font-black text-white flex items-center gap-2 tracking-tight hover:text-accent transition-colors">
          <span className="text-accent">🎮</span> GameVault
        </Link>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
          <input 
            type="text" 
            placeholder="Search for games..." 
            className="w-full px-4 py-2 rounded-l-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-accent transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-accent hover:bg-sky-500 text-dark px-6 py-2 rounded-r-lg font-bold transition-colors">
            Search
          </button>
        </form>

        <Link to="/backlog" className="font-semibold text-slate-300 hover:text-white transition-colors">
          My Backlog
        </Link>
      </div>
    </nav>
  );
}