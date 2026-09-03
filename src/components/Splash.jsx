import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Splash({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false); // Gates the sequence
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // 🛡️ FIX: Memoize particles so they don't randomly regenerate on state changes
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      x: Math.random() * 100 - 50,
      duration: Math.random() * 2.5 + 2,
      delay: Math.random() * 1.5
    }));
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('/bass-impact.mp3');
    audioRef.current.volume = 0.7;

    return () => {
      // 🛡️ FIX: Comprehensive memory cleanup on unmount
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Triggers the audio and the visual sequence simultaneously
  const startSequence = () => {
    if (hasStarted) return;
    setHasStarted(true);
    
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }

    // Extended 6-second sequence duration
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); 
    }, 6000);
  };

  const handleSkip = (e) => {
    e.stopPropagation(); // Prevents triggering the background click
    setVisible(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // 🛡️ FIX: Clear the timer so onComplete doesn't fire twice!
    if (timerRef.current) clearTimeout(timerRef.current); 
    
    setTimeout(onComplete, 800);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          onClick={startSequence} // The whole screen becomes the trigger
          className={`fixed inset-0 z-[100] bg-[var(--color-vault-black)] flex flex-col items-center justify-center overflow-hidden ${!hasStarted ? 'cursor-pointer' : ''}`}
          style={{ perspective: "1000px" }}
        >
          
          {/* Pre-Interaction State */}
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-[var(--color-text-secondary)] uppercase tracking-[0.4em] text-sm font-bold"
            >
              Click anywhere to begin
            </motion.div>
          )}

          {/* Post-Interaction Cinematic Sequence */}
          {hasStarted && (
            <>
              {/* Extended Energy Flare */}
              <motion.div
                initial={{ opacity: 0, scale: 0.1 }}
                animate={{ opacity: [0, 0.6, 0], scale: [0.1, 3, 5] }}
                transition={{ duration: 5.0, ease: "easeOut" }}
                className="absolute w-[400px] h-[400px] bg-[var(--color-neon-cyan)] rounded-full blur-[120px] mix-blend-screen pointer-events-none"
              />

              {/* Floating Particles */}
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: `${p.x}vw`, y: '20vh' }}
                  animate={{ opacity: [0, 0.8, 0], y: '-50vh' }}
                  transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
                  className="absolute bg-white rounded-full shadow-[0_0_10px_#00f0ff] pointer-events-none"
                  style={{ width: p.size, height: p.size }}
                />
              ))}

              {/* Realistic Logo Reveal */}
              <motion.img 
                src="/image_0bcf85.png" 
                alt="Game Vault"
                initial={{ 
                  scale: 0.6, 
                  opacity: 0,
                  y: 30,
                  rotateX: 15,
                  filter: 'brightness(0) blur(10px)'
                }}
                animate={{ 
                  scale: 1.1, 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  filter: 'brightness(1.15) blur(0px) drop-shadow(0 40px 30px rgba(0,0,0,0.9)) drop-shadow(0 0 35px rgba(0,240,255,0.4))' 
                }}
                transition={{ duration: 4.5, ease: "easeOut", delay: 0.2 }}
                className="w-[90vw] h-[90vh] object-contain z-10"
                style={{ transformStyle: "preserve-3d" }}
              />

              {/* Skip Sequence Option */}
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 1.0 }}
                onClick={handleSkip} 
                className="absolute bottom-12 text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] uppercase tracking-[0.3em] text-xs font-bold transition-colors z-20"
              >
                Skip Sequence
              </motion.button>
            </>
          )}
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}