import { mockMovies, mockBranches, mockShowtimes, mockBookings, mockUsers, mockAdminUsers, mockNotifications, mockNotificationTemplates, mockMovieReviews, mockPromotions } from '@/data/mockData';
import type { Movie, Branch, Showtime, Booking, User, Role, Notification, NotificationTemplate, NotificationPreferences, MovieReview, Promotion } from '@/types';
import { movieApi } from '@/api/movieApi';
import { branchApi } from '@/api/branchApi';
import { showtimeApi } from '@/api/showtimeApi';
import { bookingApi } from '@/api/bookingApi';

const KEYS = {
  movies: 'cinebook_movies',
  branches: 'cinebook_branches',
  showtimes: 'cinebook_showtimes',
  bookings: 'cinebook_bookings',
  users: 'cinebook_users',
  currentUser: 'cinebook_current_user',
  seeded: 'cinebook_seeded',
  notifications: 'cinebook_notifications',
  notificationTemplates: 'cinebook_notification_templates',
  notificationPrefs: 'cinebook_notification_prefs',
  reviews: 'cinebook_reviews',
  promotions: 'cinebook_promotions',
};

export function seedData(): void {
  if (localStorage.getItem(KEYS.seeded)) return;
  localStorage.setItem(KEYS.movies, JSON.stringify(mockMovies));
  localStorage.setItem(KEYS.branches, JSON.stringify(mockBranches));
  localStorage.setItem(KEYS.showtimes, JSON.stringify(mockShowtimes));
  localStorage.setItem(KEYS.bookings, JSON.stringify(mockBookings));
  localStorage.setItem(KEYS.users, JSON.stringify(mockAdminUsers));
  localStorage.setItem(KEYS.notifications, JSON.stringify(mockNotifications));
  localStorage.setItem(KEYS.notificationTemplates, JSON.stringify(mockNotificationTemplates));
  localStorage.setItem(KEYS.reviews, JSON.stringify(mockMovieReviews));
  localStorage.setItem(KEYS.promotions, JSON.stringify(mockPromotions));
  localStorage.setItem(KEYS.seeded, 'true');
}


export async function syncFromBackend(): Promise<void> {
  try {
    const [moviesResult, branchesResult, showtimesResult, bookingsResult] = await Promise.allSettled([
      movieApi.getMovies(),
      branchApi.getBranches(),
      showtimeApi.getShowtimes(),
      bookingApi.getBookings(),
    ]);

    if (moviesResult.status === 'fulfilled' && moviesResult.value && moviesResult.value.length > 0) {
      write(KEYS.movies, moviesResult.value);
    }
    if (branchesResult.status === 'fulfilled' && branchesResult.value && branchesResult.value.length > 0) {
      write(KEYS.branches, branchesResult.value);
    }
    if (showtimesResult.status === 'fulfilled' && showtimesResult.value && showtimesResult.value.length > 0) {
      write(KEYS.showtimes, showtimesResult.value);
    }
    if (bookingsResult.status === 'fulfilled' && bookingsResult.value && bookingsResult.value.length > 0) {
      write(KEYS.bookings, bookingsResult.value);
    }
  } catch (err) {
    console.warn('Backend sync failed, using local store data:', err);
  }
}

function read<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Movies
export function getMovies(): Movie[] {
  return read<Movie>(KEYS.movies);
}

export function getMovie(id: string): Movie | undefined {
  return getMovies().find(m => m.id === id);
}

export function saveMovie(movie: Movie): void {
  const movies = getMovies();
  const idx = movies.findIndex(m => m.id === movie.id);
  if (idx >= 0) {
    movies[idx] = movie;
    movieApi.updateMovie(movie.id, movie).catch(err =>
      console.warn('API updateMovie sync failed, changes kept locally:', err)
    );
  } else {
    const localId = movie.id || `m${Date.now()}`;
    const toSave = { ...movie, id: localId };
    movies.push(toSave);
    movieApi.createMovie(movie).then(created => {
      if (created.id && created.id !== localId) {
        const current = getMovies();
        const item = current.find(m => m.id === localId);
        if (item) item.id = created.id;
        write(KEYS.movies, current);
      }
    }).catch(err =>
      console.warn('API createMovie sync failed, changes kept locally:', err)
    );
  }
  write(KEYS.movies, movies);
}

export function deleteMovie(id: string): void {
  write(KEYS.movies, getMovies().filter(m => m.id !== id));
  movieApi.deleteMovie(id).catch(err =>
    console.warn('API deleteMovie sync failed, deletion kept locally:', err)
  );
}

// Branches
export function getBranches(): Branch[] {
  return read<Branch>(KEYS.branches);
}

export function getBranch(id: string): Branch | undefined {
  return getBranches().find(b => b.id === id);
}

export function saveBranch(branch: Branch): void {
  const branches = getBranches();
  const idx = branches.findIndex(b => b.id === branch.id);
  if (idx >= 0) {
    branches[idx] = branch;
    branchApi.updateBranch(branch.id, branch).catch(err =>
      console.warn('API updateBranch sync failed, changes kept locally:', err)
    );
  } else {
    const localId = branch.id || `b${Date.now()}`;
    const toSave = { ...branch, id: localId };
    branches.push(toSave);
    branchApi.createBranch(branch).then(created => {
      if (created.id && created.id !== localId) {
        const current = getBranches();
        const item = current.find(b => b.id === localId);
        if (item) item.id = created.id;
        write(KEYS.branches, current);
      }
    }).catch(err =>
      console.warn('API createBranch sync failed, changes kept locally:', err)
    );
  }
  write(KEYS.branches, branches);
}

export function deleteBranch(id: string): void {
  write(KEYS.branches, getBranches().filter(b => b.id !== id));
  branchApi.deleteBranch(id).catch(err =>
    console.warn('API deleteBranch sync failed, deletion kept locally:', err)
  );
}

// Showtimes
export function getShowtimes(): Showtime[] {
  return read<Showtime>(KEYS.showtimes);
}

export function getShowtimesByMovie(movieId: string): Showtime[] {
  return getShowtimes().filter(s => s.movieId === movieId);
}

export function getShowtime(id: string): Showtime | undefined {
  return getShowtimes().find(s => s.id === id);
}

export async function saveShowtime(showtime: Showtime): Promise<Showtime> {
  const showtimes = getShowtimes();
  const idx = showtimes.findIndex(s => s.id === showtime.id);
  if (idx >= 0) {
    showtimes[idx] = showtime;
    write(KEYS.showtimes, showtimes);
    try {
      return await showtimeApi.updateShowtime(showtime.id, showtime);
    } catch (err) {
      console.warn('API updateShowtime sync failed, changes kept locally:', err);
      return showtime;
    }
  } else {
    const localId = showtime.id || `s${Date.now()}`;
    const toSave = { ...showtime, id: localId };
    showtimes.push(toSave);
    write(KEYS.showtimes, showtimes);
    try {
      const created = await showtimeApi.createShowtime(showtime);
      if (created.id && created.id !== localId) {
        const current = getShowtimes();
        const item = current.find(s => s.id === localId);
        if (item) item.id = created.id;
        write(KEYS.showtimes, current);
      }
      return created;
    } catch (err) {
      console.warn('API createShowtime sync failed, changes kept locally:', err);
      return toSave;
    }
  }
}

export async function deleteShowtime(id: string): Promise<void> {
  write(KEYS.showtimes, getShowtimes().filter(s => s.id !== id));
  try {
    await showtimeApi.deleteShowtime(id);
  } catch (err) {
    console.warn('API deleteShowtime sync failed, deletion kept locally:', err);
  }
}

export async function updateShowtimeSeats(showtimeId: string, seats: string[]): Promise<void> {
  const showtimes = getShowtimes();
  const idx = showtimes.findIndex(s => s.id === showtimeId);
  if (idx >= 0) {
    showtimes[idx].bookedSeats = [...showtimes[idx].bookedSeats, ...seats];
    write(KEYS.showtimes, showtimes);
    try {
      await showtimeApi.addBookedSeats(showtimeId, seats);
    } catch (err) {
      console.warn('API addBookedSeats sync failed, changes kept locally:', err);
    }
  }
}

// Bookings
export function getBookings(): Booking[] {
  return read<Booking>(KEYS.bookings);
}

export function getUserBookings(userId: string): Booking[] {
  return getBookings().filter(b => b.userId === userId);
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings();
  bookings.push(booking);
  write(KEYS.bookings, bookings);
  bookingApi.createBooking(booking).then(created => {
    if (created.id && created.id !== booking.id) {
      const current = getBookings();
      const item = current.find(b => b.id === booking.id);
      if (item) item.id = created.id;
      write(KEYS.bookings, current);
    }
  }).catch(err =>
    console.warn('API createBooking sync failed, kept locally:', err)
  );
}

export function updateBooking(id: string, updates: Partial<Booking>): void {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx >= 0) {
    bookings[idx] = { ...bookings[idx], ...updates };
    write(KEYS.bookings, bookings);
    if (updates.status === 'cancelled') {
      bookingApi.cancelBooking(id).catch(err =>
        console.warn('API cancelBooking sync failed, kept locally:', err)
      );
    }
  }
}

// Users
export function getUsers(): User[] {
  return read<User>(KEYS.users);
}

export function saveUser(user: User): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push({ ...user, id: `u${Date.now()}` });
  }
  write(KEYS.users, users);
}

export function deleteUser(id: string): void {
  write(KEYS.users, getUsers().filter(u => u.id !== id));
}

// Auth
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(KEYS.currentUser);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.currentUser);
  }
}

export function loginAsRole(role: Role): User {
  const user = mockUsers.find(u => u.role === role)!;
  setCurrentUser(user);
  return user;
}

export function getHall(branchId: string, hallId: string) {
  const branch = getBranch(branchId);
  return branch?.halls.find(h => h.id === hallId);
}

// Notifications
export function getNotifications(): Notification[] {
  return read<Notification>(KEYS.notifications);
}

export function getUserNotifications(userId: string): Notification[] {
  return getNotifications()
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveNotification(notification: Notification): void {
  const notifications = getNotifications();
  notifications.push(notification);
  write(KEYS.notifications, notifications);
}

export function markNotificationRead(id: string): void {
  const notifications = getNotifications();
  const idx = notifications.findIndex(n => n.id === id);
  if (idx >= 0) {
    notifications[idx].read = true;
    if (notifications[idx].status === 'sent') notifications[idx].status = 'read';
    write(KEYS.notifications, notifications);
  }
}

export function markAllNotificationsRead(userId: string): void {
  const notifications = getNotifications();
  notifications.forEach(n => {
    if (n.userId === userId) {
      n.read = true;
      if (n.status === 'sent') n.status = 'read';
    }
  });
  write(KEYS.notifications, notifications);
}

export function deleteNotification(id: string): void {
  write(KEYS.notifications, getNotifications().filter(n => n.id !== id));
}

export function broadcastNotification(
  notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt' | 'status'>,
  targetUserIds: string[]
): void {
  const notifications = getNotifications();
  const now = new Date().toISOString();
  targetUserIds.forEach(userId => {
    notifications.push({
      ...notification,
      id: `n${Date.now()}_${userId}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      read: false,
      createdAt: now,
      status: 'sent',
    });
  });
  write(KEYS.notifications, notifications);
}

// Notification Templates
export function getNotificationTemplates(): NotificationTemplate[] {
  return read<NotificationTemplate>(KEYS.notificationTemplates);
}

export function saveNotificationTemplate(template: NotificationTemplate): void {
  const templates = getNotificationTemplates();
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = template;
  } else {
    templates.push({ ...template, id: `tpl${Date.now()}` });
  }
  write(KEYS.notificationTemplates, templates);
}

export function deleteNotificationTemplate(id: string): void {
  write(KEYS.notificationTemplates, getNotificationTemplates().filter(t => t.id !== id));
}

// Notification Preferences
export function getNotificationPreferences(userId: string): NotificationPreferences {
  const data = localStorage.getItem(`${KEYS.notificationPrefs}_${userId}`);
  if (data) return JSON.parse(data);
  return {
    email: true,
    push: true,
    booking_confirmation: true,
    showtime_reminder: true,
    price_alert: true,
    system_announcement: true,
  };
}

export function saveNotificationPreferences(userId: string, prefs: NotificationPreferences): void {
  localStorage.setItem(`${KEYS.notificationPrefs}_${userId}`, JSON.stringify(prefs));
}

// All sent notifications (for admin view)
export function getAllSentNotifications(): Notification[] {
  return getNotifications()
    .filter(n => n.audience)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Movie Reviews
export function getReviews(): MovieReview[] {
  const list = read<MovieReview>(KEYS.reviews);
  return list.length > 0 ? list : mockMovieReviews;
}

export function getMovieReviews(movieId: string): MovieReview[] {
  return getReviews().filter(r => r.movieId === movieId && r.status === 'approved');
}

export function getAllReviewsForModeration(): MovieReview[] {
  return getReviews();
}

export function saveReview(review: MovieReview): void {
  const reviews = getReviews();
  const idx = reviews.findIndex(r => r.id === review.id);
  if (idx >= 0) {
    reviews[idx] = review;
  } else {
    reviews.unshift(review);
  }
  write(KEYS.reviews, reviews);
}

export function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): void {
  const reviews = getReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx >= 0) {
    reviews[idx].status = status;
    write(KEYS.reviews, reviews);
  }
}

// Promotions & Discounts
export function getPromotions(): Promotion[] {
  const list = read<Promotion>(KEYS.promotions);
  return list.length > 0 ? list : mockPromotions;
}

export function savePromotion(promo: Promotion): void {
  const promos = getPromotions();
  const idx = promos.findIndex(p => p.id === promo.id);
  if (idx >= 0) {
    promos[idx] = promo;
  } else {
    promos.push(promo);
  }
  write(KEYS.promotions, promos);
}

export function deletePromotion(id: string): void {
  write(KEYS.promotions, getPromotions().filter(p => p.id !== id));
}

export function validatePromoCode(code: string, subtotal: number): { valid: boolean; discount: number; message: string; promo?: Promotion } {
  const cleanCode = code.trim().toUpperCase();
  const promo = getPromotions().find(p => p.code.toUpperCase() === cleanCode && p.active);
  if (!promo) {
    return { valid: false, discount: 0, message: 'Invalid promo code' };
  }
  if (new Date(promo.validUntil) < new Date(new Date().toDateString())) {
    return { valid: false, discount: 0, message: 'Promo code has expired' };
  }
  if (subtotal < promo.minSpend) {
    return { valid: false, discount: 0, message: `Minimum spend of $${promo.minSpend.toFixed(2)} required` };
  }
  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = (subtotal * promo.discountValue) / 100;
  } else {
    discount = promo.discountValue;
  }
  discount = Math.min(discount, subtotal);
  return { valid: true, discount, message: `Applied ${promo.description}`, promo };
}

