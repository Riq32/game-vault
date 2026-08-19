import { useState, useEffect } from 'react';

export function useBacklog() {
  const [backlog, setBacklog] = useState(() => {
    const saved = localStorage.getItem('gamevault_backlog');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gamevault_backlog', JSON.stringify(backlog));
  }, [backlog]);

  const toggleBacklog = (game) => {
    setBacklog(prev => {
      const exists = prev.find(g => g.id === game.id);
      if (exists) return prev.filter(g => g.id !== game.id);
      // Save only necessary data to prevent local storage bloat
      return [...prev, { id: game.id, name: game.name, background_image: game.background_image }];
    });
  };

  const isInBacklog = (id) => backlog.some(g => g.id === id);

  return { backlog, toggleBacklog, isInBacklog };
}