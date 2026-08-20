import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchGameDetails, fetchGameScreenshots } from '../api';
import { useBacklog } from '../hooks/useBacklog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function GameDetail() {
  const { id } = useParams();
  const { updateGameStatus, removeGame, getGameStatus } = useBacklog();
  const [game, setGame] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchGameDetails(id), fetchGameScreenshots(id)])
      .then(([gameData, screenshotsData]) => {
        setGame(gameData);
        setScreenshots(screenshotsData.results);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!game) return null;

  const currentStatus = getGameStatus(game.id);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="relative h-96 rounded-3xl overflow-hidden mb-12 shadow-2xl bg-dark">
        <img src={game.background_image} alt={game.name} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 p-8 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">{game.name}</h1>
            <div className="flex gap-4 items-center font-medium">
              <span className="bg-accent/90 text-white px-3 py-1 rounded-lg text-sm">
                {game.released}
              </span>
              {game.metacritic && (
                <span className="text-success bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                  Metacritic: {game.metacritic}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <select 
              className="w-full md:w-auto appearance-none bg-white/20 dark:bg-black/40 backdrop-blur-md text-white border border-white/30 px-5 py-3 rounded-xl font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-accent transition-all"
              value={currentStatus || ''}
              onChange={(e) => {
                if (e.target.value === 'remove') removeGame(game.id);
                else updateGameStatus(game, e.target.value);
              }}
            >
              <option value="" disabled className="text-slate-900">+ Add to Backlog</option>
              <option value="want_to_play" className="text-slate-900">Want to Play</option>
              <option value="playing" className="text-slate-900">Currently Playing</option>
              <option value="completed" className="text-slate-900">Completed</option>
              <option value="dropped" className="text-slate-900">Dropped</option>
              {currentStatus && <option value="remove" className="text-red-600 font-bold">Remove from Backlog</option>}
            </select>
            {currentStatus && (
              <span className="text-xs font-bold uppercase tracking-widest text-accent bg-black/50 px-3 py-1.5 rounded-lg">
                In Library
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">About this game</h2>
        <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: game.description }} />
      </div>

      {screenshots.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {screenshots.map(shot => (
              <img key={shot.id} src={shot.image} alt="Gameplay" className="rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:scale-[1.02] transition-transform duration-300 object-cover w-full" />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}