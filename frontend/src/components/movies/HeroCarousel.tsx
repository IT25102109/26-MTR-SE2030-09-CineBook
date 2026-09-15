import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Movie } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface HeroCarouselProps {
  movies: Movie[];
}

export function HeroCarousel({ movies }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % movies.length), [movies.length]);
  const prev = () => setCurrent(c => (c - 1 + movies.length) % movies.length);

  useEffect(() => {
    if (isPaused || movies.length <= 1) return;
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [isPaused, next, movies.length]);

  if (movies.length === 0) return null;

  const movie = movies[current];

  return (
    <div
      className="relative h-[70vh] min-h-[500px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {movies.map((m, i) => (
        <div
          key={m.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={m.backdrop}
            alt={m.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-base via-cinema-base/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-base/90 via-cinema-base/40 to-transparent" />
        </div>
      ))}

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16">
        <div key={movie.id} className="max-w-2xl animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="amber">
              <Star className="w-3 h-3 fill-accent-primary text-accent-primary" />
              {movie.rating}
            </Badge>
            <Badge variant={movie.status === 'now-showing' ? 'green' : 'blue'}>
              {movie.status === 'now-showing' ? 'Now Showing' : 'Coming Soon'}
            </Badge>
            <Badge variant="outline">
              <Clock className="w-3 h-3" /> {movie.duration}m
            </Badge>
          </div>

          <h1 className="text-hero font-display font-bold mb-4">{movie.title}</h1>
          <p className="text-base text-text-secondary leading-relaxed mb-6 line-clamp-3 max-w-xl">
            {movie.synopsis}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link to={`/movies/${movie.id}`}>
              <Button size="lg">
                <Play className="w-4 h-4 fill-current" /> Book Tickets
              </Button>
            </Link>
            <Link to={`/movies/${movie.id}`}>
              <Button size="lg" variant="outline">Details</Button>
            </Link>
            <span className="text-sm text-text-muted ml-2">
              {movie.genre.join(' • ')}
            </span>
          </div>
        </div>
      </div>

      {movies.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-text-primary hover:bg-accent-primary hover:text-black transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-text-primary hover:bg-accent-primary hover:text-black transition-all z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 right-6 flex gap-1.5 z-10">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-accent-primary' : 'w-4 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
