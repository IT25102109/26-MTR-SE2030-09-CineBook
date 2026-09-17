import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Film, Play, ChevronLeft, MapPin, X, MessageSquare, ThumbsUp, Send, User } from 'lucide-react';
import { getMovie, getShowtimesByMovie, getBranches, getBranch, getMovieReviews, saveReview } from '@/data/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { MovieReview } from '@/types';

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { toast } = useToast();

  const movie = useMemo(() => id ? getMovie(id) : undefined, [id]);
  const showtimes = useMemo(() => id ? getShowtimesByMovie(id) : [], [id]);
  const branches = useMemo(() => getBranches(), []);

  const [selectedBranch, setSelectedBranch] = useState<string>(branches[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [reviewTick, setReviewTick] = useState(0);

  const reviews = useMemo(() => id ? getMovieReviews(id) : [], [id, reviewTick]);


  const dates = useMemo(() => {
    const set = new Set(showtimes.map(s => s.date));
    return Array.from(set).sort();
  }, [showtimes]);

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(s => {
      if (selectedBranch && s.branchId !== selectedBranch) return false;
      if (selectedDate && s.date !== selectedDate) return false;
      return true;
    });
  }, [showtimes, selectedBranch, selectedDate]);

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display mb-4">Movie not found</h1>
        <Link to="/movies"><Button>Browse Movies</Button></Link>
      </div>
    );
  }

  const branchShowtimes = filteredShowtimes.reduce((acc, s) => {
    const key = s.branchId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, typeof showtimes>);

  const getEmbedUrl = (url?: string) => {
    if (!url || url === '#') {
      return 'https://www.youtube-nocookie.com/embed/Way9Dexny3w?autoplay=1';
    }
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1` : url;
  };

  const handleOpenReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!movie) return;
    if (!newComment.trim()) {
      toast('error', 'Please enter your review text');
      return;
    }

    const reviewerName = user ? user.name : (authorName.trim() || 'Verified Moviegoer');
    const reviewerId = user ? user.id : `guest_${Date.now()}`;

    const review: MovieReview = {
      id: `rev_${Date.now()}`,
      movieId: movie.id,
      userId: reviewerId,
      userName: reviewerName,
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'approved',
    };

    saveReview(review);
    setNewComment('');
    setNewRating(5);
    setAuthorName('');
    setIsReviewModalOpen(false);
    setReviewTick(t => t + 1);
    toast('success', 'Thank you! Your review has been published.');
  };

  return (
    <div>
      {/* Hero backdrop */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-base via-cinema-base/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-base/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <Link to="/movies" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to Movies
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-40 sm:w-52 mx-auto md:mx-0">
            <div className="rounded-2xl overflow-hidden shadow-soft-xl hairline">
              <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant={movie.status === 'now-showing' ? 'green' : 'blue'}>
                {movie.status === 'now-showing' ? 'Now Showing' : 'Coming Soon'}
              </Badge>
              <Badge variant="amber"><Star className="w-3 h-3 fill-accent-primary text-accent-primary" />{movie.rating}</Badge>
              <Badge variant="outline">{movie.certification}</Badge>
            </div>

            <h1 className="text-display font-display font-bold mb-3">{movie.title}</h1>

            <div className="flex items-center gap-4 text-sm text-text-secondary mb-5 flex-wrap">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{movie.duration} min</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span className="flex items-center gap-1.5"><Film className="w-4 h-4" />{movie.language}</span>
            </div>

            <p className="text-text-secondary leading-relaxed mb-6 max-w-2xl">{movie.synopsis}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-xl">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Director</p>
                <p className="text-sm font-medium">{movie.director}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Cast</p>
                <p className="text-sm font-medium">{movie.cast.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Genres</p>
                <div className="flex gap-1.5 flex-wrap">
                  {movie.genre.map(g => <Badge key={g} variant="default">{g}</Badge>)}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="lg" onClick={() => setIsTrailerOpen(true)}>
                <Play className="w-4 h-4 fill-current" /> Watch Trailer
              </Button>
              {movie.status === 'now-showing' && (
                <Button size="lg" variant="outline" onClick={() => document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' })}>
                  Book Now
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Showtimes */}
        {movie.status === 'now-showing' && (
          <section id="showtimes" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-display font-bold mb-6">Showtimes</h2>

            <Card className="p-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">Select Cinema</label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedBranch('')}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all ${!selectedBranch ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'border-cinema-border text-text-secondary hover:text-text-primary hover:bg-cinema-elevated'}`}
                    >
                      All Cinemas
                    </button>
                    {branches.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBranch(b.id)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all ${selectedBranch === b.id ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'border-cinema-border text-text-secondary hover:text-text-primary hover:bg-cinema-elevated'}`}
                      >
                        {b.name.replace('CineBook ', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-2 block">Select Date</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => setSelectedDate('')}
                      className={`px-3 py-2 rounded-lg text-sm border transition-all whitespace-nowrap ${!selectedDate ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'border-cinema-border text-text-secondary hover:text-text-primary hover:bg-cinema-elevated'}`}
                    >
                      All Dates
                    </button>
                    {dates.map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all whitespace-nowrap ${selectedDate === d ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'border-cinema-border text-text-secondary hover:text-text-primary hover:bg-cinema-elevated'}`}
                      >
                        {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-6">
              {Object.entries(branchShowtimes).length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-text-muted">No showtimes match your selection.</p>
                </Card>
              ) : (
                Object.entries(branchShowtimes).map(([branchId, shows]) => {
                  const branch = getBranch(branchId);
                  if (!branch) return null;
                  return (
                    <Card key={branchId} className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-accent-primary" />
                        <h3 className="font-display font-semibold">{branch.name}</h3>
                        <span className="text-sm text-text-muted">{branch.city}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {shows.map(s => {
                          const hall = branch.halls.find(h => h.id === s.hallId);
                          return (
                            <button
                              key={s.id}
                              onClick={() => navigate(`/booking/${s.id}`)}
                              className="group flex flex-col p-4 rounded-xl bg-cinema-elevated border border-white/5 hover:border-accent-primary/30 hover:bg-cinema-border transition-all text-left"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-display font-semibold text-lg">{s.time}</span>
                                <span className="text-xs text-text-muted">{hall?.name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary">
                                  {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-sm font-medium text-accent-primary">${s.basePrice}</span>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/5">
                                <span className="text-xs text-text-muted group-hover:text-accent-primary transition-colors">
                                  {hall && hall.rows * hall.seatsPerRow - s.bookedSeats.length} seats available →
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        <section className="mt-16 border-t border-cinema-border pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold">Audience Reviews & Ratings</h2>
              <p className="text-sm text-text-secondary mt-1">Verified audience opinions and community impressions</p>
            </div>
            <Button onClick={handleOpenReviewModal} className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Write a Review
            </Button>
          </div>

          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-text-muted">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No reviews yet for this movie. Be the first to share your thoughts!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <Card key={r.id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold text-xs">
                          {r.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.userName}</p>
                          <p className="text-xs text-text-muted">{r.createdAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-accent-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-accent-primary' : 'text-text-muted opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{r.comment}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-cinema-border flex items-center gap-2 text-xs text-text-muted">
                    <ThumbsUp className="w-3 h-3" /> Helpful review
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Video Trailer Modal */}
        <Modal open={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} title={`${movie.title} — Official Trailer`}>
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
            {isTrailerOpen && (
              <iframe
                src={getEmbedUrl(movie.trailerUrl)}
                title={`${movie.title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </Modal>

        {/* Submit Review Modal */}
        <Modal open={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Review "${movie.title}"`}>
          <div className="space-y-4">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-cinema-elevated hairline">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                    style={{ backgroundColor: user.avatarColor || '#E5A93C' }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block">Posting review as</span>
                    <span className="text-xs font-semibold text-text-primary">{user.name}</span>
                  </div>
                </div>
                <Badge variant="amber" className="text-[10px] capitalize">{user.role}</Badge>
              </div>
            ) : (
              <div className="space-y-1.5 p-3 rounded-xl bg-cinema-elevated hairline">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary font-medium">Reviewer Identity</span>
                  <button
                    type="button"
                    onClick={() => {
                      login('customer');
                      toast('success', 'Signed in as Demo Customer (Alex Morgan)');
                    }}
                    className="text-xs text-accent-primary hover:underline font-medium"
                  >
                    ⚡ One-Click Sign In
                  </button>
                </div>
                <Input
                  placeholder="Enter your name / nickname (or post as Verified Moviegoer)"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-wider text-text-muted block mb-2 font-medium">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewRating(num)}
                    className="p-1.5 hover:scale-110 transition-transform"
                    aria-label={`Rate ${num} stars`}
                  >
                    <Star className={`w-7 h-7 ${num <= newRating ? 'fill-accent-primary text-accent-primary' : 'text-text-muted'}`} />
                  </button>
                ))}
                <span className="text-sm font-semibold ml-2 text-accent-primary">{newRating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-text-muted block mb-2 font-medium">Your Review</label>
              <textarea
                rows={4}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="What did you think of the cinematography, story, and performances?"
                className="w-full bg-cinema-base border border-cinema-border rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitReview} className="flex items-center gap-2">
                <Send className="w-4 h-4" /> Submit Review
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

