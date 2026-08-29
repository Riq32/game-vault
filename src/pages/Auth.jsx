import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, AlertCircle, Terminal, Mail, Lock, User, BadgeCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Purge local storage on mount for a clean slate
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const validateForm = () => {
    if (!isLogin && !formData.fullName.trim()) return "Full name is required.";
    if (!isLogin && formData.username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const url = isLogin 
      ? 'https://game-vault-backend-n7ul.onrender.com/api/login' 
      : 'https://game-vault-backend-n7ul.onrender.com/api/register';

    try {
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : { full_name: formData.fullName, username: formData.username, email: formData.email, password: formData.password };
        
      const response = await axios.post(url, payload);
      
      const { token, username, full_name } = response.data;
      
      // 🛡️ REMOVED THE CONFLICTING AXIOS.DEFAULTS LINE HERE
      
      login(token, {
        username: username,
        full_name: full_name
      });
      
      navigate(isLogin ? '/discover' : '/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ fullName: '', username: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[var(--color-vault-black)]">
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[var(--color-neon-cyan)]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-[var(--color-neon-magenta)]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-8 md:p-12 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-vault-black)] border border-[var(--color-neon-cyan)] rounded-xl flex items-center justify-center transform rotate-12 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Terminal className="text-[var(--color-neon-cyan)]" size={32} />
          </div>
        </div>

        <h2 className="text-3xl font-black text-center uppercase tracking-tighter mb-2">
          {isLogin ? 'Vault Access' : 'Create Identity'}
        </h2>
        <p className="text-[var(--color-text-secondary)] text-center text-sm font-medium tracking-widest uppercase mb-8">
          {isLogin ? 'Authenticate to continue' : 'Register your credentials'}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div 
              key="error-box"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm font-bold mb-6 overflow-hidden"
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence>
            {!isLogin && (
              <motion.div 
                key="register-fields"
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 overflow-hidden"
              >
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <BadgeCheck className="text-[var(--color-text-secondary)]" size={18} />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    placeholder="Legal / Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all font-medium placeholder:text-zinc-600"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-[var(--color-text-secondary)]" size={18} />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    placeholder="Operative Alias (Username)"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s/g, '') })}
                    className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all font-medium placeholder:text-zinc-600"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="text-[var(--color-text-secondary)]" size={18} />
            </div>
            <input
              type="email"
              required
              placeholder="Transmission Link (Email)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all font-medium placeholder:text-zinc-600"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-[var(--color-text-secondary)]" size={18} />
            </div>
            <input
              type="password"
              required
              placeholder="Security Key (Password)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all font-medium placeholder:text-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-neon-cyan)] text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
          >
            {loading ? 'Processing...' : (isLogin ? <><LogIn size={18} /> Initialize Login</> : <><UserPlus size={18} /> Register Identity</>)}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[var(--color-vault-border)] pt-6">
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">
            {isLogin ? "No vault access yet?" : "Already registered?"}
          </p>
          <button 
            onClick={toggleMode} 
            className="text-[var(--color-neon-cyan)] font-bold uppercase tracking-widest text-xs mt-2 hover:text-white transition-colors"
          >
            {isLogin ? 'Create Identity' : 'Initialize Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}