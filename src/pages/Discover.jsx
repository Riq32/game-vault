import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchGames } from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Plus, Check, Star, Crosshair } from 'lucide-react';
import axios from 'axios';

export default function Discover() {
  const [games, setGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedGames, setSavedGames] = useState({}); 
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const getGames = async () => {
      try {
        // 1. Fetch generic discovery feed
        const data = await fetchGames(); 
        setGames(data.results);
        
        // 2. If user is logged in, fetch tailored algorithmic recommendations
        if (token) {
          const recResponse = await axios.get('http://localhost:5000/api/recommendations', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRecommendedGames(recResponse.data);
        }
      } catch (err) {
        setError("Failed to load transmission data.");
      } finally {
        setLoading(false);
      }
    };
    getGames();
  }, [token]);

  const addToVault = async (game, e) => {
    e.preventDefault(); 
    if (!token) {
      alert("Please log in to add games to your vault.");
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/vault',
        { game_id: game.id, game_name: game.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedGames(prev => ({ ...prev, [game.id]: true }));
    } catch (err) {
      if (err.response?.status === 409) {
        setSavedGames(prev => ({ ...prev, [game.id]: true })); 
      } else {
        alert("Failed to add game to vault.");
      }
    }
  };

  if (loading) return <div className="min-h-screen pt-32"><LoadingSpinner /></div>;
  if (error) return <div className="min-h-screen pt-32"><ErrorMessage message={error} /></div>;

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ========================================== */}
        {/* PERSONALIZED RECOMMENDATION SECTION        */}
        {/* ========================================== */}
        {token && recommendedGames.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Crosshair className="text-[var(--color-neon-cyan)]" size={28} />
              Algorithmic <span className="text-[var(--color-neon-cyan)]">Matches</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedGames.map((game, idx) => (
                <Link key={`rec-${game.id}`} to={`/game/${game.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[var(--color-vault-surface)] border border-[var(--color-neon-cyan)]/50 rounded-2xl overflow-hidden hover:border-[var(--color-neon-cyan)] transition-all group relative h-full flex flex-col shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img src={game.background_image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[var(--color-vault-surface)] opacity-90"></div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-lg leading-tight truncate text-white">{game.name}</h3>
                      </div>
                      <div className="absolute top-3 right-3 bg-[var(--color-vault-black)]/90 backdrop-blur-md border border-[var(--color-neon-cyan)] px-2 py-1 rounded text-xs font-bold text-[var(--color-neon-cyan)] flex items-center gap-1">
                        <Star size={12} className="fill-[var(--color-neon-cyan)]" /> {game.rating}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* GLOBAL DISCOVERY FEED                      */}
        {/* ========================================== */}
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-10 border-b border-[var(--color-vault-border)] pb-4 inline-block">
          Global <span className="text-[var(--color-neon-cyan)]">Transmissions</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, idx) => (
            <Link key={game.id} to={`/game/${game.id}`}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-2xl overflow-hidden hover:border-[var(--color-text-secondary)] transition-all group relative h-full flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={game.background_image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                  <div className="absolute top-3 right-3 bg-[var(--color-vault-black)]/90 backdrop-blur-md border border-[var(--color-vault-border)] px-2 py-1 rounded text-xs font-bold text-[var(--color-neon-cyan)] flex items-center gap-1">
                    <Star size={12} className="fill-[var(--color-neon-cyan)]" /> {game.rating}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-[var(--color-neon-cyan)] transition-colors line-clamp-2">{game.name}</h3>
                    <p className="text-[var(--color-text-secondary)] text-xs font-medium mb-4">
                      {game.released ? new Date(game.released).getFullYear() : 'TBA'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => addToVault(game, e)}
                    disabled={savedGames[game.id]}
                    className={`w-full py-2 rounded-lg text-sm font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all border ${
                      savedGames[game.id] 
                      ? 'bg-[var(--color-vault-black)] border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)]' 
                      : 'bg-transparent border-[var(--color-vault-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-neon-cyan)] hover:text-black hover:border-[var(--color-neon-cyan)]'
                    }`}
                  >
                    {savedGames[game.id] ? <><Check size={16} /> Saved</> : <><Plus size={16} /> Add to Vault</>}
                  </button>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}