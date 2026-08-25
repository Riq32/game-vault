import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TODO: In Phase 2, this will send a POST request to your Flask backend
    // axios.post(`http://localhost:5000/${isLogin ? 'login' : 'signup'}`, formData)
    
    console.log(`${isLogin ? 'Logging in' : 'Signing up'} with:`, formData);
    
    // Simulate successful auth and push to the collaborative filtering onboarding
    if (!isLogin) {
      navigate('/onboarding');
    } else {
      navigate('/discover');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '' }); // Clear inputs on toggle
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--color-vault-black)] pt-20 px-6">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-neon-cyan)]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-2xl shadow-2xl overflow-hidden p-8"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] mb-4 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <Gamepad2 className="text-[var(--color-neon-cyan)]" size={32} />
          </div>
          <h2 className="text-3xl font-black text-[var(--color-text-primary)] uppercase tracking-tighter">
            {isLogin ? 'Access Vault' : 'Create Identity'}
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium mt-2">
            {isLogin ? 'Enter your credentials to continue.' : 'Join the elite tracking network.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-neon-cyan)] transition-colors" size={20} />
            </div>
            <input
              type="text"
              required
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all placeholder-[var(--color-text-secondary)]/50 font-medium"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-neon-cyan)] transition-colors" size={20} />
            </div>
            <input
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] text-[var(--color-text-primary)] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-neon-cyan)] focus:ring-1 focus:ring-[var(--color-neon-cyan)] transition-all placeholder-[var(--color-text-secondary)]/50 font-medium"
            />
          </div>

          <button 
            type="submit"
            className="w-full group relative flex items-center justify-center gap-2 bg-[var(--color-neon-cyan)] text-[var(--color-vault-black)] font-black uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                {isLogin ? 'Login' : 'Initialize'}
              </motion.span>
            </AnimatePresence>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">
            {isLogin ? "Don't have an access code?" : "Already have an identity?"}{' '}
            <button 
              onClick={toggleAuthMode}
              type="button"
              className="text-[var(--color-neon-cyan)] font-bold hover:underline underline-offset-4 tracking-wide"
            >
              {isLogin ? 'Register now.' : 'Sign in.'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}