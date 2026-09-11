import { movies as seedMovies, showtimes as seedShowtimes, halls as seedHalls, branches as seedBranches, users as seedUsers, seedBookings } from '@/data/mockData';
import type { Movie, Showtime, CinemaHall, CinemaBranch, AppUser, Booking } from '@/types';

const KEYS = {
  movies: 'cinebook.movies',
  showtimes: 'cinebook.showtimes',
  halls: 'cinebook.halls',
  branches: 'cinebook.branches',
  users: 'cinebook.users',
  bookings: 'cinebook.bookings',
  role: 'cinebook.role',
  seeded: 'cinebook.seeded.v1',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedIfNeeded(): void {
  if (!localStorage.getItem(KEYS.seeded)) {
    write(KEYS.movies, seedMovies);
    write(KEYS.showtimes, seedShowtimes);
    write(KEYS.halls, seedHalls);
    write(KEYS.branches, seedBranches);
    write(KEYS.users, seedUsers);
    write(KEYS.bookings, seedBookings);
    localStorage.setItem(KEYS.seeded, '1');
  }
}

export function resetData(): void {
  write(KEYS.movies, seedMovies);
  write(KEYS.showtimes, seedShowtimes);
  write(KEYS.halls, seedHalls);
  write(KEYS.branches, seedBranches);
  write(KEYS.users, seedUsers);
  write(KEYS.bookings, seedBookings);
  localStorage.setItem(KEYS.seeded, '1');
}

export const store = {
  getMovies: (): Movie[] => read(KEYS.movies, seedMovies),
  setMovies: (v: Movie[]) => write(KEYS.movies, v),

  getShowtimes: (): Showtime[] => read(KEYS.showtimes, seedShowtimes),
  setShowtimes: (v: Showtime[]) => write(KEYS.showtimes, v),

  getHalls: (): CinemaHall[] => read(KEYS.halls, seedHalls),
  setHalls: (v: CinemaHall[]) => write(KEYS.halls, v),

  getBranches: (): CinemaBranch[] => read(KEYS.branches, seedBranches),
  setBranches: (v: CinemaBranch[]) => write(KEYS.branches, v),

  getUsers: (): AppUser[] => read(KEYS.users, seedUsers),
  setUsers: (v: AppUser[]) => write(KEYS.users, v),

  getBookings: (): Booking[] => read(KEYS.bookings, seedBookings),
  setBookings: (v: Booking[]) => write(KEYS.bookings, v),

  getRole: (): string | null => localStorage.getItem(KEYS.role),
  setRole: (role: string) => localStorage.setItem(KEYS.role, role),
  clearRole: () => localStorage.removeItem(KEYS.role),
};

export const uid = (prefix = 'id'): string => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
