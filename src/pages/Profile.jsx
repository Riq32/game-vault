import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Gamepad2, Trophy, Clock, Target, Loader2, AlertCircle, LogOut, Edit2, Save, X, Mail, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({ displayName: '', email: '', profilePic: '' });
  
  const navigate = useNavigate();
  const { token, logout, updateUser } = useAuth(); 

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        navigate('/auth');
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);
        setFormData({
          displayName: response.data.displayName || '',
          email: response.data.email || '',
          profilePic: response.data.profilePic || ''
        });
      } catch (err) {
        setError('Failed to decrypt vault identity.');
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSaveMessage({ type: 'error', text: 'Invalid email format.' });
      setIsSaving(false);
      return;
    }

    try {
      const response = await axios.put('http://localhost:5000/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData({ ...profileData, ...formData });
      updateUser(response.data.user); 
      setSaveMessage({ type: 'success', text: 'Identity updated securely.' });
      setTimeout(() => { setIsEditing(false); setSaveMessage({ type: '', text: '' }); }, 2000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update identity parameters.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-[var(--color-neon-cyan)] mb-4" size={48} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 flex flex-col items-center justify-center px-6">
      <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center max-w-md">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <p className="text-red-500 font-bold mb-6">{error}</p>
        <button onClick={() => navigate('/auth')} className="bg-red-500 text-black px-6 py-2 rounded-full font-black uppercase tracking-wider text-sm">Return to Login</button>
      </div>
    </div>
  );

  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-3xl p-8 md:p-12 relative overflow-hidden transition-all">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--color-neon-cyan)]/5 rounded-full blur-[80px] pointer-events-none"></div>

          {!isEditing ? (
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-32 h-32 bg-[var(--color-vault-black)] border-2 border-[var(--color-neon-cyan)] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)] flex-shrink-0 overflow-hidden">
                {profileData.profilePic ? <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" /> : <User size={48} className="text-[var(--color-neon-cyan)]" />}
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-1">{profileData.displayName || profileData.username}</h1>
                <p className="text-[var(--color-text-secondary)] font-medium mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className="font-bold tracking-widest text-sm uppercase">@{profileData.username}</span>
                  {profileData.email && <><span className="opacity-50">|</span><span className="text-sm">{profileData.email}</span></>}
                </p>
                <p className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest text-xs mb-6 text-[var(--color-neon-cyan)]">Vault Member since {profileData.joinDate}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {profileData.platforms?.map(platform => <span key={platform} className="bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-secondary)] text-xs font-bold px-3 py-1.5 rounded-full uppercase">{platform}</span>)}
                </div>
              </div>
              <div className="flex gap-3 mt-6 md:mt-0">
                <button onClick={() => setIsEditing(true)} className="bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] hover:border-[var(--color-neon-cyan)] text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] p-3 rounded-xl transition-colors flex items-center gap-2"><Edit2 size={18} /> <span className="text-sm font-bold uppercase hidden md:block">Edit Profile</span></button>
                <button onClick={handleLogout} className="bg-[var(--color-vault-black)] border border-red-500/50 hover:border-red-500 text-red-500/80 hover:text-red-500 p-3 rounded-xl transition-colors"><LogOut size={18} /></button>
              </div>
            </div>
          ) : (
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSave} className="w-full relative z-10">
              <div className="flex justify-between items-center mb-8 border-b border-[var(--color-vault-border)] pb-4">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2"><Settings className="text-[var(--color-neon-cyan)]" /> Configure Identity</h2>
                <button type="button" onClick={() => { setIsEditing(false); setSaveMessage({type:'', text:''}); }} className="text-[var(--color-text-secondary)] hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <AnimatePresence>
                {saveMessage.text && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${saveMessage.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-[var(--color-neon-cyan)]/10 border-[var(--color-neon-cyan)]/50 text-[var(--color-neon-cyan)]'}`}>
                    {saveMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} {saveMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-2">Display Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="text-[var(--color-text-secondary)]" size={18} /></div>
                      <input type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-2">Transmission Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="text-[var(--color-text-secondary)]" size={18} /></div>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)]" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest mb-2">Avatar URL (Image Link)</label>
                  <div className="relative group mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><ImageIcon className="text-[var(--color-text-secondary)]" size={18} /></div>
                    <input type="url" value={formData.profilePic} onChange={(e) => setFormData({...formData, profilePic: e.target.value})} className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)]" />
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] rounded-xl">
                    <div className="w-16 h-16 rounded-full border border-[var(--color-vault-border)] overflow-hidden bg-[var(--color-vault-surface)] flex items-center justify-center">
                      {formData.profilePic ? <img src={formData.profilePic} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} /> : <User size={24} className="text-[var(--color-text-secondary)]" />}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-[var(--color-vault-border)] pt-6">
                <button type="button" onClick={() => setIsEditing(false)} disabled={isSaving} className="px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm text-[var(--color-text-secondary)] hover:text-white disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-[var(--color-neon-cyan)] text-black px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </motion.form>
          )}
        </motion.div>
        
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
      </div>
    </div>
  );
}