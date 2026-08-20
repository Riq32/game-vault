import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <main className="animate-fade-in pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden mb-24 mt-[-6rem]">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent dark:from-black/95 dark:via-black/80 z-10"></div>

        <div className="relative z-20 max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-12 pt-20">
          
          <div className="max-w-2xl">
            <p className="text-primary font-bold tracking-widest text-sm uppercase mb-4 drop-shadow-md">Welcome to GameVault</p>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[1.05] mb-6">
              Stop searching.<br /> Start playing.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl font-medium">
              Find the masterpieces that fit your life, your backlog, your priorities, and the way you want to game.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/discover" className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-primary/30 flex items-center gap-2">
                Discover Masterpieces &rarr;
              </Link>
              <Link to="/backlog" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3.5 rounded-full font-bold transition-all shadow-lg">
                Explore My Library
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">🔥 Trending</span>
              <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">⭐ Top Rated</span>
              <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">🎮 New Releases</span>
            </div>
          </div>

          <div className="hidden md:block bg-white dark:bg-dark-card p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full animate-slide-up border border-slate-100 dark:border-dark-border" style={{ animationDelay: '200ms' }}>
            <p className="text-primary font-bold tracking-widest text-xs uppercase mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Your Next Adventure
            </p>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight mb-8">
              A universe<br /> of games.
            </h2>
            <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> 
              Powered by RAWG API
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Everything you need to track your gaming journey.</h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto text-lg">
            GameVault combines a massive, up-to-date database with elegant organization tools so you never lose track of what to play next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-light-card dark:bg-dark-card p-8 rounded-3xl border border-light-border dark:border-dark-border shadow-lg hover:-translate-y-2 transition-transform duration-300 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mb-6">
              🔍
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Discover</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Browse through millions of games across all platforms. Filter by genre, search by exact titles, and view high-resolution screenshots and Metacritic scores.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-light-card dark:bg-dark-card p-8 rounded-3xl border border-light-border dark:border-dark-border shadow-lg hover:-translate-y-2 transition-transform duration-300 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="w-14 h-14 bg-success/10 text-success rounded-2xl flex items-center justify-center text-3xl mb-6">
              📌
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Track</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Add games to your personalized library. Instantly categorize them as "Want to Play", "Currently Playing", "Completed", or "Dropped".
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-light-card dark:bg-dark-card p-8 rounded-3xl border border-light-border dark:border-dark-border shadow-lg hover:-translate-y-2 transition-transform duration-300 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-6">
              🗂️
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Organize</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Your entire gaming history, sorted beautifully. Never buy a game on sale twice, and always know exactly what masterpiece awaits you next.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}