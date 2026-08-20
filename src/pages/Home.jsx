import { useState } from 'react';
import { fetchTrendingGames, fetchGenres } from '../api';
import { useFetch } from '../hooks/useFetch';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const { data: gamesData, loading: gamesLoading, error: gamesError } = useFetch(() => fetchTrendingGames(selectedGenre), selectedGenre);
  const { data: genresData } = useFetch(fetchGenres);

  // Unified button classes for perfect contrast matching
  const getButtonClass = (isActive) => `
    text-left px-4 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 border
    ${isActive 
      ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
      : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border text-slate-700 dark:text-slate-200 hover:border-primary/50 dark:hover:bg-zinc-800'
    }
  `;

  return (
    <main className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8 animate-fade-in">
      <aside className="w-full md:w-64 flex-shrink-0 animate-slide-up">
        <h2 className="text-sm font-bold mb-4 text-slate-500 dark:text-slate-300 uppercase tracking-widest drop-shadow-sm">Categories</h2>
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

      <div className="flex-grow min-w-0">
        <h1 className="text-4xl font-black mb-8 tracking-tight text-slate-900 dark:text-white drop-shadow-sm animate-slide-up">
          {selectedGenre && genresData ? genresData.results.find(g => g.id === selectedGenre)?.name : 'Trending Masterpieces'}
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