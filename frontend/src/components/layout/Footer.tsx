import { Link } from 'react-router-dom';
import { Film, Github, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20 bg-ink-900">
      <div className="container-app py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Cine<span className="text-accent">Book</span></span>
            </Link>
            <p className="text-sm text-ink-400 leading-relaxed">Your cinema, your seats, your story. Book tickets to the best movies near you.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Movies</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link to="/movies" className="hover:text-accent transition-colors">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="hover:text-accent transition-colors">Coming Soon</Link></li>
              <li><Link to="/movies" className="hover:text-accent transition-colors">Browse All</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link to="/bookings" className="hover:text-accent transition-colors">My Bookings</Link></li>
              <li><Link to="/profile" className="hover:text-accent transition-colors">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Connect</h4>
            <div className="flex gap-3">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-ink-800 hover:bg-accent flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-ink-400">
          <p>© 2026 CineBook. A university software engineering demo project.</p>
          <p>Built with React, TypeScript & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
