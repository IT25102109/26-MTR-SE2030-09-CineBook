import { apiClient } from './client';
import type { Movie } from '@/types';

/**
 * Normalizes raw backend Movie entities to ensure total compatibility
 * with frontend components regardless of naming convention differences.
 */
export function normalizeMovie(raw: any): Movie {
  return {
    id: String(raw.id),
    title: raw.title ?? '',
    synopsis: raw.synopsis ?? '',
    poster: raw.poster || raw.posterUrl || '',
    backdrop: raw.backdrop || raw.backdropUrl || '',
    genre: Array.isArray(raw.genre)
      ? raw.genre
      : Array.isArray(raw.genres)
      ? raw.genres
      : typeof raw.genresCsv === 'string' && raw.genresCsv.length > 0
      ? raw.genresCsv.split(',').map((s: string) => s.trim())
      : [],
    language: raw.language ?? 'English',
    duration: raw.duration ?? raw.durationMin ?? 120,
    rating: typeof raw.rating === 'number' ? raw.rating : parseFloat(raw.rating) || 0,
    certification: raw.certification || 'PG-13',
    director: raw.director ?? '',
    cast: Array.isArray(raw.cast)
      ? raw.cast
      : typeof raw.castCsv === 'string' && raw.castCsv.length > 0
      ? raw.castCsv.split(',').map((s: string) => s.trim())
      : [],
    releaseDate: raw.releaseDate ?? new Date().toISOString().split('T')[0],
    status: (raw.status || '').toLowerCase().includes('coming') ? 'coming-soon' : 'now-showing',
    featured: Boolean(raw.featured),
    trailerUrl: raw.trailerUrl ?? '#',
  };
}

export const movieApi = {
  /**
   * Fetch all movies from the backend REST API
   */
  async getMovies(): Promise<Movie[]> {
    const rawList = await apiClient<any[]>('/movies');
    return rawList.map(normalizeMovie);
  },

  /**
   * Fetch a single movie by ID
   */
  async getMovie(id: string): Promise<Movie> {
    const raw = await apiClient<any>(`/movies/${id}`);
    return normalizeMovie(raw);
  },

  /**
   * Create a new movie listing
   */
  async createMovie(movie: Omit<Movie, 'id'>): Promise<Movie> {
    const payload = {
      ...movie,
      genres: movie.genre,
      durationMin: movie.duration,
      posterUrl: movie.poster,
      backdropUrl: movie.backdrop,
      status: movie.status.replace('-', '_'),
    };
    const raw = await apiClient<any>('/movies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeMovie(raw);
  },

  /**
   * Update an existing movie
   */
  async updateMovie(id: string, movie: Omit<Movie, 'id'>): Promise<Movie> {
    const payload = {
      ...movie,
      genres: movie.genre,
      durationMin: movie.duration,
      posterUrl: movie.poster,
      backdropUrl: movie.backdrop,
      status: movie.status.replace('-', '_'),
    };
    const raw = await apiClient<any>(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeMovie(raw);
  },

  /**
   * Delete a movie by ID
   */
  async deleteMovie(id: string): Promise<void> {
    await apiClient<void>(`/movies/${id}`, {
      method: 'DELETE',
    });
  },
};
