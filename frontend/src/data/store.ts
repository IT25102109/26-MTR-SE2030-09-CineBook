import { mockMovies, mockBranches, mockShowtimes, mockBookings, mockUsers, mockAdminUsers, mockNotifications, mockNotificationTemplates, mockMovieReviews, mockPromotions } from '@/data/mockData';
import type { Movie, Branch, Showtime, Booking, User, Role, Notification, NotificationTemplate, NotificationPreferences, MovieReview, Promotion, MovieRecommendation, LoyaltyVoucher } from '@/types';
import { movieApi } from '@/api/movieApi';
import { branchApi } from '@/api/branchApi';
import { showtimeApi } from '@/api/showtimeApi';
import { bookingApi } from '@/api/bookingApi';
import { promotionApi } from '@/api/promotionApi';
import { userApi } from '@/api/userApi';

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
  wishlist: 'cinebook_wishlist',
  waitlists: 'cinebook_waitlists',
  vouchers: 'cinebook_loyalty_vouchers',
};

export function seedData(): void {
  // If legacy mock data is detected (e.g. 'm1', 'b1', 'bk1'), clear it so fresh DB data takes precedence
  const existingMoviesRaw = localStorage.getItem(KEYS.movies);
  const isLegacy = existingMoviesRaw && (existingMoviesRaw.includes('"id":"m1"') || existingMoviesRaw.includes('"id":"b1"'));
  if (isLegacy) {
    localStorage.removeItem(KEYS.movies);
    localStorage.removeItem(KEYS.branches);
    localStorage.removeItem(KEYS.showtimes);
    localStorage.removeItem(KEYS.bookings);
    localStorage.removeItem(KEYS.users);
    localStorage.removeItem(KEYS.currentUser);
    localStorage.removeItem(KEYS.promotions);
    localStorage.removeItem(KEYS.reviews);
    localStorage.removeItem(KEYS.notifications);
  }

  const existingMovies = localStorage.getItem(KEYS.movies);
  if (!existingMovies || JSON.parse(existingMovies).length === 0) {
    localStorage.setItem(KEYS.movies, JSON.stringify(mockMovies));
  }
  if (!localStorage.getItem(KEYS.branches) || JSON.parse(localStorage.getItem(KEYS.branches) || '[]').length === 0) {
    localStorage.setItem(KEYS.branches, JSON.stringify(mockBranches));
  }
  if (!localStorage.getItem(KEYS.showtimes) || JSON.parse(localStorage.getItem(KEYS.showtimes) || '[]').length === 0) {
    localStorage.setItem(KEYS.showtimes, JSON.stringify(mockShowtimes));
  }
  if (!localStorage.getItem(KEYS.bookings)) {
    localStorage.setItem(KEYS.bookings, JSON.stringify(mockBookings));
  }
  if (!localStorage.getItem(KEYS.users)) {
    localStorage.setItem(KEYS.users, JSON.stringify(mockAdminUsers));
  }
  const existingNotifications = localStorage.getItem(KEYS.notifications);
  if (!existingNotifications || JSON.parse(existingNotifications || '[]').length === 0) {
    localStorage.setItem(KEYS.notifications, JSON.stringify(mockNotifications));
  }
  if (!localStorage.getItem(KEYS.currentUser)) {
    localStorage.setItem(KEYS.currentUser, JSON.stringify(mockUsers[0]));
  }
  if (!localStorage.getItem(KEYS.notificationTemplates)) {
    localStorage.setItem(KEYS.notificationTemplates, JSON.stringify(mockNotificationTemplates));
  }
  if (!localStorage.getItem(KEYS.reviews)) {
    localStorage.setItem(KEYS.reviews, JSON.stringify(mockMovieReviews));
  }
  if (!localStorage.getItem(KEYS.promotions)) {
    localStorage.setItem(KEYS.promotions, JSON.stringify(mockPromotions));
  }
  localStorage.setItem(KEYS.seeded, 'true');
}


export async function syncFromBackend(): Promise<void> {
  try {
    const [moviesResult, branchesResult, showtimesResult, bookingsResult, promosResult, usersResult] = await Promise.allSettled([
      movieApi.getMovies(),
      branchApi.getBranches(),
      showtimeApi.getShowtimes(),
      bookingApi.getBookings(),
      promotionApi.getPromotions(),
      userApi.getUsers(),
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
    if (promosResult.status === 'fulfilled' && promosResult.value && promosResult.value.length > 0) {
      write(KEYS.promotions, promosResult.value);
    }
    if (usersResult.status === 'fulfilled' && usersResult.value && usersResult.value.length > 0) {
      write(KEYS.users, usersResult.value);
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
  const list = read<Movie>(KEYS.movies);
  if (!list || list.length === 0) {
    write(KEYS.movies, mockMovies);
    return mockMovies;
  }
  return list;
}

export async function fetchLiveMovies(): Promise<Movie[]> {
  try {
    const apiMovies = await movieApi.getMovies();
    if (apiMovies && apiMovies.length > 0) {
      write(KEYS.movies, apiMovies);
      return apiMovies;
    }
  } catch (err) {
    console.warn('Backend /api/movies unreachable, falling back to local cache:', err);
  }
  return getMovies();
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

export async function releaseShowtimeSeats(showtimeId: string, seats: string[]): Promise<void> {
  const showtimes = getShowtimes();
  const idx = showtimes.findIndex(s => s.id === showtimeId);
  if (idx >= 0) {
    const seatSet = new Set(seats);
    showtimes[idx].bookedSeats = showtimes[idx].bookedSeats.filter(s => !seatSet.has(s));
    write(KEYS.showtimes, showtimes);

    // Auto-dispatch waitlist alert if seats are released
    const waitlist = getWaitlist(showtimeId);
    if (waitlist.length > 0) {
      const luckyUser = waitlist[0];
      const st = showtimes[idx];
      const movie = getMovie(st.movieId);
      saveNotification({
        id: `n_wl_${Date.now()}`,
        type: 'low_availability',
        title: 'Waitlist Alert: Seats Freed Up!',
        message: `Seats have just opened up for ${movie ? movie.title : 'your show'} on ${st.date} at ${st.time}! Book now before they are taken.`,
        userId: luckyUser.userId,
        read: false,
        createdAt: new Date().toISOString(),
        status: 'sent',
      });
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

  // Award Customer Loyalty Points (1 point per $1 spent)
  const earnedPoints = Math.round(booking.totalAmount);
  if (earnedPoints > 0) {
    awardLoyaltyPoints(booking.userId, earnedPoints);
  }

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

export function cancelBookingWithRefund(id: string, refundAmount: number): void {
  const bookings = getBookings();
  const target = bookings.find(b => b.id === id);
  if (target) {
    // Release seats back to showtime inventory
    releaseShowtimeSeats(target.showtimeId, target.seats);

    updateBooking(id, {
      status: 'cancelled',
      refundStatus: refundAmount > 0 ? 'processed' : 'none',
      refundAmount: refundAmount,
    });
  }
}

export function rescheduleBooking(
  id: string,
  newShowtimeId: string,
  newDate: string,
  newTime: string,
  newHallName: string
): void {
  const bookings = getBookings();
  const target = bookings.find(b => b.id === id);
  if (target) {
    // Release seats from old showtime
    releaseShowtimeSeats(target.showtimeId, target.seats);
    // Reserve seats in new showtime
    updateShowtimeSeats(newShowtimeId, target.seats);

    updateBooking(id, {
      showtimeId: newShowtimeId,
      date: newDate,
      time: newTime,
      hallName: newHallName,
      rescheduledFrom: `${target.date} ${target.time}`,
    });
  }
}

// Loyalty & Tier Progression (Member 6: IT25101952)
export function calculateLoyaltyTier(points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
  if (points >= 1200) return 'Platinum';
  if (points >= 700) return 'Gold';
  if (points >= 300) return 'Silver';
  return 'Bronze';
}

export function awardLoyaltyPoints(userId: string, points: number): void {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    const currentPoints = user.loyaltyPoints ?? 0;
    const newPoints = Math.max(0, currentPoints + points);
    user.loyaltyPoints = newPoints;
    user.loyaltyTier = calculateLoyaltyTier(newPoints);
    saveUser(user);

    // Sync current user session if it matches
    const current = getCurrentUser();
    if (current && current.id === userId) {
      current.loyaltyPoints = newPoints;
      current.loyaltyTier = user.loyaltyTier;
      setCurrentUser(current);
    }
  }
}

export function getUserLoyaltyVouchers(userId: string): LoyaltyVoucher[] {
  const all = read<LoyaltyVoucher>(KEYS.vouchers);
  return all.filter(v => v.userId === userId);
}

export function redeemLoyaltyReward(userId: string, title: string, pointsCost: number): { success: boolean; voucher?: LoyaltyVoucher; message: string } {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, message: 'User not found' };

  const currentPoints = user.loyaltyPoints ?? 0;
  if (currentPoints < pointsCost) {
    return { success: false, message: `Insufficient loyalty points. You need ${pointsCost} pts but currently have ${currentPoints} pts.` };
  }

  // Deduct points
  const newPoints = currentPoints - pointsCost;
  user.loyaltyPoints = newPoints;
  user.loyaltyTier = calculateLoyaltyTier(newPoints);
  saveUser(user);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    current.loyaltyPoints = newPoints;
    current.loyaltyTier = user.loyaltyTier;
    setCurrentUser(current);
  }

  // Generate unique voucher code
  const codePrefix = title.split(' ')[0].replace(/[^A-Z]/gi, '').toUpperCase().slice(0, 4) || 'REWARD';
  const voucherCode = `CB-${codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days validity

  const voucher: LoyaltyVoucher = {
    id: `vch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    code: voucherCode,
    title,
    pointsCost,
    redeemedAt: now.toISOString(),
    expiresAt,
  };

  const allVouchers = read<LoyaltyVoucher>(KEYS.vouchers);
  allVouchers.unshift(voucher);
  write(KEYS.vouchers, allVouchers);

  return { success: true, voucher, message: `Redeemed ${title}! Voucher Code: ${voucherCode}` };
}

// Users
export function getUsers(): User[] {
  const users = read<User>(KEYS.users);
  return users.map(u => {
    if (u.role === 'customer' && (u.loyaltyPoints === undefined || !u.loyaltyTier)) {
      const defaultPts = (u.id === '1' || u.id === 'u1') ? 480 : (u.id === '4' || u.id === 'u4') ? 1450 : (u.id === '5' || u.id === 'u5') ? 860 : 120;
      return {
        ...u,
        loyaltyPoints: defaultPts,
        loyaltyTier: calculateLoyaltyTier(defaultPts),
      };
    }
    return u;
  });
}

export function saveUser(user: User): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
    userApi.updateUser(user.id, user).catch(err =>
      console.warn('API updateUser sync failed, changes kept locally:', err)
    );
  } else {
    const localId = user.id || String(Date.now());
    users.push({ ...user, id: localId });
    userApi.createUser(user).catch(err =>
      console.warn('API createUser sync failed, changes kept locally:', err)
    );
  }
  write(KEYS.users, users);
}

export function deleteUser(id: string): void {
  write(KEYS.users, getUsers().filter(u => u.id !== id));
  userApi.deleteUser(id).catch(err =>
    console.warn('API deleteUser sync failed, deletion kept locally:', err)
  );
}

// Auth
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(KEYS.currentUser);
  if (!data) return null;
  const user: User = JSON.parse(data);
  if (user.role === 'customer' && (user.loyaltyPoints === undefined || !user.loyaltyTier)) {
    const stored = getUsers().find(u => u.id === user.id);
    if (stored) {
      user.loyaltyPoints = stored.loyaltyPoints;
      user.loyaltyTier = stored.loyaltyTier;
      localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
    }
  }
  return user;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.currentUser);
  }
}

export function loginAsRole(role: Role): User {
  const allUsers = getUsers();
  const user = allUsers.find(u => u.role === role) || mockUsers.find(u => u.role === role)!;
  setCurrentUser(user);
  return user;
}

export function getHall(branchId: string, hallId: string) {
  const branch = getBranch(branchId);
  return branch?.halls.find(h => h.id === hallId);
}

// Notifications
export function getNotifications(): Notification[] {
  const list = read<Notification>(KEYS.notifications);
  if (!list || list.length === 0) {
    write(KEYS.notifications, mockNotifications);
    return mockNotifications;
  }
  return list;
}

export function getUserNotifications(userId: string): Notification[] {
  const allUsers = getUsers();
  const currentUser = allUsers.find(u => u.id === userId) || getCurrentUser();
  const currentRole = currentUser?.role?.toLowerCase();
  const currentBranchId = currentUser?.assignedBranchId;

  return getNotifications()
    .filter(n => {
      // 1. Direct recipient
      if (n.userId === userId) return true;
      // 2. Broadcast to all users
      if (n.audience === 'all') return true;
      // 3. Broadcast to specific role (e.g. 'admin', 'cinemamanager', 'customer')
      if (n.audience === 'role' && currentRole && n.audienceTarget?.toLowerCase() === currentRole) return true;
      // 4. Broadcast to specific cinema branch
      if (n.audience === 'branch' && currentBranchId && n.audienceTarget === currentBranchId) return true;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveNotification(notification: Notification): void {
  const notifications = getNotifications();
  const existingIdx = notifications.findIndex(n => n.id === notification.id);
  if (existingIdx >= 0) {
    notifications[existingIdx] = notification;
  } else {
    notifications.unshift(notification);
  }
  write(KEYS.notifications, notifications);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cinebook:notifications_updated'));
  }
}

export function markNotificationRead(id: string): void {
  const notifications = getNotifications();
  const idx = notifications.findIndex(n => n.id === id);
  if (idx >= 0) {
    notifications[idx].read = true;
    if (notifications[idx].status === 'sent') notifications[idx].status = 'read';
    write(KEYS.notifications, notifications);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cinebook:notifications_updated'));
    }
  }
}

export function markAllNotificationsRead(userId: string): void {
  const notifications = getNotifications();
  notifications.forEach(n => {
    if (n.userId === userId || n.audience === 'all') {
      n.read = true;
      if (n.status === 'sent') n.status = 'read';
    }
  });
  write(KEYS.notifications, notifications);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cinebook:notifications_updated'));
  }
}

export function deleteNotification(id: string): void {
  write(KEYS.notifications, getNotifications().filter(n => n.id !== id));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cinebook:notifications_updated'));
  }
}

export function broadcastNotification(
  notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt' | 'status'>,
  targetUserIds: string[]
): void {
  const notifications = getNotifications();
  const now = new Date().toISOString();
  targetUserIds.forEach(userId => {
    notifications.unshift({
      ...notification,
      id: `n${Date.now()}_${userId}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      read: false,
      createdAt: now,
      status: 'sent',
    });
  });
  write(KEYS.notifications, notifications);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cinebook:notifications_updated'));
  }
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

export function getMovieAllReviews(movieId: string): MovieReview[] {
  return getReviews().filter(r => r.movieId === movieId);
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

  // Notify all roles upon review submission
  const movie = getMovie(review.movieId);
  const movieTitle = movie ? movie.title : 'Movie';

  // 1. Notify the customer who wrote the review
  if (review.userId && !review.userId.startsWith('guest_')) {
    saveNotification({
      id: `n_rev_sub_${Date.now()}_${review.userId}`,
      type: 'review_pending',
      title: 'Review Submitted (Pending Approval)',
      message: `Your ${review.rating}★ review for "${movieTitle}" has been received and is awaiting staff moderation.`,
      userId: review.userId,
      read: false,
      createdAt: new Date().toISOString(),
      link: `/movies/${review.movieId}`,
      status: 'sent',
    });
  }

  // 2. Notify all Cinema Managers and Admins
  const staffUsers = getUsers().filter(u => u.role === 'admin' || u.role === 'cinemaManager');
  staffUsers.forEach(staff => {
    if (staff.id !== review.userId) {
      saveNotification({
        id: `n_staff_pending_${Date.now()}_${staff.id}`,
        type: 'review_pending',
        title: 'New Review Pending Moderation',
        message: `${review.userName} submitted a ${review.rating}★ review for "${movieTitle}". Action required in Review Moderation.`,
        userId: staff.id,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/manage/movies`,
        status: 'sent',
      });
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cinebook:notifications_updated'));
  }
}

export function updateReviewStatus(
  reviewId: string,
  status: 'approved' | 'rejected' | 'pending',
  moderator?: User | null
): void {
  const reviews = getReviews();
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx >= 0) {
    const prevStatus = reviews[idx].status;
    reviews[idx].status = status;
    write(KEYS.reviews, reviews);

    if (prevStatus !== status && (status === 'approved' || status === 'rejected')) {
      const review = reviews[idx];
      const movie = getMovie(review.movieId);
      const movieTitle = movie ? movie.title : 'Movie';
      const mod = moderator || getCurrentUser();
      const modName = mod ? mod.name : 'Cinema Staff';
      const isApproved = status === 'approved';

      // 1. Notify the customer (author of the review)
      if (review.userId && !review.userId.startsWith('guest_')) {
        saveNotification({
          id: `n_rev_mod_${Date.now()}_${review.userId}`,
          type: isApproved ? 'review_approved' : 'review_rejected',
          title: isApproved ? 'Review Approved! 🎉' : 'Review Status Update',
          message: isApproved
            ? `Your ${review.rating}★ review for "${movieTitle}" was approved by ${modName} and is now published!`
            : `Your review for "${movieTitle}" was reviewed by ${modName} and was not approved for publication.`,
          userId: review.userId,
          read: false,
          createdAt: new Date().toISOString(),
          link: `/movies/${review.movieId}`,
          status: 'sent',
        });
      }

      // 2. Notify other staff (Admins and Cinema Managers) for audit log
      const otherStaff = getUsers().filter(u =>
        (u.role === 'admin' || u.role === 'cinemaManager') && (!mod || u.id !== mod.id)
      );
      otherStaff.forEach(staff => {
        saveNotification({
          id: `n_staff_audit_${Date.now()}_${staff.id}`,
          type: isApproved ? 'review_approved' : 'review_rejected',
          title: isApproved ? 'Review Published' : 'Review Rejected',
          message: `${modName} marked review by ${review.userName} for "${movieTitle}" as ${status.toUpperCase()}.`,
          userId: staff.id,
          read: false,
          createdAt: new Date().toISOString(),
          link: `/manage/movies`,
          status: 'sent',
        });
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cinebook:notifications_updated'));
      }
    }
  }
}

export function deleteReview(reviewId: string, moderator?: User | null): void {
  const reviews = getReviews();
  const target = reviews.find(r => r.id === reviewId);
  write(KEYS.reviews, reviews.filter(r => r.id !== reviewId));

  if (target) {
    const movie = getMovie(target.movieId);
    const movieTitle = movie ? movie.title : 'Movie';
    const mod = moderator || getCurrentUser();
    const modName = mod ? mod.name : 'Cinema Staff';

    // 1. Notify author
    if (target.userId && !target.userId.startsWith('guest_')) {
      saveNotification({
        id: `n_rev_del_${Date.now()}_${target.userId}`,
        type: 'review_rejected',
        title: 'Review Removed',
        message: `Your review for "${movieTitle}" was removed from CineBook by ${modName}.`,
        userId: target.userId,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/movies/${target.movieId}`,
        status: 'sent',
      });
    }

    // 2. Notify other staff
    const otherStaff = getUsers().filter(u =>
      (u.role === 'admin' || u.role === 'cinemaManager') && (!mod || u.id !== mod.id)
    );
    otherStaff.forEach(staff => {
      saveNotification({
        id: `n_staff_del_${Date.now()}_${staff.id}`,
        type: 'content_update',
        title: 'Review Deleted',
        message: `${modName} deleted a review for "${movieTitle}" (author: ${target.userName}).`,
        userId: staff.id,
        read: false,
        createdAt: new Date().toISOString(),
        link: `/manage/movies`,
        status: 'sent',
      });
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cinebook:notifications_updated'));
    }
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
    promotionApi.updatePromotion(promo.id, promo).catch(err =>
      console.warn('API updatePromotion sync failed, changes kept locally:', err)
    );
  } else {
    promos.push(promo);
    promotionApi.createPromotion(promo).catch(err =>
      console.warn('API createPromotion sync failed, changes kept locally:', err)
    );
  }
  write(KEYS.promotions, promos);
}

export function deletePromotion(id: string): void {
  write(KEYS.promotions, getPromotions().filter(p => p.id !== id));
  promotionApi.deletePromotion(id).catch(err =>
    console.warn('API deletePromotion sync failed, deletion kept locally:', err)
  );
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

// Wishlist
export function getWishlist(userId: string): string[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.wishlist) || '{}');
    return all[userId] || [];
  } catch {
    return [];
  }
}

export function isMovieWishlisted(userId: string, movieId: string): boolean {
  return getWishlist(userId).includes(movieId);
}

export function toggleWishlist(userId: string, movieId: string): boolean {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.wishlist) || '{}');
    const list: string[] = all[userId] || [];
    const idx = list.indexOf(movieId);
    let wishlisted = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      wishlisted = false;
    } else {
      list.push(movieId);
      wishlisted = true;
    }
    all[userId] = list;
    localStorage.setItem(KEYS.wishlist, JSON.stringify(all));
    return wishlisted;
  } catch {
    return false;
  }
}

// Personalized Movie Recommendations Engine
export function getPersonalizedRecommendations(userId: string): MovieRecommendation[] {
  const userBookings = getUserBookings(userId).filter(b => b.status === 'confirmed');
  const allMovies = getMovies();

  if (userBookings.length === 0) {
    return allMovies
      .slice(0, 5)
      .map(movie => ({
        movie,
        score: Math.round(85 + (movie.rating / 10) * 12),
        reason: 'Trending CineBook Community Favorite',
      }));
  }

  const genreWeights: Record<string, number> = {};
  const directorWeights: Record<string, number> = {};

  userBookings.forEach(b => {
    const movie = getMovie(b.movieId);
    if (movie) {
      movie.genre.forEach(g => {
        genreWeights[g] = (genreWeights[g] || 0) + 1;
      });
      if (movie.director) {
        directorWeights[movie.director] = (directorWeights[movie.director] || 0) + 1;
      }
    }
  });

  const scored: MovieRecommendation[] = allMovies.map(movie => {
    let rawScore = 60;
    const matchedGenres: string[] = [];

    movie.genre.forEach(g => {
      if (genreWeights[g]) {
        rawScore += genreWeights[g] * 15;
        matchedGenres.push(g);
      }
    });

    if (movie.director && directorWeights[movie.director]) {
      rawScore += directorWeights[movie.director] * 20;
    }

    rawScore += (movie.rating / 10) * 15;
    const finalScore = Math.min(99, Math.round(rawScore));

    let reason = 'Personalized Selection';
    if (matchedGenres.length > 0) {
      reason = `${finalScore}% Match • Because you love ${matchedGenres.slice(0, 2).join(' & ')}`;
    } else if (movie.featured) {
      reason = `${finalScore}% Match • Featured Blockbuster`;
    }

    return {
      movie,
      score: finalScore,
      reason,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

// Waitlist System for Sold-Out Showtimes
export interface WaitlistEntry {
  id: string;
  showtimeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export function getWaitlist(showtimeId: string): WaitlistEntry[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.waitlists) || '{}');
    return all[showtimeId] || [];
  } catch {
    return [];
  }
}

export function joinWaitlist(showtimeId: string, user: { id: string; name: string; email: string }): boolean {
  try {
    const all = JSON.parse(localStorage.getItem(KEYS.waitlists) || '{}');
    const list: WaitlistEntry[] = all[showtimeId] || [];
    if (list.some(e => e.userId === user.id)) return false;
    list.push({
      id: `wl_${Date.now()}`,
      showtimeId,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
    });
    all[showtimeId] = list;
    localStorage.setItem(KEYS.waitlists, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}


