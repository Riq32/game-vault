import { useState, useEffect } from 'react';

export function useBacklog() {
  const [backlog, setBacklog] = useState(() => {
    const saved = localStorage.getItem('gamevault_backlog');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gamevault_backlog', JSON.stringify(backlog));
  }, [backlog]);

  const updateGameStatus = (game, status) => {
    setBacklog(prev => {
      const exists = prev.find(g => g.id === game.id);
      if (exists) {
        return prev.map(g => g.id === game.id ? { ...g, status } : g);
      }
      return [...prev, { 
        id: game.id, 
        name: game.name, 
        background_image: game.background_image,
        rating: game.rating,
        status 
      }];
    });
  };

  const removeGame = (id) => {
    setBacklog(prev => prev.filter(g => g.id !== id));
  };

  const getGameStatus = (id) => {
    const game = backlog.find(g => g.id === id);
    return game ? game.status : null;
  };

  return { backlog, updateGameStatus, removeGame, getGameStatus };
}