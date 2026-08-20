import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
  return (
    <Link to={`/game/${game.id}`} className="bg-white dark:bg-card rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-accent/10 transition-all duration-300 flex flex-col h-full border border-slate-200 dark:border-slate-700/50">
      <div className="h-48 overflow-hidden">
        <img 
          src={game.background_image || 'https://via.placeholder.com/400x200?text=No+Image'} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
        />
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight">{game.name}</h3>
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            ⭐ {game.rating || 'N/A'}
          </span>
          {game.metacritic && (
            <span className="bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded-md text-success border border-success/20">
              {game.metacritic}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}