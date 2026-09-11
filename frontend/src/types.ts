export type Role = 'customer' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
}

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  cast: string[];
  director: string;
  genres: string[];
  language: string;
  rating: number;
  durationMin: number;
  releaseDate: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  status: 'now_showing' | 'coming_soon';
  featured: boolean;
}

export interface CinemaHall {
  id: string;
  branchId: string;
  name: string;
  rows: number;
  cols: number;
  premiumRows: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  branchId: string;
  hallId: string;
  date: string;
  time: string;
  price: number;
  premiumPrice: number;
  bookedSeats: string[];
}

export interface CinemaBranch {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface Booking {
  id: string;
  userId: string;
  movieId: string;
  showtimeId: string;
  branchId: string;
  hallId: string;
  seats: string[];
  date: string;
  time: string;
  subtotal: number;
  fees: number;
  total: number;
  status: 'confirmed' | 'cancelled';
  refundStatus: 'none' | 'pending' | 'refunded';
  bookedAt: string;
  paymentMethod: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId?: string;
  status: 'active' | 'suspended';
  joinedAt: string;
}
