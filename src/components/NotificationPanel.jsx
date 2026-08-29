import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, Star, Zap, X } from 'lucide-react';
import axios from 'axios';

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://game-vault-backend-n7ul.onrender.com/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to decrypt notifications array.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://game-vault-backend-n7ul.onrender.com/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://game-vault-backend-n7ul.onrender.com/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'reminder': return <Clock size={16} className="text-yellow-400" />;
      case 'recommendation': return <Star size={16} className="text-purple-400" />;
      case 'activity': return <Zap size={16} className="text-[var(--color-neon-cyan)]" />;
      default: return <Bell size={16} className="text-[var(--color-text-secondary)]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop to close panel when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={onClose}></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 w-80 md:w-96 bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-[var(--color-vault-border)] flex justify-between items-center bg-[var(--color-vault-surface)]">
              <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                Comm-Link {unreadCount > 0 && <span className="bg-[var(--color-neon-cyan)] text-black px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>}
              </h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[var(--color-text-secondary)] hover:text-white transition-colors p-1" title="Acknowledge All">
                    <Check size={16} />
                  </button>
                )}
                <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-white transition-colors p-1">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-8 text-center text-[var(--color-text-secondary)] animate-pulse text-sm font-bold uppercase tracking-widest">Decrypting Signals...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm font-bold uppercase tracking-widest">No Incoming Transmissions</div>
              ) : (
                <div className="divide-y divide-[var(--color-vault-border)]">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => !notif.is_read && markAsRead(notif.id)}
                      className={`p-4 transition-colors cursor-pointer flex gap-4 hover:bg-[var(--color-vault-surface)] ${notif.is_read ? 'opacity-60' : 'bg-[var(--color-vault-surface)]/30'}`}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-bold ${!notif.is_read ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>{notif.title}</h4>
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-[var(--color-neon-cyan)] flex-shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]/50 mt-2 block">{notif.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}