import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link as LinkIcon, Check, MessageCircle, Smartphone } from 'lucide-react';

export default function ShareMenu({ contentText, shareUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  // Handle clicking outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Game Vault Intel',
          text: contentText,
          url: shareUrl
        });
        setIsOpen(false);
      } catch (err) {
        console.error('Native share aborted or failed:', err);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 2000);
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(contentText);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={16} />,
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:text-green-400 hover:bg-green-400/10'
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'hover:text-zinc-300 hover:bg-zinc-800'
    },
    {
      name: 'Facebook',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-blue-500 hover:bg-blue-500/10'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:text-blue-400 hover:bg-blue-400/10'
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] transition-colors text-xs font-bold uppercase tracking-widest bg-[var(--color-vault-black)] px-3 py-1.5 rounded-lg border border-[var(--color-vault-border)] hover:border-[var(--color-neon-cyan)]"
      >
        <Share2 size={14} /> Share
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex flex-col">
              {/* Native Device Share (Visible only on supported browsers/mobile) */}
              {navigator.share && (
                <button 
                  onClick={handleNativeShare}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white hover:bg-[var(--color-vault-surface)] transition-colors border-b border-[var(--color-vault-border)]"
                >
                  <Smartphone size={16} className="text-[var(--color-neon-cyan)]" /> Device Share
                </button>
              )}

              {/* Social OAuth Links */}
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-text-secondary)] transition-colors ${link.color}`}
                >
                  {link.icon} {link.name}
                </a>
              ))}
              
              {/* Copy to Clipboard */}
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/10 transition-colors border-t border-[var(--color-vault-border)]"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <LinkIcon size={16} />}
                {copied ? <span className="text-green-400">Copied to Clipboard</span> : 'Copy Link'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}