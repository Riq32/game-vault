import { useSearchParams } from 'react-router-dom';
import { searchGames } from '../api';
import { useFetch } from '../hooks/useFetch';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const { data, loading, error } = useFetch(() => searchGames(query), query);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <main className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 border-b border-slate-700 pb-4">
        Search Results for: <span className="text-accent">"{query}"</span>
      </h1>
      
      {data?.results.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-xl">
          No games found. Try a different search term.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.results.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </main>
  );
}