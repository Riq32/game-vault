import { motion } from 'framer-motion';
import { User, Settings, Gamepad2, Trophy, Clock, Target } from 'lucide-react';

export default function Profile() {
  // Mock data to hold the UI structure until connected to Flask
  const user = {
    username: "VaultHunter99",
    joinDate: "August 2026",
    platforms: ["PS5", "Steam Deck", "Switch", "PC"],
    stats: {
      total: 142,
      completed: 87,
      playing: 3,
      backlog: 52
    }
  };

  const statCards = [
    { label: "Total Tracked", value: user.stats.total, icon: <Gamepad2 size={20} />, color: "text-white" },
    { label: "Completed", value: user.stats.completed, icon: <Trophy size={20} />, color: "text-yellow-400" },
    { label: "Currently Playing", value: user.stats.playing, icon: <Target size={20} />, color: "text-[var(--color-neon-cyan)]" },
    { label: "Backlog", value: user.stats.backlog, icon: <Clock size={20} />, color: "text-zinc-400" }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--color-neon-cyan)]/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="w-32 h-32 bg-[var(--color-vault-black)] border-2 border-[var(--color-neon-cyan)] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)] flex-shrink-0">
            <User size={48} className="text-[var(--color-neon-cyan)]" />
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{user.username}</h1>
            <p className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest text-sm mb-6">
              Vault Member since {user.joinDate}
            </p>
            
            {/* Hardware Tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {user.platforms.map(platform => (
                <span key={platform} className="bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-secondary)] text-xs font-bold px-3 py-1.5 rounded-full uppercase">
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <button className="bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] hover:border-[var(--color-neon-cyan)] text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] p-3 rounded-xl transition-colors self-start md:self-center hidden md:block">
            <Settings size={20} />
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-6 rounded-2xl flex flex-col justify-between h-32"
            >
              <div className="flex justify-between items-start text-[var(--color-text-secondary)]">
                <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="text-4xl font-black">{stat.value}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}