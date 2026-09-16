import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Bookmark, Sparkles } from 'lucide-react';
import type { Movie } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { isMovieWishlisted, toggleWishlist } from '@/data/store';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  matchScore?: number;
  matchReason?: string;
  onWishlistChange?: () => void;
}

export function MovieCard({ movie, index = 0, matchScore, matchReason, onWishlistChange }: MovieCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlisted, setWishlisted] = useState(() => (user ? isMovieWishlisted(user.id, movie.id) : false));

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('info', 'Please sign in to save movies to your wishlist');
      return;
    }
    const newState = toggleWishlist(user.id, movie.id);
    setWishlisted(newState);
    if (newState) {
      toast('success', `Added "${movie.title}" to your wishlist! You'll be alerted when showtimes open.`);
    } else {
      toast('info', `Removed "${movie.title}" from your wishlist`);
    }
    if (onWishlistChange) onWishlistChange();
  };

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
    >
      <div className="relative rounded-2xl overflow-hidden bg-cinema-card hairline transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-amber group-hover:border-accent-primary/20">
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-base via-cinema-base/20 to-transparent" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <Badge variant={movie.status === 'now-showing' ? 'green' : 'blue'}>
              {movie.status === 'now-showing' ? 'Now Showing' : 'Coming Soon'}
            </Badge>
            {matchScore && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-accent-primary text-black px-2 py-0.5 rounded-full shadow-md font-mono">
                <Sparkles className="w-3 h-3 fill-black" /> {matchScore}% Match
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={handleToggleWishlist}
              title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist / Notify Me'}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                wishlisted
                  ? 'bg-accent-primary text-black shadow-md'
                  : 'bg-black/60 text-text-secondary hover:text-white hover:bg-black/80'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${wishlisted ? 'fill-black' : ''}`} />
            </button>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
              <Star className="w-3 h-3 fill-accent-primary text-accent-primary" />
              <span className="text-xs font-semibold text-accent-primary">{movie.rating}</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display font-semibold text-base leading-tight mb-1 group-hover:text-accent-primary transition-colors">
              {movie.title}
            </h3>
            {matchReason && (
              <p className="text-[11px] text-accent-primary truncate mb-1">
                {matchReason}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span>{movie.genre[0]}</span>
              <span className="text-text-muted">•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{movie.duration}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
