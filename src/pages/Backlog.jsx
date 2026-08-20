import { useState } from 'react';
import { useBacklog } from '../hooks/useBacklog';
import GameCard from '../components/GameCard';

export default function Backlog() {
  const { backlog } = useBacklog();
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Games' },
    { id: 'want_to_play', label: 'Want to Play' },
    { id: 'playing', label: 'Playing' },
    { id: 'completed', label: 'Completed' },
    { id: 'dropped', label: 'Dropped' }
  ];

  const displayedGames = activeTab === 'all' 
    ? backlog 
    : backlog.filter(game => game.status === activeTab);

  return (
    <main className="max-w-7xl mx-auto p-6 animate-fade-in">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-4xl font-black mb-3 tracking-tight text-slate-900 dark:text-white">My Library</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your personal collection and tracking status.</p>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-10 pb-4 animate-slide-up">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 border ${
              activeTab === tab.id 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
                : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-primary/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {displayedGames.length === 0 ? (
        <div className="text-center py-24 text-slate-500 border-2 border-dashed border-light-border dark:border-dark-border rounded-3xl bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm animate-slide-up">
          <p className="text-xl font-semibold mb-2">No games found.</p>
          <p>Search for games and add them to this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedGames.map((game, index) => (
            <div key={game.id} style={{ animationDelay: `${index * 50}ms` }}>
              <GameCard game={game} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}