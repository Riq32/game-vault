// src/pages/Landing.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="relative w-full h-screen bg-[var(--color-vault-black)] overflow-hidden flex items-center">
      
      {/* Immersive Background Art */}
      <div className="absolute inset-0">
        <img
          src="https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg" 
          alt="Hero Background"
          className="w-full h-full object-cover opacity-40"
        />
        {/* Gradient overlays to blend the image into the surrounding dark theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-vault-black)] via-[var(--color-vault-black)]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-vault-black)] via-[var(--color-vault-black)]/60 to-transparent"></div>
      </div>

      {/* Cinematic Typography & Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full mt-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[var(--color-text-primary)] mb-6 leading-none">
            YOUR NEXT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-cyan)] to-blue-500">
              OBSESSION
            </span>
          </h1>
          
          <p className="text-xl text-[var(--color-text-secondary)] mb-10 max-w-xl leading-relaxed font-medium">
            Stop searching. Start playing. A universe of games waiting to be discovered, tracked, and mastered in your personal vault.
          </p>
          
          <Link 
            to="/discover" 
            className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-[var(--color-vault-black)] bg-[var(--color-neon-cyan)] rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
          >
            <span className="mr-2 uppercase tracking-wider text-sm">Enter the Vault</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}