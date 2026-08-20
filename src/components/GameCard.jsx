import { Link } from 'react-router-dom';

export default function GameCard({ game, onDrop }) {
  const handleDrop = (e) => {
    e.preventDefault(); // Prevent navigating to GameDetail when clicking the button
    if (onDrop) onDrop(game);
  };

  return (
    <Link to={`/game/${game.id}`} className="animate-stagger bg-light-card dark:bg-dark-card rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-primary/20 transition-all duration-300 flex flex-col h-full border border-light-border dark:border-dark-border group">
      <div className="h-52 overflow-hidden relative">
        <img 
          src={game.background_image || 'https://via.placeholder.com/400x200?text=No+Image'} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="text-white font-bold tracking-wide bg-primary/90 px-4 py-1.5 rounded-full backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            View Details
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">{game.name}</h3>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              ⭐ {game.rating || 'N/A'}
            </span>
            {game.metacritic && (
              <span className="bg-slate-100 dark:bg-dark-bg px-2.5 py-1 rounded-md text-success border border-success/20 shadow-sm">
                {game.metacritic}
              </span>
            )}
          </div>
          
          {/* Quick Drop Action - Only renders in My Library */}
          {onDrop && game.status !== 'dropped' && (
            <button 
              onClick={handleDrop}
              className="mt-2 w-full py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-900/50"
            >
              Move to Dropped
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}