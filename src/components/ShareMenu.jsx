import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link as LinkIcon, Check, MessageCircle, Twitter, Facebook, Linkedin, Smartphone } from 'lucide-react';

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
      icon: <Twitter size={16} />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'hover:text-zinc-300 hover:bg-zinc-800'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={16} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-blue-500 hover:bg-blue-500/10'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={16} />,
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