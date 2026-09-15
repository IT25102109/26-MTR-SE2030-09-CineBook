import type { Movie, Branch, Showtime, Booking, User, Notification, NotificationTemplate } from '@/types';

export const mockMovies: Movie[] = [
  {
    id: 'm1',
    title: 'Dune: Part Two',
    synopsis: 'Paul Atreides unites with the Fremen while seeking revenge against the conspirators who destroyed his family. Balancing love against the fate of the known universe, he must prevent a terrible future only he can foresee.',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbL972k74zp9rnm7Oipsn.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    duration: 166,
    rating: 8.7,
    certification: 'PG-13',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
    releaseDate: '2024-03-01',
    status: 'now-showing',
    featured: true,
    trailerUrl: '#',
  },
  {
    id: 'm2',
    title: 'Oppenheimer',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykQ5L8kR6qVr3.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/rLb2cwH3nZJ2xgKqGw5Ov9mF5m5.jpg',
    genre: ['Drama', 'History', 'Thriller'],
    language: 'English',
    duration: 180,
    rating: 8.4,
    certification: 'R',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    releaseDate: '2024-02-15',
    status: 'now-showing',
    featured: true,
    trailerUrl: '#',
  },
  {
    id: 'm3',
    title: 'Poor Things',
    synopsis: 'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.',
    poster: 'https://image.tmdb.org/t/p/w500/kCGlIMxk5tnXuIMiqU8Lfxd3AF2.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/dWQ6UjBuHtcTTZmQ3BzbiqQfdSK.jpg',
    genre: ['Comedy', 'Drama', 'Romance'],
    language: 'English',
    duration: 141,
    rating: 7.9,
    certification: 'R',
    director: 'Yorgos Lanthimos',
    cast: ['Emma Stone', 'Mark Ruffalo', 'Willem Dafoe', 'Ramy Youssef'],
    releaseDate: '2024-01-12',
    status: 'now-showing',
    featured: false,
    trailerUrl: '#',
  },
  {
    id: 'm4',
    title: 'The Holdovers',
    synopsis: 'A curmudgeonly instructor at a prep school remains on campus over the holidays with a troubled student and the school\'s head cook, forming an unlikely bond.',
    poster: 'https://image.tmdb.org/t/p/w500/VkOIHCd1x16dfJOZc2KU3RXKfc.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/9cBftliS61B2AXmxygOZx6t3EQ4.jpg',
    genre: ['Comedy', 'Drama'],
    language: 'English',
    duration: 133,
    rating: 7.8,
    certification: 'R',
    director: 'Alexander Payne',
    cast: ['Paul Giamatti', 'Da\'Vine Joy Randolph', 'Dominic Sessa'],
    releaseDate: '2024-02-20',
    status: 'now-showing',
    featured: false,
    trailerUrl: '#',
  },
  {
    id: 'm5',
    title: 'Killers of the Flower Moon',
    synopsis: 'When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one—until the FBI steps in to unravel the mystery.',
    poster: 'https://image.tmdb.org/t/p/w500/dVF2Y5f5jJyn9OWZk79Q4R5lTNg.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/slEz1yi1o1rZc7N9Ry2jvEh3y0R.jpg',
    genre: ['Crime', 'Drama', 'History'],
    language: 'English',
    duration: 206,
    rating: 7.6,
    certification: 'R',
    director: 'Martin Scorsese',
    cast: ['Leonardo DiCaprio', 'Robert De Niro', 'Lily Gladstone'],
    releaseDate: '2024-02-08',
    status: 'now-showing',
    featured: false,
    trailerUrl: '#',
  },
  {
    id: 'm6',
    title: 'Furiosa: A Mad Max Saga',
    synopsis: 'The origin story of renegade warrior Furiosa, who is kidnapped by the great biker horde led by warlord Dementus and must survive many trials as she finds her way home.',
    poster: 'https://image.tmdb.org/t/p/w500/iVIDYnJhjOIUIFpfcRyJqGnQRHM.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/dlMXJzaxXQYKy5qOfQ5k5f93uF8.jpg',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    language: 'English',
    duration: 148,
    rating: 7.5,
    certification: 'R',
    director: 'George Miller',
    cast: ['Anya Taylor-Joy', 'Chris Hemsworth', 'Tom Burke'],
    releaseDate: '2024-05-15',
    status: 'coming-soon',
    featured: true,
    trailerUrl: '#',
  },
  {
    id: 'm7',
    title: 'Civil War',
    synopsis: 'A team of journalists travel across a fractured America in the midst of a civil war that has engulfed the entire country.',
    poster: 'https://image.tmdb.org/t/p/w500/f7UUHZMUM3jIoiV2q2xOf4RQfS.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/5eQSWBT2jBJTt4Q6Rf7R1sX4R8t.jpg',
    genre: ['Action', 'Drama', 'Thriller'],
    language: 'English',
    duration: 109,
    rating: 7.2,
    certification: 'R',
    director: 'Alex Garland',
    cast: ['Kirsten Dunst', 'Wagner Moura', 'Cailee Spaeny'],
    releaseDate: '2024-04-12',
    status: 'coming-soon',
    featured: false,
    trailerUrl: '#',
  },
  {
    id: 'm8',
    title: 'Challengers',
    synopsis: 'Tashi, a former tennis prodigy turned coach, has taken her husband and transformed him from a mediocre player into a Grand Slam champion. To overcome a losing streak, he needs to face his former best friend and Tashi\'s ex-boyfriend.',
    poster: 'https://image.tmdb.org/t/p/w500/HwjGBDxIe7cKnxvk6CDPevAUvm7.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/9PSu4tUyfSD4grSc4xqhgS1Bk5o.jpg',
    genre: ['Drama', 'Romance', 'Sport'],
    language: 'English',
    duration: 131,
    rating: 7.1,
    certification: 'R',
    director: 'Luca Guadagnino',
    cast: ['Zendaya', 'Mike Faist', 'Josh O\'Connor'],
    releaseDate: '2024-04-26',
    status: 'coming-soon',
    featured: false,
    trailerUrl: '#',
  },
];

export const mockBranches: Branch[] = [
  {
    id: 'b1',
    name: 'CineBook Downtown',
    city: 'New York',
    address: '123 Broadway, New York, NY 10001',
    halls: [
      { id: 'h1', name: 'Hall A — IMAX', rows: 10, seatsPerRow: 16, premiumRows: 2 },
      { id: 'h2', name: 'Hall B — Standard', rows: 8, seatsPerRow: 12, premiumRows: 2 },
      { id: 'h3', name: 'Hall C — Recliner', rows: 6, seatsPerRow: 10, premiumRows: 3 },
    ],
  },
  {
    id: 'b2',
    name: 'CineBook Westside',
    city: 'Los Angeles',
    address: '456 Sunset Blvd, Los Angeles, CA 90028',
    halls: [
      { id: 'h4', name: 'Hall A — Dolby Atmos', rows: 10, seatsPerRow: 14, premiumRows: 2 },
      { id: 'h5', name: 'Hall B — Standard', rows: 8, seatsPerRow: 12, premiumRows: 2 },
    ],
  },
  {
    id: 'b3',
    name: 'CineBook Lakeside',
    city: 'Chicago',
    address: '789 Navy Pier, Chicago, IL 60611',
    halls: [
      { id: 'h6', name: 'Hall A — IMAX', rows: 10, seatsPerRow: 16, premiumRows: 2 },
      { id: 'h7', name: 'Hall B — Standard', rows: 8, seatsPerRow: 12, premiumRows: 2 },
      { id: 'h8', name: 'Hall C — VIP', rows: 6, seatsPerRow: 8, premiumRows: 3 },
    ],
  },
];

function generateShowtimes(): Showtime[] {
  const showtimes: Showtime[] = [];
  const nowShowing = mockMovies.filter(m => m.status === 'now-showing');
  const times = ['10:00 AM', '1:15 PM', '4:30 PM', '7:00 PM', '10:15 PM'];
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  let id = 1;
  nowShowing.forEach(movie => {
    mockBranches.forEach(branch => {
      branch.halls.forEach(hall => {
        const date = dates[Math.floor(Math.random() * dates.length)];
        const time = times[Math.floor(Math.random() * times.length)];
        const bookedSeats: string[] = [];
        const totalSeats = hall.rows * hall.seatsPerRow;
        const bookedCount = Math.floor(Math.random() * totalSeats * 0.4);
        for (let i = 0; i < bookedCount; i++) {
          const row = String.fromCharCode(65 + Math.floor(Math.random() * hall.rows));
          const seat = Math.floor(Math.random() * hall.seatsPerRow) + 1;
          const seatId = `${row}${seat}`;
          if (!bookedSeats.includes(seatId)) bookedSeats.push(seatId);
        }
        showtimes.push({
          id: `s${id++}`,
          movieId: movie.id,
          branchId: branch.id,
          hallId: hall.id,
          date,
          time,
          basePrice: 14.99,
          premiumPrice: 22.99,
          bookedSeats,
        });
      });
    });
  });

  return showtimes;
}

export const mockShowtimes: Showtime[] = generateShowtimes();

export const mockBookings: Booking[] = [
  {
    id: 'bk1',
    userId: 'u1',
    movieId: 'm1',
    movieTitle: 'Dune: Part Two',
    moviePoster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbL972k74zp9rnm7Oipsn.jpg',
    branchId: 'b1',
    branchName: 'CineBook Downtown',
    hallName: 'Hall A — IMAX',
    showtimeId: 's1',
    date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    time: '7:00 PM',
    seats: ['F5', 'F6'],
    totalAmount: 29.98,
    status: 'confirmed',
    refundStatus: 'none',
    bookingDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'bk2',
    userId: 'u1',
    movieId: 'm2',
    movieTitle: 'Oppenheimer',
    moviePoster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykQ5L8kR6qVr3.jpg',
    branchId: 'b1',
    branchName: 'CineBook Downtown',
    hallName: 'Hall B — Standard',
    showtimeId: 's5',
    date: '2024-02-10',
    time: '4:30 PM',
    seats: ['C3', 'C4', 'C5'],
    totalAmount: 44.97,
    status: 'cancelled',
    refundStatus: 'processed',
    bookingDate: '2024-01-20',
  },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Carter', email: 'alex@cinebook.com', role: 'customer', avatarColor: '#F5C518' },
  { id: 'u2', name: 'Jordan Lee', email: 'jordan@cinebook.com', role: 'cinemaManager', avatarColor: '#E50914' },
  { id: 'u3', name: 'Sam Rivera', email: 'sam@cinebook.com', role: 'admin', avatarColor: '#3B82F6' },
];

export const mockAdminUsers: User[] = [
  { id: 'u1', name: 'Alex Carter', email: 'alex@cinebook.com', role: 'customer', avatarColor: '#F5C518' },
  { id: 'u2', name: 'Jordan Lee', email: 'jordan@cinebook.com', role: 'cinemaManager', avatarColor: '#E50914' },
  { id: 'u3', name: 'Sam Rivera', email: 'sam@cinebook.com', role: 'admin', avatarColor: '#3B82F6' },
  { id: 'u4', name: 'Taylor Swift', email: 'taylor@cinebook.com', role: 'customer', avatarColor: '#10B981' },
  { id: 'u5', name: 'Morgan Freeman', email: 'morgan@cinebook.com', role: 'customer', avatarColor: '#F97316' },
  { id: 'u6', name: 'Casey Nguyen', email: 'casey@cinebook.com', role: 'cinemaManager', avatarColor: '#8B5CF6' },
  { id: 'u7', name: 'Riley Patel', email: 'riley@cinebook.com', role: 'customer', avatarColor: '#EC4899' },
  { id: 'u8', name: 'Jamie Chen', email: 'jamie@cinebook.com', role: 'admin', avatarColor: '#06B6D4' },
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'booking_confirmation',
    title: 'Booking Confirmed',
    message: 'Your booking for Dune: Part Two at CineBook Downtown has been confirmed. 2 seats: F5, F6.',
    userId: 'u1',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    link: '/ticket/bk1',
  },
  {
    id: 'n2',
    type: 'showtime_reminder',
    title: 'Showtime Tomorrow',
    message: 'Reminder: Dune: Part Two is tomorrow at 7:00 PM at CineBook Downtown, Hall A — IMAX.',
    userId: 'u1',
    read: false,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    link: '/ticket/bk1',
  },
  {
    id: 'n3',
    type: 'cancellation_refund',
    title: 'Refund Processed',
    message: 'Your refund of $44.97 for Oppenheimer has been processed to your original payment method.',
    userId: 'u1',
    read: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'n4',
    type: 'system_announcement',
    title: 'Welcome to CineBook',
    message: 'Thank you for joining CineBook! Enjoy premium cinema booking with IMAX, Dolby Atmos, and VIP recliner halls.',
    userId: 'u1',
    read: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    audience: 'all',
    createdBy: 'u3',
    status: 'read',
  },
  {
    id: 'n5',
    type: 'new_booking',
    title: 'New Booking Alert',
    message: 'New booking for Dune: Part Two at CineBook Downtown, Hall A — IMAX. 2 seats booked.',
    userId: 'u2',
    read: false,
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'n6',
    type: 'low_availability',
    title: 'Low Seat Availability',
    message: 'Hall A — IMAX, 7:00 PM show is 90% booked. Only 6 seats remaining.',
    userId: 'u2',
    read: false,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'n7',
    type: 'cancellation_refund',
    title: 'Booking Cancelled',
    message: 'A booking for Oppenheimer at CineBook Downtown has been cancelled. Refund pending.',
    userId: 'u2',
    read: true,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'n8',
    type: 'system_announcement',
    title: 'Platform Maintenance',
    message: 'Scheduled maintenance on Sept 15, 2:00 AM - 4:00 AM EST. Booking will be temporarily unavailable.',
    userId: 'u2',
    read: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    audience: 'all',
    createdBy: 'u3',
    status: 'read',
  },
  {
    id: 'n9',
    type: 'revenue_milestone',
    title: 'Revenue Milestone Reached',
    message: 'CineBook Downtown has crossed $50,000 in monthly revenue. Great work!',
    userId: 'u3',
    read: false,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'n10',
    type: 'user_registration',
    title: 'New User Registration',
    message: 'Riley Patel (riley@cinebook.com) has registered as a Customer.',
    userId: 'u3',
    read: false,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'n11',
    type: 'system_announcement',
    title: 'High Traffic Alert',
    message: 'Platform experiencing higher than usual traffic. All systems operational.',
    userId: 'u3',
    read: true,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    audience: 'all',
    createdBy: 'u3',
    status: 'read',
  },
  {
    id: 'n12',
    type: 'price_alert',
    title: 'Price Drop Alert',
    message: 'Tickets for Poor Things at CineBook Lakeside are now $9.99. Limited time offer!',
    userId: 'u1',
    read: false,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    link: '/movies/m3',
  },
  {
    id: 'n13',
    type: 'low_availability',
    title: 'Low Seat Availability',
    message: 'Hall A — IMAX, 10:00 AM show is 85% booked. Only 8 seats remaining.',
    userId: 'u3',
    read: true,
    createdAt: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
  {
    id: 'n14',
    type: 'scheduling_conflict',
    title: 'Scheduling Conflict Warning',
    message: 'Two showtimes overlap in Hall B — Standard at CineBook Westside. Please review.',
    userId: 'u2',
    read: true,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    link: '/manage/showtimes',
  },
];

export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'tpl1',
    type: 'booking_confirmation',
    title: 'Booking Confirmed',
    message: 'Your booking for {{movie}} at {{branch}} has been confirmed. {{seats}} seats: {{seatList}}.',
  },
  {
    id: 'tpl2',
    type: 'cancellation_refund',
    title: 'Booking Cancelled',
    message: 'Your booking for {{movie}} has been cancelled. A refund of {{amount}} will be processed.',
  },
  {
    id: 'tpl3',
    type: 'showtime_reminder',
    title: 'Showtime Reminder',
    message: 'Reminder: {{movie}} is {{timeHint}} at {{branch}}, {{hall}}.',
  },
  {
    id: 'tpl4',
    type: 'price_alert',
    title: 'Price Drop Alert',
    message: 'Tickets for {{movie}} at {{branch}} are now {{price}}. Limited time offer!',
  },
  {
    id: 'tpl5',
    type: 'system_announcement',
    title: 'System Announcement',
    message: '{{message}}',
  },
  {
    id: 'tpl6',
    type: 'low_availability',
    title: 'Low Seat Availability',
    message: '{{hall}}, {{time}} show is {{percent}}% booked. Only {{remaining}} seats remaining.',
  },
];
