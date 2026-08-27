import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { searchGames } from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Search as SearchIcon, Star, Gamepad2 } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const data = await searchGames(query);
      setGames(data.results || []);
    } catch (err) {
      setError("Failed to execute search query.");
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-6 text-center">
            Database <span className="text-[var(--color-neon-cyan)]">Query</span>
          </h1>
          
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <SearchIcon className="text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-neon-cyan)] transition-colors" size={24} />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the global game registry..." 
              className="w-full bg-[var(--color-vault-surface)] border-2 border-[var(--color-vault-border)] text-white rounded-2xl py-4 pl-14 pr-32 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all text-lg font-medium"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute inset-y-2 right-2 bg-[var(--color-neon-cyan)] text-black px-6 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white transition-colors disabled:opacity-50"
            >
              Search
            </button>
          </form>
        </div>

        {loading && <div className="mt-20"><LoadingSpinner /></div>}
        {error && <div className="mt-20"><ErrorMessage message={error} /></div>}

        {!loading && !error && hasSearched && games.length === 0 && (
          <div className="mt-20 text-center flex flex-col items-center">
            <Gamepad2 size={64} className="text-[var(--color-vault-border)] mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-[var(--color-text-secondary)]">No Transmissions Found</h2>
            <p className="text-zinc-500 mt-2 font-medium">Try adjusting your search parameters.</p>
          </div>
        )}

        {!loading && !error && games.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
            {games?.map((game, idx) => (
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
                      <Star size={12} className="fill-[var(--color-neon-cyan)]" /> {game.rating || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-[var(--color-neon-cyan)] transition-colors line-clamp-2">{game.name}</h3>
                      <p className="text-[var(--color-text-secondary)] text-xs font-medium mb-4">
                        {game.released ? new Date(game.released).getFullYear() : 'TBA'}
                      </p>
                    </div>
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