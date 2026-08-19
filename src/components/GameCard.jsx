import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
  return (
    <Link to={`/game/${game.id}`} className="bg-card rounded-xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 flex flex-col h-full border border-slate-700">
      <div className="h-48 overflow-hidden">
        <img 
          src={game.background_image || 'https://via.placeholder.com/400x200?text=No+Image'} 
          alt={game.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <h3 className="text-xl font-bold mb-3 line-clamp-2">{game.name}</h3>
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="flex items-center gap-1 text-yellow-400">
            ⭐ {game.rating || 'N/A'}
          </span>
          {game.metacritic && (
            <span className="bg-slate-900 px-2 py-1 rounded text-success border border-success/30">
              {game.metacritic}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}