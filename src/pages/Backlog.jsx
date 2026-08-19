import { useBacklog } from '../hooks/useBacklog';
import GameCard from '../components/GameCard';

export default function Backlog() {
  const { backlog } = useBacklog();

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">My Backlog</h1>
        <p className="text-slate-400">Games saved locally. In Phase 2, this will be saved to your database.</p>
      </div>

      {backlog.length === 0 ? (
        <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-xl font-medium mb-2">Your backlog is empty!</p>
          <p>Search for games and click "Add to Backlog" to save them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {backlog.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </main>
  );
}