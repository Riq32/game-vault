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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const features = [
    { icon: <Library />, title: "Unified Backlog", desc: "Consolidate your scattered libraries from Steam, PlayStation, Xbox, and Nintendo into one centralized command center." },
    { icon: <Zap />, title: "Real-Time Discovery", desc: "Powered by the RAWG API, explore a constantly updating database of over 800,000 games with high-res metadata." },
    { icon: <BrainCircuit />, title: "AI Translation", desc: "Break language barriers on foreign imports or obscure retro titles with integrated AI-powered description translations." },
    { icon: <Database />, title: "Relational Tracking", desc: "A robust PostgreSQL backend ensures your custom lists, ratings, and play-statuses are permanently synced." }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-vault-black)] pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Cinematic Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase">
            Project <span className="text-[var(--color-neon-cyan)]">Game Vault</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xl max-w-2xl mx-auto leading-relaxed font-bold tracking-wide">
            Eliminating digital clutter. Conquering choice paralysis.
          </p>
        </motion.div>

        {/* Origin & Mission Statement */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-8 md:p-12 rounded-3xl mb-20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-neon-cyan)]/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-black mb-4 tracking-tight border-b border-[var(--color-vault-border)] pb-4 inline-block">The Origin</h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4">
                Founded in early 2026, Game Vault was engineered to solve a modern gaming crisis: the scattered library. With digital storefronts multiplying and subscription services fragmenting our collections, players were spending more time deciding what to play than actually playing.
              </p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
                What began as a technical architecture capstone project evolved into a premium, unified tracker. It is designed for completionists, reviewers, and everyday players who want absolute control over their digital footprint.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-black mb-4 tracking-tight border-b border-[var(--color-vault-border)] pb-4 inline-block">What It Does</h2>
              <ul className="space-y-4 text-[var(--color-text-secondary)] text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-neon-cyan)] mt-1">▹</span>
                  Aggregates game metadata, trailers, and storefront pricing into a single, OLED-optimized interface.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-neon-cyan)] mt-1">▹</span>
                  Allows users to curate custom catalogs (Playing, Completed, Dropped, Wishlist) securely in the cloud.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-neon-cyan)] mt-1">▹</span>
                  Provides a platform for writing reviews and utilizing AI to interact with global game data seamlessly.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <h2 className="text-3xl font-black text-center mb-10 tracking-tight uppercase">Core <span className="text-[var(--color-neon-cyan)]">Systems</span></h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 gap-8 mb-20"
        >
          {features.map((feat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-8 rounded-2xl hover:border-[var(--color-neon-cyan)]/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] rounded-xl flex items-center justify-center mb-6 text-[var(--color-text-secondary)] group-hover:text-[var(--color-neon-cyan)] group-hover:border-[var(--color-neon-cyan)] transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feat.title}</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* System Architecture Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[var(--color-vault-surface)] to-[var(--color-vault-black)] border border-[var(--color-vault-border)] rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Full Stack Architecture</h2>
            <p className="text-[var(--color-text-secondary)]">React Frontend ↔ Flask (Python) Backend ↔ PostgreSQL</p>
          </div>
          <div className="mt-6 md:mt-0 text-[var(--color-neon-cyan)] font-bold tracking-widest uppercase text-sm border border-[var(--color-neon-cyan)] px-6 py-3 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center gap-2">
            <Shield size={16} /> System Operational
          </div>
        </motion.div>

      </div>
    </div>
  );
}