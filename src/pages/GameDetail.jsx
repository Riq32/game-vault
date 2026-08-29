import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingCart, Languages, MessageSquare, Calendar, ImageIcon, Loader2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { fetchGameDetails } from '../api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import axios from 'axios';
import ShareMenu from '../components/ShareMenu'; // <-- Imported ShareMenu

export default function GameDetail() {
  const { id } = useParams();
  const { data: game, loading, error } = useFetch(() => fetchGameDetails(id), id);
  
  // AI Translation States
  const [isTranslated, setIsTranslated] = useState(true);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Review States
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`https://game-vault-backend-n7ul.onrender.com/api/reviews/${id}`);
        setReviews(response.data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  const previewImages = game?.short_screenshots || game?.screenshots || [
    { id: 1, image: game?.background_image },
    { id: 2, image: game?.background_image_additional || 'https://placehold.co/600x400/1a1a1a/00f0ff?text=Visual+Intel+Unavailable' }
  ];

  if (loading) return <div className="min-h-screen pt-32"><LoadingSpinner /></div>;
  if (error) return <div className="min-h-screen pt-32"><ErrorMessage message={error} /></div>;
  if (!game) return null;

  const handleTranslate = async () => {
    if (isTranslated) {
      if (translatedText) {
        setIsTranslated(false);
      } else {
        setIsTranslating(true);
        try {
          const response = await axios.post('https://game-vault-backend-n7ul.onrender.com/api/translate', {
            text: game.description
          });
          setTranslatedText(response.data.translated_text);
          setIsTranslated(false);
        } catch (err) {
          console.error("AI Translation Error:", err);
          alert("Failed to connect to the AI translation server.");
        } finally {
          setIsTranslating(false);
        }
      }
    } else {
      setIsTranslated(true);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Unauthorized Access. Please log in to transmit a review.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await axios.post(
        'https://game-vault-backend-n7ul.onrender.com/api/reviews',
        { game_id: id, rating: rating, text: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Optimistic update: Inject the new review into the feed dynamically
      setReviews([response.data.review, ...reviews]);
      setReviewText('');
      setRating(5); // Reset stars
    } catch (err) {
      console.error(err);
      alert("Failed to transmit review to central server.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="bg-[var(--color-vault-black)] min-h-screen text-[var(--color-text-primary)] pb-24">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <div className="relative w-full h-[60vh] md:h-[75vh] bg-black overflow-hidden">
        {game.clip ? (
          <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60">
            <source src={game.clip.clip} type="video/mp4" />
          </video>
        ) : (
          <img src={game.background_image} alt={game.name} className="w-full h-full object-cover opacity-50" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-vault-black)] via-[var(--color-vault-black)]/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                {game.released ? new Date(game.released).getFullYear() : 'TBA'}
              </span>
              <div className="flex items-center gap-1 bg-[var(--color-vault-black)]/80 backdrop-blur-md border border-[var(--color-vault-border)] px-3 py-1 rounded-md text-xs font-bold text-[var(--color-neon-cyan)]">
                <Star size={14} className="fill-[var(--color-neon-cyan)]" /> {game.rating}
              </div>
              
              {/* Main Game Page Share */}
              <ShareMenu 
                contentText={`Check out ${game.name} on Game Vault!`} 
                shareUrl={window.location.href} 
              />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter drop-shadow-2xl">
              {game.name}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
        
        <div className="lg:col-span-2 space-y-12">
          
          {/* AI Translation & Description */}
          <section className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-8 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--color-vault-border)] pb-4">
              <h2 className="text-2xl font-black tracking-tight">Data Log</h2>
              <button 
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] px-4 py-2 rounded-full text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)] hover:text-black transition-colors disabled:opacity-50"
              >
                {isTranslating ? <Loader2 className="animate-spin" size={16} /> : <Languages size={16} />}
                {isTranslating ? 'Processing...' : (isTranslated ? 'AI Translate (JP)' : 'View Original (EN)')}
              </button>
            </div>
            <p 
              className="text-[var(--color-text-secondary)] leading-relaxed text-lg transition-opacity duration-300" 
              style={{ opacity: isTranslating ? 0.5 : 1 }}
              dangerouslySetInnerHTML={{ __html: isTranslated ? game.description : translatedText }} 
            />
          </section>

          {/* Gameplay Previews */}
          <section>
            <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-3">
              <ImageIcon className="text-[var(--color-neon-cyan)]" /> Visual Intel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewImages.slice(0, 4).map((img, idx) => (
                <motion.div 
                  key={img.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--color-vault-border)] group"
                >
                  <img 
                    src={img.image} 
                    alt={`${game.name} gameplay preview ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-vault-black)]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Interactive Review System */}
          <section>
            <h2 className="text-3xl font-black tracking-tight mb-8 flex items-center gap-3">
              <MessageSquare className="text-[var(--color-neon-cyan)]" /> Player Comm-Link
            </h2>
            
            <form onSubmit={handleReviewSubmit} className="mb-10 bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] rounded-2xl p-6 relative focus-within:border-[var(--color-neon-cyan)] transition-colors">
              <textarea 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Initialize transmission... What are your thoughts on this title?"
                className="w-full bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] resize-none focus:outline-none min-h-[100px]"
              />
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--color-vault-border)]">
                <div className="flex gap-2">
                  {/* Interactive Star Rating */}
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      size={24} 
                      onClick={() => setRating(star)}
                      className={`cursor-pointer transition-colors ${
                        star <= rating 
                          ? 'text-[var(--color-neon-cyan)] fill-[var(--color-neon-cyan)]' 
                          : 'text-[var(--color-vault-border)] hover:text-[var(--color-neon-cyan)]'
                      }`} 
                    />
                  ))}
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmittingReview}
                  className="bg-[var(--color-neon-cyan)] text-black px-6 py-2 rounded-full font-black uppercase tracking-wider text-sm hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingReview ? <Loader2 className="animate-spin" size={16} /> : 'Transmit'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              <AnimatePresence>
                {reviews.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[var(--color-text-secondary)] py-8 font-medium">
                    No comm-link transmissions found. Be the first to review.
                  </motion.div>
                ) : (
                  reviews.map((review) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-6 rounded-2xl flex gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] flex items-center justify-center flex-shrink-0">
                        <span className="font-black text-[var(--color-neon-cyan)] uppercase">{review.user.charAt(0)}</span>
                      </div>
                      <div className="w-full">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[var(--color-text-primary)]">{review.user}</span>
                              <span className="text-xs font-medium text-[var(--color-text-secondary)]">{review.date}</span>
                            </div>
                            <div className="flex mt-1">
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} size={14} className={star <= review.rating ? 'text-[var(--color-neon-cyan)] fill-[var(--color-neon-cyan)]' : 'text-[var(--color-vault-border)]'} />
                              ))}
                            </div>
                          </div>
                          
                          {/* Individual Review Share */}
                          <ShareMenu 
                            contentText={`"${review.text}" - Read ${review.user}'s full review of ${game.name} on Game Vault.`} 
                            shareUrl={window.location.href} 
                          />
                        </div>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed mt-2">{review.text}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Stores & Meta Details */}
        <div className="space-y-6">
          <div className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-6 rounded-3xl">
            <h3 className="text-xl font-black mb-6 tracking-tight flex items-center gap-2 border-b border-[var(--color-vault-border)] pb-4">
              <ShoppingCart size={20} className="text-[var(--color-neon-cyan)]" /> Marketplaces
            </h3>
            
            <div className="space-y-3">
              {game.stores?.length > 0 ? (
                game.stores.map((s) => (
                  <a 
                    key={s.store.id} 
                    href={`https://${s.store.domain}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group flex justify-between items-center bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] p-4 rounded-xl hover:border-[var(--color-neon-cyan)] transition-colors"
                  >
                    <span className="font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{s.store.name}</span>
                    <span className="font-black text-[var(--color-neon-cyan)]">$59.99</span>
                  </a>
                ))
              ) : (
                <div className="text-[var(--color-text-secondary)] text-sm">No marketplace data found.</div>
              )}
            </div>
          </div>

          <div className="bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] p-6 rounded-3xl space-y-6">
            <div>
              <span className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest block mb-1">Developer</span>
              <span className="font-bold text-lg">{game.developers?.[0]?.name || 'Unknown'}</span>
            </div>
            
            <div>
              <span className="text-[var(--color-text-secondary)] text-xs font-bold uppercase tracking-widest block mb-3 flex items-center gap-2">
                <Calendar size={14} /> Platform Sell Dates
              </span>
              <div className="flex flex-col gap-2">
                {game.platforms?.map(p => (
                  <div key={p.platform.id} className="flex justify-between items-center bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] px-3 py-2 rounded-lg">
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{p.platform.name}</span>
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                      {p.released_at 
                        ? new Date(p.released_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : 'TBA'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}