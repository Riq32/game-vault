import { motion } from 'framer-motion';
import { Database, Shield, Zap, LayoutGrid, Library, Globe, BrainCircuit } from 'lucide-react';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const features = [
    { icon: <Library />, title: "Unified Backlog", desc: "Consolidate your scattered libraries from Steam, PlayStation, Xbox, and Nintendo into one centralized command center." },
    { icon: <Zap />, title: "Real-Time Discovery", desc: "Powered by the RAWG API, explore a constantly updating database of over 800,000 games with high-res metadata." },
    { icon: <BrainCircuit />, title: "AI Translation", desc: "Break language barriers on foreign imports or obscure retro titles with integrated AI-powered description translations." },
    { icon: <Database />, title: "Relational Tracking", desc: "A robust PostgreSQL backend ensures your custom lists, ratings, and play-statuses are permanently synced." }
  ];

  return (
    <div className="relative min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6 overflow-hidden">
      
      {/* Immersive Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: `linear-gradient(to right, var(--color-vault-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-vault-border) 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
          }} 
        />
        
        {/* Floating Neon Orbs */}
        <motion.div 
          animate={{ 
            y: [0, -50, 0], 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 w-[40rem] h-[40rem] bg-[var(--color-neon-cyan)] rounded-full blur-[150px] opacity-20 mix-blend-screen"
        />
        <motion.div 
          animate={{ 
            y: [0, 50, 0], 
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-fuchsia-600 rounded-full blur-[150px] opacity-20 mix-blend-screen"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Cinematic Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-block border border-[var(--color-neon-cyan)]/30 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-6"
          >
            System Initialization
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            Project <span className="text-[var(--color-neon-cyan)]">Game Vault</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-bold tracking-wide">
            Eliminating digital clutter. <br/>
            <span className="text-white">Conquering choice paralysis.</span>
          </p>
        </motion.div>

        {/* Origin & Mission Statement (Glassmorphism) */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-[var(--color-vault-surface)]/80 backdrop-blur-xl border border-[var(--color-vault-border)] p-8 md:p-12 rounded-3xl mb-24 relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-black mb-6 tracking-tight border-b-2 border-[var(--color-neon-cyan)]/50 pb-2 inline-block">The Origin</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg mb-6">
                Founded in early 2026, Game Vault was engineered to solve a modern gaming crisis: the scattered library. With digital storefronts multiplying and subscription services fragmenting our collections, players were spending more time deciding what to play than actually playing.
              </p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
                What began as a technical architecture capstone project evolved into a premium, unified tracker. It is designed for completionists, reviewers, and everyday players who want absolute control over their digital footprint.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-6 tracking-tight border-b-2 border-[var(--color-neon-cyan)]/50 pb-2 inline-block">What It Does</h2>
              <ul className="space-y-6 text-[var(--color-text-secondary)] text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-[var(--color-neon-cyan)] mt-1 flex-shrink-0 bg-[var(--color-neon-cyan)]/10 p-1 rounded"><LayoutGrid size={16}/></span>
                  Aggregates game metadata, trailers, and storefront pricing into a single, OLED-optimized interface.
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[var(--color-neon-cyan)] mt-1 flex-shrink-0 bg-[var(--color-neon-cyan)]/10 p-1 rounded"><Database size={16}/></span>
                  Allows users to curate custom catalogs (Playing, Completed, Dropped, Wishlist) securely in the cloud.
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[var(--color-neon-cyan)] mt-1 flex-shrink-0 bg-[var(--color-neon-cyan)]/10 p-1 rounded"><Globe size={16}/></span>
                  Provides a platform for writing reviews and utilizing AI to interact with global game data seamlessly.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-black text-center mb-12 tracking-tight uppercase"
        >
          Core <span className="text-[var(--color-neon-cyan)]">Systems</span>
        </motion.h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-8 mb-24"
        >
          {features.map((feat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="bg-[var(--color-vault-surface)]/80 backdrop-blur-md border border-[var(--color-vault-border)] p-8 rounded-2xl hover:border-[var(--color-neon-cyan)]/80 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] rounded-xl flex items-center justify-center mb-6 text-[var(--color-text-secondary)] group-hover:text-[var(--color-neon-cyan)] group-hover:border-[var(--color-neon-cyan)] transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">{feat.title}</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* System Architecture Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-[var(--color-vault-surface)] to-[var(--color-vault-black)] border border-[var(--color-neon-cyan)]/30 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden group hover:border-[var(--color-neon-cyan)] transition-colors"
        >
          <div className="absolute inset-0 bg-[var(--color-neon-cyan)]/5 translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-700 ease-out"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-white">Full Stack Architecture</h2>
            <p className="text-[var(--color-text-secondary)] font-medium tracking-wide">React Frontend <span className="text-[var(--color-neon-cyan)] mx-2">↔</span> Flask (Python) Backend <span className="text-[var(--color-neon-cyan)] mx-2">↔</span> PostgreSQL</p>
          </div>
          <div className="relative z-10 mt-6 md:mt-0 text-[var(--color-vault-black)] bg-[var(--color-neon-cyan)] font-black tracking-widest uppercase text-sm px-6 py-3 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2">
            <Shield size={18} /> System Operational
          </div>
        </motion.div>

      </div>
    </div>
  );
}