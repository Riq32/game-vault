import { fetchTrendingGames } from '../api';
import { useFetch } from '../hooks/useFetch';
import GameCard from '../components/GameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const { data, loading, error } = useFetch(fetchTrendingGames);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">Trending Masterpieces</h1>
        <p className="text-slate-400">Discover top-rated games curated by the RAWG community.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.results.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </main>
  );
}