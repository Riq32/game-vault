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

  return (
    <main className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      {/* Category Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-lg font-bold mb-4 text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categories</h2>
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setSelectedGenre('')}
            className={`text-left px-4 py-2.5 rounded-xl whitespace-nowrap font-medium transition-colors ${selectedGenre === '' ? 'bg-slate-200 dark:bg-slate-800 text-accent font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
          >
            🔥 All Trending
          </button>
          {genresData?.results?.map(genre => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`text-left px-4 py-2.5 rounded-xl whitespace-nowrap font-medium transition-colors ${selectedGenre === genre.id ? 'bg-slate-200 dark:bg-slate-800 text-accent font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Feed */}
      <div className="flex-grow min-w-0">
        <h1 className="text-4xl font-black mb-8 tracking-tight">
          {selectedGenre && genresData ? genresData.results.find(g => g.id === selectedGenre)?.name : 'Trending Masterpieces'}
        </h1>
        
        {gamesLoading ? <LoadingSpinner /> : gamesError ? <ErrorMessage message={gamesError} /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamesData?.results.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}