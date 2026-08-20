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
    <main className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-3 tracking-tight">My Library</h1>
        <p className="text-slate-500 font-medium">Manage your personal collection and tracking status.</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {displayedGames.length === 0 ? (
        <div className="text-center py-24 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
          <p className="text-xl font-semibold mb-2">No games found.</p>
          <p>Search for games and add them to this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </main>
  );
}