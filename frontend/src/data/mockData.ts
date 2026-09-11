import type { Movie, CinemaBranch, CinemaHall, Showtime, AppUser } from '@/types';

export const branches: CinemaBranch[] = [
  { id: 'b1', name: 'CineBook Downtown', city: 'New York', address: '120 Broadway, New York, NY' },
  { id: 'b2', name: 'CineBook Westside', city: 'Los Angeles', address: '450 Melrose Ave, Los Angeles, CA' },
  { id: 'b3', name: 'CineBook Lakeshore', city: 'Chicago', address: '600 N Michigan Ave, Chicago, IL' },
  { id: 'b4', name: 'CineBook Mission', city: 'San Francisco', address: '2299 Mission St, San Francisco, CA' },
];

export const halls: CinemaHall[] = [
  { id: 'h1', branchId: 'b1', name: 'Hall A — IMAX', rows: 10, cols: 14, premiumRows: 3 },
  { id: 'h2', branchId: 'b1', name: 'Hall B — Standard', rows: 8, cols: 12, premiumRows: 2 },
  { id: 'h3', branchId: 'b2', name: 'Hall A — Dolby', rows: 10, cols: 14, premiumRows: 3 },
  { id: 'h4', branchId: 'b2', name: 'Hall B — Standard', rows: 8, cols: 12, premiumRows: 2 },
  { id: 'h5', branchId: 'b3', name: 'Hall A — IMAX', rows: 10, cols: 14, premiumRows: 3 },
  { id: 'h6', branchId: 'b4', name: 'Hall A — Dolby', rows: 9, cols: 13, premiumRows: 2 },
];

export const users: AppUser[] = [
  { id: 'u1', name: 'Alex Carter', email: 'alex@example.com', role: 'customer', status: 'active', joinedAt: '2025-03-12' },
  { id: 'u2', name: 'Jordan Lee', email: 'jordan@example.com', role: 'customer', status: 'active', joinedAt: '2025-04-02' },
  { id: 'u3', name: 'Sam Rivera', email: 'sam@example.com', role: 'customer', status: 'active', joinedAt: '2025-05-18' },
  { id: 'u4', name: 'Taylor Quinn', email: 'taylor@example.com', role: 'customer', status: 'suspended', joinedAt: '2025-01-22' },
  { id: 'u5', name: 'Manager Blake', email: 'blake@example.com', role: 'manager', branchId: 'b1', status: 'active', joinedAt: '2024-11-05' },
  { id: 'u6', name: 'Admin Casey', email: 'casey@example.com', role: 'admin', status: 'active', joinedAt: '2024-08-15' },
];

const POSTER = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop`;
const BACKDROP = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600&h=800&fit=crop`;

export const movies: Movie[] = [
  {
    id: 'm1',
    title: 'Stellar Horizon',
    synopsis:
      'When a deep-space crew discovers a derelict station at the edge of the galaxy, they must unravel a mystery that could rewrite the fate of humanity.',
    cast: ['Ava Sinclair', 'Marcus Cole', 'Lena Voss', 'Theo Park'],
    director: 'D. R. Maren',
    genres: ['Sci-Fi', 'Thriller'],
    language: 'English',
    rating: 8.7,
    durationMin: 142,
    releaseDate: '2026-07-03',
    posterUrl: POSTER('72310'),
    backdropUrl: BACKDROP('72310'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'm2',
    title: 'Midnight in Marrakech',
    synopsis:
      'A retired thief is pulled back into the underworld for one last job through the winding alleys and vibrant souks of Marrakech.',
    cast: ['Yasmin Hale', 'Omar Faruk', 'Clara Mendez'],
    director: 'P. Castellano',
    genres: ['Action', 'Crime'],
    language: 'English',
    rating: 8.1,
    durationMin: 118,
    releaseDate: '2026-07-19',
    posterUrl: POSTER('33134'),
    backdropUrl: BACKDROP('33134'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'm3',
    title: 'The Last Lighthouse',
    synopsis:
      'A lighthouse keeper on a remote island confronts a haunting presence that arrives with every storm, blurring the line between memory and reality.',
    cast: ['Eleanor Frost', 'Henry Vale'],
    director: 'G. Whitmore',
    genres: ['Drama', 'Mystery'],
    language: 'English',
    rating: 7.9,
    durationMin: 104,
    releaseDate: '2026-06-21',
    posterUrl: POSTER('269320'),
    backdropUrl: BACKDROP('269320'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'now_showing',
    featured: false,
  },
  {
    id: 'm4',
    title: 'Neon Pulse',
    synopsis:
      'In a neon-drenched megacity, a street musician discovers a sound that can alter reality — and a corporation that will kill to control it.',
    cast: ['Kai Tanaka', 'Ria Solis', 'Dex Romero'],
    director: 'M. Ito',
    genres: ['Sci-Fi', 'Action'],
    language: 'English',
    rating: 8.4,
    durationMin: 127,
    releaseDate: '2026-07-28',
    posterUrl: POSTER('305236'),
    backdropUrl: BACKDROP('305236'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'now_showing',
    featured: true,
  },
  {
    id: 'm5',
    title: 'Paper Cranes',
    synopsis:
      'Two strangers meet in a Tokyo paper-folding class and spend a year folding a thousand cranes, each one carrying a wish they cannot say aloud.',
    cast: ['Mei Aoki', 'Ren Sato'],
    director: 'H. Nakamura',
    genres: ['Romance', 'Drama'],
    language: 'Japanese',
    rating: 8.0,
    durationMin: 96,
    releaseDate: '2026-08-02',
    posterUrl: POSTER('3617500'),
    backdropUrl: BACKDROP('3617500'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'now_showing',
    featured: false,
  },
  {
    id: 'm6',
    title: 'Glacier',
    synopsis:
      'A glaciologist races against a collapsing ice shelf to recover data that could save millions — and confronts a truth buried in the ice.',
    cast: ['Nora Berg', 'Ivan Petrov'],
    director: 'S. Halvorsen',
    genres: ['Adventure', 'Thriller'],
    language: 'English',
    rating: 7.6,
    durationMin: 112,
    releaseDate: '2026-06-14',
    posterUrl: POSTER('2387873'),
    backdropUrl: BACKDROP('2387873'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'now_showing',
    featured: false,
  },
  {
    id: 'm7',
    title: 'The Cartographer',
    synopsis:
      'A reclusive mapmaker is hired to chart a forest that appears on no map, and discovers it changes shape to match whoever walks it.',
    cast: ['Owen Drake', 'Priya Nair'],
    director: 'L. Fontaine',
    genres: ['Fantasy', 'Adventure'],
    language: 'English',
    rating: 8.2,
    durationMin: 134,
    releaseDate: '2026-09-12',
    posterUrl: POSTER('2387873'),
    backdropUrl: BACKDROP('2387873'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'coming_soon',
    featured: false,
  },
  {
    id: 'm8',
    title: 'Echoes of Tomorrow',
    synopsis:
      'A physicist receives messages from her future self and must decide which warnings to heed and which futures to let unfold.',
    cast: ['Dr. Mira Shah', 'Eli Cross'],
    director: 'A. Okonkwo',
    genres: ['Sci-Fi', 'Drama'],
    language: 'English',
    rating: 8.5,
    durationMin: 129,
    releaseDate: '2026-09-25',
    posterUrl: POSTER('2150'),
    backdropUrl: BACKDROP('2150'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'coming_soon',
    featured: false,
  },
  {
    id: 'm9',
    title: 'Wildfire Season',
    synopsis:
      'A smokejumper returns to her hometown as a record fire season threatens everything she left behind.',
    cast: ['Dana Cole', 'Marcus Reyes'],
    director: 'T. Brooks',
    genres: ['Drama', 'Action'],
    language: 'English',
    rating: 7.8,
    durationMin: 108,
    releaseDate: '2026-10-03',
    posterUrl: POSTER('269320'),
    backdropUrl: BACKDROP('269320'),
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    status: 'coming_soon',
    featured: false,
  },
];

const today = new Date();
const dateStr = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const showtimes: Showtime[] = [
  { id: 's1', movieId: 'm1', branchId: 'b1', hallId: 'h1', date: dateStr(0), time: '14:00', price: 14.5, premiumPrice: 19.5, bookedSeats: ['A1', 'A2', 'F5', 'F6', 'G7'] },
  { id: 's2', movieId: 'm1', branchId: 'b1', hallId: 'h1', date: dateStr(0), time: '18:30', price: 16.5, premiumPrice: 22.0, bookedSeats: ['B3', 'C4', 'D5'] },
  { id: 's3', movieId: 'm1', branchId: 'b2', hallId: 'h3', date: dateStr(0), time: '16:00', price: 15.0, premiumPrice: 20.0, bookedSeats: ['A1', 'A2', 'A3'] },
  { id: 's4', movieId: 'm2', branchId: 'b1', hallId: 'h2', date: dateStr(0), time: '15:15', price: 12.0, premiumPrice: 16.0, bookedSeats: ['E5', 'E6'] },
  { id: 's5', movieId: 'm2', branchId: 'b3', hallId: 'h5', date: dateStr(0), time: '19:00', price: 13.5, premiumPrice: 18.0, bookedSeats: [] },
  { id: 's6', movieId: 'm3', branchId: 'b1', hallId: 'h2', date: dateStr(0), time: '13:00', price: 11.0, premiumPrice: 15.0, bookedSeats: ['C1', 'C2', 'C3', 'C4'] },
  { id: 's7', movieId: 'm4', branchId: 'b2', hallId: 'h3', date: dateStr(0), time: '17:45', price: 14.0, premiumPrice: 19.0, bookedSeats: ['A1', 'B1', 'C1'] },
  { id: 's8', movieId: 'm4', branchId: 'b4', hallId: 'h6', date: dateStr(0), time: '20:00', price: 14.0, premiumPrice: 19.0, bookedSeats: ['D4', 'D5', 'D6'] },
  { id: 's9', movieId: 'm5', branchId: 'b1', hallId: 'h2', date: dateStr(1), time: '14:30', price: 10.5, premiumPrice: 14.5, bookedSeats: [] },
  { id: 's10', movieId: 'm6', branchId: 'b3', hallId: 'h5', date: dateStr(1), time: '16:30', price: 12.5, premiumPrice: 17.0, bookedSeats: ['A1', 'A2'] },
  { id: 's11', movieId: 'm1', branchId: 'b1', hallId: 'h1', date: dateStr(1), time: '19:00', price: 16.5, premiumPrice: 22.0, bookedSeats: ['F1', 'F2', 'F3', 'G4'] },
  { id: 's12', movieId: 'm2', branchId: 'b2', hallId: 'h4', date: dateStr(2), time: '15:00', price: 12.0, premiumPrice: 16.0, bookedSeats: [] },
];

export const seedBookings = [
  {
    id: 'bk-seed-1',
    userId: 'demo',
    movieId: 'm3',
    showtimeId: 's6',
    branchId: 'b1',
    hallId: 'h2',
    seats: ['D6', 'D7'],
    date: dateStr(-3),
    time: '13:00',
    subtotal: 22.0,
    fees: 3.0,
    total: 25.0,
    status: 'confirmed' as const,
    refundStatus: 'none' as const,
    bookedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    paymentMethod: 'Visa •••• 4242',
  },
];
