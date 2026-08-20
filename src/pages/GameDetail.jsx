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
  const [toast, setToast] = useState(null);

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

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === 'remove') {
      removeGame(game.id);
      showToast('Game removed from library');
    } else {
      updateGameStatus(game, newStatus);
      showToast('Added to backlog successfully!');
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!game) return null;

  const currentStatus = getGameStatus(game.id);

  return (
    <main className="max-w-5xl mx-auto p-6 animate-fade-in relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 animate-toast">
          <div className="bg-success text-white px-8 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2">
            <span>✅</span> {toast}
          </div>
        </div>
      )}

      <div className="relative h-[450px] rounded-3xl overflow-hidden mb-12 shadow-2xl bg-dark-bg border border-slate-200 dark:border-dark-border">
        <img src={game.background_image} alt={game.name} className="w-full h-full object-cover opacity-70 dark:opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent dark:from-black/95 dark:via-black/50"></div>
        
        <div className="absolute bottom-0 p-8 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg">{game.name}</h1>
            <div className="flex flex-wrap gap-3 items-center font-semibold">
              <span className="bg-primary text-white px-4 py-1.5 rounded-full text-sm shadow-md">
                {game.released}
              </span>
              {game.metacritic && (
                <span className="text-success bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm border border-white/20 shadow-md">
                  Metacritic: {game.metacritic}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            {/* Custom Styled Select Dropdown */}
            <div className="relative w-full md:w-64">
              <select 
                className="w-full appearance-none bg-white/95 dark:bg-black/60 backdrop-blur-xl text-slate-900 dark:text-white border-2 border-transparent hover:border-primary/50 focus:border-primary px-5 py-3.5 rounded-2xl font-bold cursor-pointer outline-none shadow-xl transition-all"
                value={currentStatus || ''}
                onChange={handleStatusChange}
              >
                <option value="" disabled className="text-slate-500 font-medium">+ Add to Library</option>
                <option value="want_to_play" className="text-slate-900 font-medium">Want to Play</option>
                <option value="playing" className="text-slate-900 font-medium">Currently Playing</option>
                <option value="completed" className="text-slate-900 font-medium">Completed</option>
                <option value="dropped" className="text-slate-900 font-medium">Dropped</option>
                {currentStatus && <option value="remove" className="text-red-600 font-bold">Remove from Library</option>}
              </select>
              {/* Custom SVG Arrow overlay since appearance-none hides the default one */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-900 dark:text-white">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {currentStatus && (
              <span className="text-xs font-black uppercase tracking-widest text-primary bg-white/90 dark:bg-black/80 px-4 py-2 rounded-xl shadow-lg border border-primary/20 backdrop-blur-md">
                In Library
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-12 bg-white/60 dark:bg-dark-card/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200 dark:border-dark-border shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">About this game</h2>
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: game.description }} />
      </div>

      {screenshots.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {screenshots.map(shot => (
              <img key={shot.id} src={shot.image} alt="Gameplay" className="rounded-3xl shadow-lg border border-slate-200 dark:border-dark-border hover:scale-[1.03] transition-transform duration-500 object-cover w-full cursor-zoom-in" />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}