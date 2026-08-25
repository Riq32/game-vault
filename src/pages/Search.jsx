
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchGames } from '../api';
import { useFetch } from '../hooks/useFetch';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // Local state for the input field
  const [inputValue, setInputValue] = useState(query);
  
  // Fetch data based on the URL query parameter, not every keystroke
  const { data, loading, error } = useFetch(
    () => (query ? searchGames(query) : Promise.resolve({ results: [] })), 
    query
  );

  // Keep the input field in sync if the URL changes externally
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue });
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 animate-fade-in">
      
      {/* Premium Search Header & Input */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-center text-[var(--color-text-primary)] uppercase drop-shadow-sm animate-slide-up">
          Search THE <span className="text-[var(--color-neon-cyan)]">DATABASE</span>
        </h1>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <SearchIcon className="text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-neon-cyan)] transition-colors" size={24} />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search for titles, publishers, or keywords..."
            className="w-full bg-[var(--color-vault-surface)] border-2 border-[var(--color-vault-border)] text-[var(--color-text-primary)] text-lg placeholder-[var(--color-text-secondary)] rounded-full py-5 pl-16 pr-8 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:ring-4 focus:ring-[var(--color-neon-cyan)]/10 transition-all shadow-lg"
          />
          <button 
            type="submit"
            className="absolute inset-y-2 right-2 bg-[var(--color-neon-cyan)] text-[var(--color-vault-black)] font-black uppercase tracking-wider px-6 rounded-full hover:scale-105 transition-transform"
          >
            Find
          </button>
        </form>
      </div>
      
      {/* Search Results */}
      {query && (
        <div className="mt-8 border-t border-[var(--color-vault-border)] pt-8">
          <h2 className="text-xl font-bold mb-6 text-[var(--color-text-secondary)] uppercase tracking-widest">
            Results for: <span className="text-[var(--color-text-primary)]">"{query}"</span>
          </h2>
          
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : data?.results?.length === 0 ? (
            <div className="text-center py-24 text-[var(--color-text-secondary)] text-xl font-bold tracking-wider bg-[var(--color-vault-surface)] rounded-2xl border border-[var(--color-vault-border)]">
              No games found. Try a different search term.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data?.results.map((game, index) => (
                <div key={game.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}