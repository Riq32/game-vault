import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchGameDetails, fetchGameScreenshots } from '../api';
import { useBacklog } from '../hooks/useBacklog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function GameDetail() {
  const { id } = useParams();
  const { toggleBacklog, isInBacklog } = useBacklog();
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

  const saved = isInBacklog(game.id);

  return (
    <main className="max-w-5xl mx-auto p-6">
      {/* Hero Banner */}
      <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl border border-slate-700">
        <img src={game.background_image} alt={game.name} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
        <div className="absolute bottom-0 p-8 w-full flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black mb-3">{game.name}</h1>
            <div className="flex gap-4 items-center font-medium">
              <span className="bg-accent text-dark px-3 py-1 rounded-full text-sm">
                {game.released}
              </span>
              {game.metacritic && (
                <span className="text-success border border-success/30 bg-slate-900 px-3 py-1 rounded">
                  Metacritic: {game.metacritic}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => toggleBacklog(game)}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              saved ? 'bg-slate-700 text-white hover:bg-red-500' : 'bg-accent text-dark hover:bg-sky-400'
            }`}
          >
            {saved ? 'Remove from Backlog' : '+ Add to Backlog'}
          </button>
        </div>
      </div>
      
      {/* Description */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-accent">About this game</h2>
        {/* RAWG provides description with HTML formatting */}
        <div className="text-slate-300 leading-relaxed text-lg prose prose-invert" dangerouslySetInnerHTML={{ __html: game.description }} />
      </div>

      {/* Screenshots Gallery */}
      {screenshots.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-accent">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {screenshots.map(shot => (
              <img key={shot.id} src={shot.image} alt="Gameplay Screenshot" className="rounded-xl shadow-lg border border-slate-700 hover:scale-[1.02] transition-transform" />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}