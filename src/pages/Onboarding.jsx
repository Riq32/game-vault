import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

// Categorized hardware based on your master list
const PLATFORMS = [
  { brand: 'Sony PlayStation', color: 'hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]', items: ['PS5', 'PS4', 'PS3', 'PS2', 'PS1', 'PSP', 'PS Vita'] },
  { brand: 'Microsoft Xbox', color: 'hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]', items: ['Xbox Series X', 'Xbox Series S', 'Xbox One', 'Xbox 360', 'Original Xbox'] },
  { brand: 'Nintendo', color: 'hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]', items: ['Switch', 'Switch OLED', 'Wii U', 'Wii', 'GameCube', 'N64', 'SNES', 'NES', '3DS', 'DS', 'Game Boy Advance'] },
  { brand: 'PC & Portable', color: 'hover:border-zinc-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]', items: ['Windows PC', 'Steam Deck', 'Steam Deck OLED', 'Analogue Pocket'] },
  { brand: 'Retro & Classic', color: 'hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]', items: ['Sega Genesis', 'Sega Saturn', 'Dreamcast', 'Atari 2600', 'Neo Geo', 'Commodore 64'] },
];

// Main genres from the RAWG API mapping
const GENRES = [
  { id: '4', name: 'Action', icon: '⚔️' },
  { id: '5', name: 'RPG', icon: '🔮' },
  { id: '2', name: 'Shooter', icon: '🎯' },
  { id: '3', name: 'Adventure', icon: '🗺️' },
  { id: '10', name: 'Strategy', icon: '♟️' },
  { id: '11', name: 'Arcade', icon: '🕹️' },
  { id: '7', name: 'Puzzle', icon: '🧩' },
  { id: '1', name: 'Racing', icon: '🏎️' },
  { id: '15', name: 'Sports', icon: '⚽' },
  { id: '6', name: 'Fighting', icon: '🥊' },
  { id: '14', name: 'Simulation', icon: '🏗️' },
  { id: '83', name: 'Platformer', icon: '🏃' }
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleComplete = () => {
    const userPreferences = { platforms: selectedPlatforms, genres: selectedGenres };
    
    // Phase 2 TODO: POST this data to your Flask backend to save to the User profile
    console.log("Saving user preferences:", userPreferences);
    
    // Send them to the personalized discover page
    navigate('/discover');
  };

  // Animation variants for smooth step transitions
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-24 pb-12 px-6 flex flex-col items-center overflow-x-hidden">
      
      {/* Progress Indicator */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex gap-2">
          <div className={`h-2 w-16 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-[var(--color-neon-cyan)] shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'bg-[var(--color-vault-border)]'}`}></div>
          <div className={`h-2 w-16 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-[var(--color-neon-cyan)] shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'bg-[var(--color-vault-border)]'}`}></div>
        </div>
        <span className="text-[var(--color-text-secondary)] font-bold tracking-widest text-sm uppercase">
          Step {step} of 2
        </span>
      </div>

      {/* Dynamic Content Area */}
      <div className="w-full max-w-4xl relative min-h-[60vh]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: CONSOLES */}
          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
              <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
                What do you <span className="text-[var(--color-neon-cyan)]">play on?</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] mb-10 text-lg">Select all the hardware you currently own or play.</p>

              <div className="space-y-10 pb-20">
                {PLATFORMS.map((group) => (
                  <div key={group.brand}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white border-b border-[var(--color-vault-border)] pb-2">
                      <Gamepad2 size={20} className="text-[var(--color-text-secondary)]" /> {group.brand}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {group.items.map(console => {
                        const isSelected = selectedPlatforms.includes(console);
                        return (
                          <button
                            key={console}
                            onClick={() => toggleSelection(console, selectedPlatforms, setSelectedPlatforms)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${
                              isSelected 
                                ? 'bg-[var(--color-vault-surface)] border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                                : `bg-[var(--color-vault-surface)] border-transparent text-[var(--color-text-secondary)] ${group.color}`
                            }`}
                          >
                            {isSelected && <Check size={16} />}
                            {console}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: GENRES */}
          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="absolute w-full">
              <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
                What are your <span className="text-[var(--color-neon-cyan)]">favorites?</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] mb-10 text-lg">We'll tailor your Discover feed based on these genres.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
                {GENRES.map(genre => {
                  const isSelected = selectedGenres.includes(genre.name);
                  return (
                    <button
                      key={genre.id}
                      onClick={() => toggleSelection(genre.name, selectedGenres, setSelectedGenres)}
                      className={`relative overflow-hidden aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 transition-all border-2 ${
                        isSelected
                          ? 'bg-[var(--color-vault-surface)] border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] shadow-[0_0_25px_rgba(0,240,255,0.15)] scale-[1.02]'
                          : 'bg-[var(--color-vault-surface)] border-[var(--color-vault-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
                      }`}
                    >
                      <span className="text-4xl filter drop-shadow-lg">{genre.icon}</span>
                      <span className="font-bold tracking-wider uppercase text-sm">{genre.name}</span>
                      
                      {/* Active State Glow Overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-neon-cyan)]/20 to-transparent pointer-events-none"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-[var(--color-vault-black)]/90 backdrop-blur-md border-t border-[var(--color-vault-border)] py-6 z-50">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          {step === 2 ? (
            <button 
              onClick={() => setStep(1)} 
              className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white font-bold transition-colors uppercase tracking-wider text-sm"
            >
              <ChevronLeft size={18} /> Back
            </button>
          ) : (
            <div></div> // Empty div to keep 'Next' button on the right
          )}
          
          <button
            onClick={() => step === 1 ? setStep(2) : handleComplete()}
            className="flex items-center gap-2 bg-[var(--color-neon-cyan)] text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
            disabled={step === 1 ? selectedPlatforms.length === 0 : selectedGenres.length === 0}
          >
            {step === 1 ? 'Continue' : 'Complete Setup'} 
            {step === 1 ? <ChevronRight size={20} /> : <Sparkles size={20} />}
          </button>
        </div>
      </div>
      
    </div>
  );
}