import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchGames } from '../api';
import { Search as SearchIcon, Star, Loader2, AlertCircle } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (!query) {
      setGames([]);
      return;
    }
    
    const fetchSearchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await searchGames(query);
        setGames(data.results || []);
      } catch (err) {
        setError('Failed to fetch search targets. Neural link severed.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSearch} className="mb-12 max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="text-[var(--color-neon-cyan)]" size={24} />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search database..."
            className="w-full bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] text-white rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all font-bold text-lg placeholder:text-zinc-600 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          />
          <button type="submit" className="hidden">Search</button>
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[var(--color-neon-cyan)] mb-4" size={48} />
            <p className="text-[var(--color-text-secondary)] font-bold tracking-widest uppercase text-sm">Querying Database...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center max-w-md mx-auto">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        )}

        {!loading && !error && query && games.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--color-text-secondary)] font-bold text-xl uppercase tracking-widest">No matching targets found for "{query}"</p>
          </div>
        )}

        {!loading && games.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, idx) => (
              <Link key={game.id} to={`/game/${game.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-2xl overflow-hidden hover:border-[var(--color-neon-cyan)] transition-all group relative h-full flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={game.background_image || 'https://placehold.co/600x400/1a1a1a/00f0ff?text=No+Visual+Data'} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                    <div className="absolute top-3 right-3 bg-[var(--color-vault-black)]/90 backdrop-blur-md border border-[var(--color-vault-border)] px-2 py-1 rounded text-xs font-bold text-[var(--color-neon-cyan)] flex items-center gap-1">
                      <Star size={12} className="fill-[var(--color-neon-cyan)]" /> {game.rating}
                    </div>
                  </div>
                  <div className="p-5 flex-grow">
                    <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-[var(--color-neon-cyan)] transition-colors line-clamp-2">{game.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}