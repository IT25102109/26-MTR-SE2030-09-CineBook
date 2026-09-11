import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search, Menu, X, ChevronDown, User, Ticket, BarChart3, Building2, Clapperboard, CalendarDays } from 'lucide-react';
import { useAuth, ROLE_LABELS, hasAccess } from '@/context/AuthContext';
import type { Role } from '@/types';

export function Navbar() {
  const { role, setRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [search, setSearch] = useState('');
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setRoleOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/movies?q=${encodeURIComponent(search)}`);
    setMobileOpen(false);
  };

  const customerLinks = [
    { to: '/', label: 'Home', icon: Film },
    { to: '/movies', label: 'Movies', icon: Clapperboard },
    { to: '/bookings', label: 'My Bookings', icon: Ticket },
  ];

  const managerLinks = [
    { to: '/manage/movies', label: 'Manage Movies', icon: Clapperboard, role: 'manager' as Role },
    { to: '/manage/showtimes', label: 'Manage Showtimes', icon: CalendarDays, role: 'manager' as Role },
  ];

  const adminLinks = [
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, role: 'admin' as Role },
    { to: '/admin/branches', label: 'Branches', icon: Building2, role: 'admin' as Role },
    { to: '/admin/users', label: 'Users', icon: User, role: 'admin' as Role },
  ];

  const allLinks = [...customerLinks, ...managerLinks, ...adminLinks].filter(
    (l) => !('role' in l) || hasAccess(role, (l as { role: Role }).role)
  );

  const roleColors: Record<Role, string> = {
    customer: 'text-success',
    manager: 'text-gold',
    admin: 'text-accent',
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? 'glass shadow-card' : 'bg-gradient-to-b from-ink-950 to-transparent'}`}>
      <nav className="container-app flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-glow">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            Cine<span className="text-accent">Book</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {allLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active ? 'text-white bg-white/5' : 'text-ink-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={submitSearch} className="hidden md:flex items-center flex-1 max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="w-full bg-ink-800/80 border border-ink-600 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </form>

        {/* Role switcher */}
        <div ref={roleRef} className="relative shrink-0">
          <button
            onClick={() => setRoleOpen((o) => !o)}
            className="flex items-center gap-2 bg-ink-800 hover:bg-ink-700 border border-ink-600 rounded-xl px-3 py-2 text-sm transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center text-xs font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs text-ink-400 leading-none">Logged in as</div>
              <div className={`text-sm font-medium leading-tight ${roleColors[role]}`}>{ROLE_LABELS[role]}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-ink-400 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
          </button>
          {roleOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-card p-2 animate-scale-in">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-ink-400">{user.email}</div>
              </div>
              <div className="text-xs text-ink-400 px-3 py-1">Switch role</div>
              {(['customer', 'manager', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setRoleOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    role === r ? 'bg-accent/15 text-accent' : 'hover:bg-white/5 text-ink-200'
                  }`}
                >
                  {ROLE_LABELS[r]}
                  {role === r && <span className="w-2 h-2 rounded-full bg-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMobileOpen((o) => !o)} className="lg:hidden p-2 rounded-lg hover:bg-white/5">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass border-t border-white/5 animate-fade-in">
          <div className="container-app py-4 space-y-3">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search movies..."
                className="w-full bg-ink-800 border border-ink-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
            </form>
            {allLinks.map((link) => {
              const Icon = link.icon;
              const active = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'text-white bg-white/5' : 'text-ink-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
