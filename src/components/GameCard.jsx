// src/components/GameCard.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';

export default function GameCard({ game }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-2xl overflow-hidden transition-colors hover:border-[var(--color-neon-cyan)]/50 hover:shadow-[0_10px_30px_-10px_rgba(0,240,255,0.15)] flex flex-col"
    >
      {/* Image Container with Hover Zoom */}
      <div className="relative aspect-video overflow-hidden bg-[var(--color-vault-black)]">
        <img
          src={game.background_image || 'https://via.placeholder.com/600x400?text=No+Image'}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-vault-surface)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Rating Badge */}
        {game.rating > 0 && (
          <div className="absolute top-3 right-3 bg-[var(--color-vault-black)]/80 backdrop-blur-md border border-[var(--color-vault-border)] px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-[var(--color-neon-cyan)]">
            <Star size={14} className="fill-[var(--color-neon-cyan)]" />
            <span>{game.rating}</span>
          </div>
        )}
      </div>

      {/* Card Content & Hierarchy */}
      <div className="p-5 flex-grow flex flex-col justify-between z-10 bg-[var(--color-vault-surface)]">
        <div>
          <h3 className="text-xl font-black text-[var(--color-text-primary)] mb-3 line-clamp-1 group-hover:text-[var(--color-neon-cyan)] transition-colors">
            {game.name}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {game.genres?.slice(0, 2).map(genre => (
              <span key={genre.id} className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text-secondary)] bg-[var(--color-vault-black)] px-2 py-1 rounded-sm border border-[var(--color-vault-border)]">
                {genre.name}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-vault-border)]/50">
          <span className="text-xs text-[var(--color-text-secondary)] font-bold tracking-wider">
            {game.released ? new Date(game.released).getFullYear() : 'TBA'}
          </span>
          
          <div className="flex items-center gap-2">
            {/* Back to Discover Button */}
            <Link
              to="/discover"
              className="flex items-center gap-1 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] border border-[var(--color-vault-border)] hover:border-[var(--color-neon-cyan)]/50 px-3 py-2 rounded-full transition-colors uppercase tracking-wider"
              title="Return to Discover"
            >
              <ArrowLeft size={12} />
              <span>Back</span>
            </Link>

            {/* View Details Button */}
            <Link 
              to={`/game/${game.id}`}
              className="flex items-center gap-1 text-xs font-black text-[var(--color-text-primary)] bg-[var(--color-vault-border)] hover:bg-[var(--color-neon-cyan)] hover:text-[var(--color-vault-black)] px-4 py-2 rounded-full transition-colors uppercase tracking-wider"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}