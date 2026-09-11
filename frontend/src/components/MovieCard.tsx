import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import type { Movie } from '@/types';
import { Badge } from '@/components/ui/Badge';

export function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-ink-800 border border-white/5 card-hover">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/400x600/18181d/a1a1aa?text=${encodeURIComponent(movie.title)}`;
            }}
          />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="gold"><Star className="w-3 h-3 fill-gold" /> {movie.rating.toFixed(1)}</Badge>
            {movie.genres.slice(0, 2).map((g) => (
              <Badge key={g} variant="accent">{g}</Badge>
            ))}
          </div>
          <p className="text-xs text-ink-200 line-clamp-3">{movie.synopsis}</p>
        </div>
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {movie.status === 'coming_soon' ? (
            <Badge variant="warning">Coming Soon</Badge>
          ) : (
            <Badge variant="success">Now Showing</Badge>
          )}
        </div>
        {movie.featured && (
          <div className="absolute top-3 right-3">
            <Badge variant="gold"><Plus className="w-3 h-3" /> Featured</Badge>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-sm truncate group-hover:text-accent transition-colors">{movie.title}</h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-ink-400">
          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-gold text-gold" /> {movie.rating.toFixed(1)}</span>
          <span>•</span>
          <span>{movie.durationMin}m</span>
          <span>•</span>
          <span className="truncate">{movie.language}</span>
        </div>
      </div>
    </Link>
  );
}
