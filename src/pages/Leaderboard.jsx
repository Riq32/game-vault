import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, User, Loader2, Shield } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/auth');

      try {
        const response = await axios.get('https://game-vault-backend-n7ul.onrender.com/api/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeaderboard(response.data);
      } catch (err) {
        console.error("Failed to decrypt leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 flex justify-center"><Loader2 className="animate-spin text-[var(--color-neon-cyan)]" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10 border-b border-[var(--color-vault-border)] pb-4">
          <Trophy className="text-yellow-400" size={40} />
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Global <span className="text-[var(--color-neon-cyan)]">Rankings</span></h1>
            <p className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest text-xs">Top 100 Operatives by XP</p>
          </div>
        </div>

        <div className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--color-vault-border)] text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-5">Operative</div>
            <div className="col-span-4 md:col-span-2 text-center">Level</div>
            <div className="hidden md:block col-span-2 text-center">XP</div>
            <div className="hidden md:block col-span-2 text-center">Streak</div>
          </div>

          <div className="divide-y divide-[var(--color-vault-border)]">
            {leaderboard.map((user, idx) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-[var(--color-vault-black)]/50 ${user.is_current_user ? 'bg-[var(--color-neon-cyan)]/10 border-l-4 border-l-[var(--color-neon-cyan)]' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="col-span-2 md:col-span-1 text-center font-black text-xl">
                  {user.rank === 1 ? <span className="text-yellow-400">1</span> :
                   user.rank === 2 ? <span className="text-zinc-300">2</span> :
                   user.rank === 3 ? <span className="text-amber-700">3</span> :
                   <span className="text-[var(--color-text-secondary)]">{user.rank}</span>}
                </div>
                
                <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-[var(--color-vault-border)] overflow-hidden bg-[var(--color-vault-black)] flex items-center justify-center flex-shrink-0">
                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="text-[var(--color-text-secondary)]" />}
                  </div>
                  <div>
                    <div className="font-bold text-white truncate flex items-center gap-2">
                      {user.username} {user.is_current_user && <Shield size={14} className="text-[var(--color-neon-cyan)]" />}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-4 md:col-span-2 text-center font-black text-[var(--color-neon-cyan)]">
                  {user.level}
                </div>
                
                <div className="hidden md:block col-span-2 text-center font-bold text-[var(--color-text-secondary)]">
                  {user.xp}
                </div>
                
                <div className="hidden md:block col-span-2 text-center">
                  <div className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full font-bold text-xs">
                    <Flame size={14} /> {user.streak}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}