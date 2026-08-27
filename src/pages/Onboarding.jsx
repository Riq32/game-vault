import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, Monitor, Loader2, CheckCircle2 } from 'lucide-react';

export default function Onboarding() {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { token } = useAuth();

  const platforms = ['Windows PC', 'PS5', 'PS4', 'Xbox Series X', 'Xbox One', 'Switch'];
  const genres = ['Action', 'RPG', 'Shooter', 'Adventure', 'Strategy', 'Simulation', 'Puzzle', 'Racing'];

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Explicitly calling /api/preferences
      await axios.post(
        'https://game-vault-backend-n7ul.onrender.com/api/preferences',
        { platforms: selectedPlatforms, genres: selectedGenres },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/discover');
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert("Failed to transmit preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6 flex items-center justify-center">
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-neon-cyan)]/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-2xl bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-3xl p-8 md:p-12 relative z-10"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Vault Initialization</h1>
          <p className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest text-sm">Step {step} of 2</p>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-[var(--color-neon-cyan)]">
              <Monitor size={24} /> Select Hardware
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)}
                  className={`p-4 rounded-xl border font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-between ${
                    selectedPlatforms.includes(platform) 
                    ? 'bg-[var(--color-neon-cyan)]/10 border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)]' 
                    : 'bg-[var(--color-vault-black)] border-[var(--color-vault-border)] text-[var(--color-text-secondary)] hover:border-white hover:text-white'
                  }`}
                >
                  {platform}
                  {selectedPlatforms.includes(platform) && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setStep(2)} 
              disabled={selectedPlatforms.length === 0}
              className="w-full bg-[var(--color-neon-cyan)] text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              Continue to Software
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-[var(--color-neon-cyan)]">
              <Gamepad2 size={24} /> Select Directives (Genres)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                  className={`p-4 rounded-xl border font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-between ${
                    selectedGenres.includes(genre) 
                    ? 'bg-[var(--color-neon-cyan)]/10 border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)]' 
                    : 'bg-[var(--color-vault-black)] border-[var(--color-vault-border)] text-[var(--color-text-secondary)] hover:border-white hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)} 
                className="w-1/3 border border-[var(--color-vault-border)] text-[var(--color-text-secondary)] py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:text-white transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || selectedGenres.length === 0}
                className="w-2/3 flex items-center justify-center gap-2 bg-[var(--color-neon-cyan)] text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm disabled:opacity-50 transition-all hover:scale-[1.02]"
              >
                {loading ? <><Loader2 className="animate-spin" size={18} /> Transmitting...</> : "Initialize Vault"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}