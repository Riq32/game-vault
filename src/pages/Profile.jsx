import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Gamepad2, Trophy, Clock, Target, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // NEW: Import the global auth hook

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { logout } = useAuth(); // NEW: Destructure the global logout function

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError('Failed to decrypt vault identity. Please log in again.');
        if (err.response && err.response.status === 401) {
          logout(); // Use context logout if token is expired/invalid
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate, logout]);

  const handleLogout = () => {
    logout(); // NEW: This clears global state AND localStorage instantly
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-neon-cyan)] mb-4" size={48} />
        <p className="text-[var(--color-text-secondary)] font-bold tracking-widest uppercase text-sm">Decrypting Identity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 flex flex-col items-center justify-center px-6">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex flex-col items-center text-center max-w-md">
          <AlertCircle className="text-red-500 mb-4" size={48} />
          <p className="text-red-500 font-bold mb-6">{error}</p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-red-500 text-black px-6 py-2 rounded-full font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  const statCards = [
    { label: "Total Tracked", value: profileData.stats.total, icon: <Gamepad2 size={20} />, color: "text-white" },
    { label: "Completed", value: profileData.stats.completed, icon: <Trophy size={20} />, color: "text-yellow-400" },
    { label: "Currently Playing", value: profileData.stats.playing, icon: <Target size={20} />, color: "text-[var(--color-neon-cyan)]" },
    { label: "Backlog", value: profileData.stats.backlog, icon: <Clock size={20} />, color: "text-zinc-400" }
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
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{profileData.username}</h1>
            <p className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest text-sm mb-6">
              Vault Member since {profileData.joinDate}
            </p>
            
            {/* Hardware Tags */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {profileData.platforms && profileData.platforms.length > 0 ? (
                profileData.platforms.map(platform => (
                  <span key={platform} className="bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-secondary)] text-xs font-bold px-3 py-1.5 rounded-full uppercase">
                    {platform}
                  </span>
                ))
              ) : (
                <span className="text-[var(--color-text-secondary)] text-sm italic">No hardware preferences recorded.</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 self-start md:self-center hidden md:flex">
            <button className="bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] hover:border-[var(--color-neon-cyan)] text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] p-3 rounded-xl transition-colors" title="Settings">
              <Settings size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="bg-[var(--color-vault-black)] border border-red-500/50 hover:border-red-500 text-red-500/80 hover:text-red-500 p-3 rounded-xl transition-colors" 
              title="Terminate Connection"
            >
              <LogOut size={20} />
            </button>
          </div>
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