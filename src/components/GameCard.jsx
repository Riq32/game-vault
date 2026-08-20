import { Link } from 'react-router-dom';

export default function GameCard({ game }) {
  return (
    <Link to={`/game/${game.id}`} className="animate-stagger bg-light-card dark:bg-dark-card rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-primary/20 transition-all duration-300 flex flex-col h-full border border-light-border dark:border-dark-border group">
      <div className="h-52 overflow-hidden relative">
        <img 
          src={game.background_image || 'https://via.placeholder.com/400x200?text=No+Image'} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-5 flex flex-col flex-grow justify-between">
        <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">{game.name}</h3>
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
            ⭐ {game.rating || 'N/A'}
          </span>
          {game.metacritic && (
            <span className="bg-light-bg dark:bg-dark-bg px-2.5 py-1 rounded-md text-success border border-success/20 shadow-sm">
              {game.metacritic}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}