export type Role = 'customer' | 'cinemaManager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
}

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  poster: string;
  backdrop: string;
  genre: string[];
  language: string;
  duration: number;
  rating: number;
  certification: string;
  director: string;
  cast: string[];
  releaseDate: string;
  status: 'now-showing' | 'coming-soon';
  featured: boolean;
  trailerUrl: string;
}

export interface CinemaHall {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  premiumRows: number;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  halls: CinemaHall[];
}

export interface Showtime {
  id: string;
  movieId: string;
  branchId: string;
  hallId: string;
  date: string;
  time: string;
  basePrice: number;
  premiumPrice: number;
  bookedSeats: string[];
}

export interface Booking {
  id: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  branchId: string;
  branchName: string;
  hallName: string;
  showtimeId: string;
  date: string;
  time: string;
  seats: string[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  refundStatus: 'none' | 'pending' | 'processed';
  bookingDate: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type NotificationType =
  | 'booking_confirmation'
  | 'cancellation_refund'
  | 'showtime_reminder'
  | 'price_alert'
  | 'system_announcement'
  | 'content_update'
  | 'low_availability'
  | 'new_booking'
  | 'scheduling_conflict'
  | 'revenue_milestone'
  | 'user_registration';

export type NotificationAudience = 'all' | 'role' | 'branch';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: string;
  link?: string;
  audience?: NotificationAudience;
  audienceTarget?: string;
  createdBy?: string;
  status?: 'sent' | 'read' | 'failed';
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  booking_confirmation: boolean;
  showtime_reminder: boolean;
  price_alert: boolean;
  system_announcement: boolean;
}

export interface MovieReview {
  id: string;
  movieId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minSpend: number;
  validUntil: string;
  active: boolean;
}

