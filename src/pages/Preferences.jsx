import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, ChevronRight, Settings } from 'lucide-react';

const AVAILABLE_PLATFORMS = ['Windows PC', 'PS5', 'PS4', 'Xbox Series X', 'Xbox One', 'Switch'];
const AVAILABLE_GENRES = ['Action', 'RPG', 'Shooter', 'Adventure', 'Strategy', 'Puzzle', 'Racing', 'Sports'];

export default function Preferences() {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/preferences',
        { platforms: selectedPlatforms, genres: selectedGenres },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/discover');
    } catch (err) {
      console.error("Failed to save preferences", err);
      alert("Failed to save preferences. Continuing to vault...");
      navigate('/discover');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
            <Settings className="text-[var(--color-neon-cyan)]" size={36} />
            Calibrate <span className="text-[var(--color-neon-cyan)]">Identity</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] font-bold tracking-widest text-sm uppercase mb-12">
            Select your parameters to tune the algorithmic discovery feed.
          </p>

          <div className="space-y-12 mb-12">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-[var(--color-vault-border)] pb-2">Hardware</h2>
              <div className="flex flex-wrap gap-4">
                {AVAILABLE_PLATFORMS.map(platform => (
                  <button
                    key={platform}
                    onClick={() => toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)}
                    className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all border ${
                      selectedPlatforms.includes(platform)
                        ? 'bg-[var(--color-neon-cyan)] text-black border-[var(--color-neon-cyan)] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-vault-border)] hover:border-[var(--color-neon-cyan)]'
                    }`}
                  >
                    {selectedPlatforms.includes(platform) && <Check size={14} className="inline mr-2" />}
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-[var(--color-vault-border)] pb-2">Combat Directives (Genres)</h2>
              <div className="flex flex-wrap gap-4">
                {AVAILABLE_GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                    className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all border ${
                      selectedGenres.includes(genre)
                        ? 'bg-[var(--color-neon-cyan)] text-black border-[var(--color-neon-cyan)] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                        : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-vault-border)] hover:border-[var(--color-neon-cyan)]'
                    }`}
                  >
                    {selectedGenres.includes(genre) && <Check size={14} className="inline mr-2" />}
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[var(--color-neon-cyan)] text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-2"
            >
              {loading ? 'Transmitting...' : 'Finalize Calibration'} <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}