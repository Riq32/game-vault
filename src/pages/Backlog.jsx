import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2, ShieldAlert, Zap, ArrowUpCircle } from 'lucide-react';
import axios from 'axios';

export default function Backlog() {
  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVault();
  }, []);

  const fetchVault = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/auth');

    try {
      const response = await axios.get('https://game-vault-backend-n7ul.onrender.com/api/vault', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVaultItems(response.data);
    } catch (err) {
      setError('Failed to sync with the central vault.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (itemId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.patch(
        `https://game-vault-backend-n7ul.onrender.com/api/vault/${itemId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setVaultItems(vaultItems.map(item => item.id === itemId ? { ...item, status: newStatus } : item));

      // Handle XP and Level Up Notifications
      if (response.data.gamification?.xp_gained > 0) {
        if (response.data.gamification.level_up) {
          setNotification({
            title: 'LEVEL UP!',
            message: `You reached Level ${response.data.gamification.new_level}`,
            icon: <ArrowUpCircle size={24} className="text-[var(--color-neon-cyan)]" />
          });
        } else {
          setNotification({
            title: '+100 XP',
            message: 'Asset marked as completed.',
            icon: <Zap size={24} className="text-yellow-400" />
          });
        }
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const removeGame = async (itemId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://game-vault-backend-n7ul.onrender.com/api/vault/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVaultItems(vaultItems.filter(item => item.id !== itemId));
    } catch (err) {
      alert("Failed to remove game.");
    }
  };

  if (loading) return <div className="min-h-screen pt-32 flex justify-center"><Loader2 className="animate-spin text-[var(--color-neon-cyan)]" size={48} /></div>;
  if (error) return <div className="min-h-screen pt-32 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6 relative">
      
      {/* Floating Gamification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 bg-[var(--color-vault-surface)] border-2 border-[var(--color-neon-cyan)] rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(0,240,255,0.3)]"
          >
            {notification.icon}
            <div>
              <h4 className="font-black text-lg text-white uppercase tracking-widest">{notification.title}</h4>
              <p className="text-[var(--color-text-secondary)] text-sm font-bold">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-10 border-b border-[var(--color-vault-border)] pb-4">
          Personal <span className="text-[var(--color-neon-cyan)]">Vault</span>
        </h1>

        {vaultItems.length === 0 ? (
          <div className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-2xl p-12 text-center flex flex-col items-center">
            <ShieldAlert size={48} className="text-[var(--color-text-secondary)] mb-4" />
            <h3 className="text-xl font-bold mb-2">Vault is Empty</h3>
            <p className="text-[var(--color-text-secondary)] mb-6">Head to the Discover page to add games to your secure tracking network.</p>
            <button onClick={() => navigate('/discover')} className="bg-[var(--color-neon-cyan)] text-black font-bold uppercase tracking-widest px-6 py-3 rounded-full hover:scale-105 transition-transform">Explore Games</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {vaultItems.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-5 rounded-2xl flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-bold text-lg leading-tight truncate pr-4">{item.game_name}</h3>
                    <button onClick={() => removeGame(item.id)} className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors bg-[var(--color-vault-black)] p-2 rounded-lg border border-[var(--color-vault-border)] hover:border-red-500"><Trash2 size={16} /></button>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-[var(--color-vault-border)] pt-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Status</span>
                    <select 
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className="bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] text-sm font-bold uppercase tracking-wide rounded-lg px-3 py-2 outline-none focus:border-[var(--color-neon-cyan)] cursor-pointer"
                    >
                      <option value="Backlog">Backlog</option>
                      <option value="Playing">Playing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}