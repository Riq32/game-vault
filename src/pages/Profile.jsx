import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Gamepad2, Trophy, Clock, Target, Loader2, AlertCircle, LogOut, Edit2, Save, X, CheckCircle2, Zap, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ImageUploader from '../components/ImageUploader';

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({ displayName: '', email: '', profilePic: '' });
  const [imagePayload, setImagePayload] = useState(null);
  const [dailyToast, setDailyToast] = useState(null);
  
  const navigate = useNavigate();
  const { token, logout, updateUser } = useAuth(); 

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return navigate('/auth');
      try {
        const response = await axios.get('https://game-vault-backend-n7ul.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);
        setFormData({
          displayName: response.data.username || '',
          email: response.data.email || '',
          profilePic: response.data.avatar_url || ''
        });

        // Display Daily Login Notification
        if (response.data.streak?.reward_awarded > 0) {
          setDailyToast({
            title: response.data.streak.milestone ? 'WEEKLY STREAK BONUS' : 'DAILY LOGIN',
            message: `+${response.data.streak.reward_awarded} XP Added to your reserves.`
          });
          setTimeout(() => setDailyToast(null), 4000);
        }

      } catch (err) {
        setError('Failed to decrypt vault identity.');
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token, navigate, logout]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    let finalImageUrl = formData.profilePic;

    try {
      if (imagePayload) {
        if (imagePayload.type === 'url') {
          finalImageUrl = imagePayload.data;
        } else if (imagePayload.type === 'file') {
          const uploadData = new FormData();
          uploadData.append('image', imagePayload.data);
          const uploadRes = await axios.post('https://game-vault-backend-n7ul.onrender.com/api/upload', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
          });
          finalImageUrl = `https://game-vault-backend-n7ul.onrender.com${uploadRes.data.url}`;
        }
      }

      const updatedProfile = { username: formData.displayName, email: formData.email, avatar_url: finalImageUrl };
      const response = await axios.patch('https://game-vault-backend-n7ul.onrender.com/api/profile', updatedProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfileData({ ...profileData, ...updatedProfile });
      setFormData({ ...formData, profilePic: finalImageUrl });
      if (response.data.user) updateUser(response.data.user); 
      
      setSaveMessage({ type: 'success', text: 'Identity updated securely.' });
      setTimeout(() => { setIsEditing(false); setSaveMessage({ type: '', text: '' }); }, 2000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.response?.data?.error || 'Update failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 flex justify-center"><Loader2 className="animate-spin text-[var(--color-neon-cyan)]" size={48} /></div>;
  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6 relative">
      
      <AnimatePresence>
        {dailyToast && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -20, x: '-50%' }} className="fixed top-24 left-1/2 z-50 bg-[var(--color-vault-surface)] border-2 border-[var(--color-neon-cyan)] rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
            <Flame size={24} className="text-orange-500" />
            <div>
              <h4 className="font-black text-lg text-white uppercase tracking-widest">{dailyToast.title}</h4>
              <p className="text-[var(--color-text-secondary)] text-sm font-bold">{dailyToast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-3xl p-8 relative overflow-hidden">
          {!isEditing ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-[var(--color-vault-black)] border-2 border-[var(--color-neon-cyan)] rounded-full flex items-center justify-center overflow-hidden">
                {profileData.avatar_url ? <img src={profileData.avatar_url} className="w-full h-full object-cover" /> : <User size={48} className="text-[var(--color-neon-cyan)]" />}
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-1 flex items-center justify-center md:justify-start gap-3">
                  {profileData.username} 
                  {profileData.streak?.current > 2 && <span className="text-orange-500 flex items-center text-lg"><Flame size={20}/> {profileData.streak.current}</span>}
                </h1>
                <p className="text-[var(--color-text-secondary)] font-medium mb-2">{profileData.email}</p>
                <p className="text-[var(--color-neon-cyan)] text-xs font-bold uppercase tracking-widest">Vault Member since {profileData.join_date}</p>
              </div>
              <div className="flex gap-3 mt-6 md:mt-0">
                <button onClick={() => setIsEditing(true)} className="bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] hover:border-[var(--color-neon-cyan)] text-[var(--color-text-secondary)] p-3 rounded-xl transition-colors"><Edit2 size={18} /></button>
                <button onClick={() => { logout(); navigate('/auth'); }} className="bg-[var(--color-vault-black)] border border-red-500/50 hover:border-red-500 text-red-500 p-3 rounded-xl transition-colors"><LogOut size={18} /></button>
              </div>
            </div>
          ) : (
             <form onSubmit={handleSave} className="w-full relative z-10 space-y-6">
                <div className="flex justify-between items-center border-b border-[var(--color-vault-border)] pb-4">
                  <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2"><Settings className="text-[var(--color-neon-cyan)]" /> Configure Identity</h2>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-[var(--color-text-secondary)] hover:text-white"><X size={24} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[var(--color-text-secondary)] text-xs font-bold uppercase mb-2">Display Name</label>
                      <input type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-white rounded-xl py-3 px-4 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[var(--color-text-secondary)] text-xs font-bold uppercase mb-2">Transmission Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-white rounded-xl py-3 px-4 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[var(--color-text-secondary)] text-xs font-bold uppercase mb-2">Visual Parameters</label>
                    <ImageUploader onImageSelect={setImagePayload} currentAvatar={formData.profilePic} />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-[var(--color-vault-border)]">
                  <button type="submit" disabled={isSaving} className="bg-[var(--color-neon-cyan)] text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
          )}
        </motion.div>

        {profileData.gamification && !isEditing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-3xl p-8 relative overflow-hidden">
            <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                <p className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Zap size={14} className="text-[var(--color-neon-cyan)]" /> Global Rank
                </p>
                <h3 className="text-4xl font-black text-white drop-shadow-md">Level {profileData.gamification.level}</h3>
              </div>
              <div className="text-right">
                <p className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-1">Next Level</p>
                <p className="text-sm font-bold text-white">
                  {profileData.gamification.xp_into_level} <span className="text-[var(--color-text-secondary)]">/ {profileData.gamification.xp_needed} XP</span>
                </p>
              </div>
            </div>
            <div className="w-full bg-[var(--color-vault-black)] rounded-full h-4 overflow-hidden border border-[var(--color-vault-border)] relative z-10 shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${profileData.gamification.progress_percentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="bg-[var(--color-neon-cyan)] h-full shadow-[0_0_15px_var(--color-neon-cyan)] rounded-full relative" />
            </div>
            <div className="mt-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)] relative z-10">
              <span>Total Accrued: {profileData.gamification.total_xp} XP</span>
              <button onClick={() => navigate('/leaderboard')} className="text-[var(--color-neon-cyan)] hover:text-white transition-colors">View Leaderboard &rarr;</button>
            </div>
          </motion.div>
        )}

        {profileData.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Tracked", value: profileData.stats.total, icon: <Gamepad2 size={20} />, color: "text-white" },
              { label: "Completed", value: profileData.stats.completed, icon: <Trophy size={20} />, color: "text-yellow-400" },
              { label: "Currently Playing", value: profileData.stats.playing, icon: <Target size={20} />, color: "text-[var(--color-neon-cyan)]" },
              { label: "Backlog", value: profileData.stats.backlog, icon: <Clock size={20} />, color: "text-zinc-400" }
            ].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-6 rounded-2xl flex flex-col justify-between h-32">
                <div className="flex justify-between items-start text-[var(--color-text-secondary)]">
                  <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <div className="text-4xl font-black">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}