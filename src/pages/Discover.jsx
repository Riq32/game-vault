import { useState } from 'react';
import { fetchTrendingGames, fetchGenres } from '../api';
import { useFetch } from '../hooks/useFetch';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const { data: gamesData, loading: gamesLoading, error: gamesError } = useFetch(() => fetchTrendingGames(selectedGenre), selectedGenre);
  const { data: genresData } = useFetch(fetchGenres);

  const getButtonClass = (isActive) => `
    text-left px-5 py-2.5 rounded-full whitespace-nowrap font-bold transition-all duration-300 text-sm border
    ${isActive 
      ? 'bg-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)] text-[var(--color-vault-black)] shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
      : 'bg-[var(--color-vault-surface)] border-[var(--color-vault-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-neon-cyan)]/50 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-vault-surface-hover)]'
    }
  `;

  return (
    <main className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8 animate-fade-in">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 animate-slide-up">
        <h3 className="text-xs font-bold mb-5 text-[var(--color-text-secondary)] uppercase tracking-widest drop-shadow-sm">
          Browse Categories
        </h3>
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setSelectedGenre('')}
            className={getButtonClass(selectedGenre === '')}
          >
            🔥 All Trending
          </button>
          {genresData?.results?.map(genre => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={getButtonClass(selectedGenre === genre.id)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow min-w-0">
        <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-[var(--color-text-primary)] drop-shadow-sm animate-slide-up uppercase">
          {selectedGenre && genresData 
            ? genresData.results.find(g => g.id === selectedGenre)?.name 
            : <>DISCOVER <span className="text-[var(--color-neon-cyan)]">GAMES</span></>
          }
        </h1>
        
        {gamesLoading ? <LoadingSpinner /> : gamesError ? <ErrorMessage message={gamesError} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamesData?.results.map((game, index) => (
              <div key={game.id} style={{ animationDelay: `${index * 50}ms` }}>
                <GameCard game={game} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}