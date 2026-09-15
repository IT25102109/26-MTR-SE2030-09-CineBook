import { Link } from 'react-router-dom';
import { Film, Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-cinema-card mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent-primary flex items-center justify-center">
                <Film className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-display font-semibold tracking-tight">
                Cine<span className="text-accent-primary">Book</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary max-w-md leading-relaxed">
              Your premium cinema destination. Book tickets for the latest blockbusters in IMAX, Dolby Atmos, and VIP recliner halls across the country.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-cinema-elevated flex items-center justify-center text-text-secondary hover:text-accent-primary hover:bg-cinema-border transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-text-primary">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/movies" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Now Showing</Link></li>
              <li><Link to="/movies?filter=coming-soon" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Coming Soon</Link></li>
              <li><Link to="/bookings" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-text-primary">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">© 2024 CineBook. A university software engineering demo project.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-text-muted hover:text-text-secondary transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
