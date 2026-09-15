import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import type { Movie } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s`, opacity: 0 }}
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

          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant={movie.status === 'now-showing' ? 'green' : 'blue'}>
              {movie.status === 'now-showing' ? 'Now Showing' : 'Coming Soon'}
            </Badge>
          </div>

          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
              <Star className="w-3 h-3 fill-accent-primary text-accent-primary" />
              <span className="text-xs font-semibold text-accent-primary">{movie.rating}</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display font-semibold text-base leading-tight mb-1 group-hover:text-accent-primary transition-colors">
              {movie.title}
            </h3>
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
