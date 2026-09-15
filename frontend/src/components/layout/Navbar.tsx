import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, ChevronDown, Ticket, BarChart3, Building2, Users, Clapperboard, Calendar, UserCircle, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Role } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const roleLabels: Record<Role, string> = {
  customer: 'Customer',
  cinemaManager: 'Cinema Manager',
  admin: 'Admin',
};

export function Navbar() {
  const { user, login, logout, hasRole } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Film, show: true },
    { to: '/movies', label: 'Movies', icon: Clapperboard, show: true },
    { to: '/bookings', label: 'My Bookings', icon: Ticket, show: !!user },
    { to: '/manage/movies', label: 'Manage Movies', icon: Film, show: hasRole('cinemaManager', 'admin') },
    { to: '/manage/showtimes', label: 'Manage Showtimes', icon: Calendar, show: hasRole('cinemaManager', 'admin') },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, show: hasRole('admin') },
    { to: '/admin/branches', label: 'Branches', icon: Building2, show: hasRole('admin') },
    { to: '/admin/users', label: 'Users', icon: Users, show: hasRole('admin') },
    { to: '/admin/notifications', label: 'Notification Center', icon: Bell, show: hasRole('admin') },
  ].filter(l => l.show);

  const handleLogin = (role: Role) => {
    login(role);
    setLoginOpen(false);
    toast('success', `Signed in as ${roleLabels[role]}`);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    toast('info', 'Signed out');
    navigate('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-accent-primary flex items-center justify-center group-hover:shadow-glow-amber transition-shadow">
              <Film className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-display font-semibold tracking-tight">
              Cine<span className="text-accent-primary">Book</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-accent-primary bg-accent-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-cinema-elevated hairline rounded-xl shadow-soft-lg py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                      <span className="inline-block mt-1 text-xs text-accent-primary">{roleLabels[user.role]}</span>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                      <UserCircle className="w-4 h-4" /> Profile
                    </Link>
                    {hasRole('cinemaManager', 'admin') && (
                      <>
                        <Link to="/manage/movies" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors lg:hidden">
                          <Film className="w-4 h-4" /> Manage Movies
                        </Link>
                        <Link to="/manage/showtimes" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors lg:hidden">
                          <Calendar className="w-4 h-4" /> Manage Showtimes
                        </Link>
                      </>
                    )}
                    {hasRole('admin') && (
                      <>
                        <Link to="/admin/analytics" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors lg:hidden">
                          <BarChart3 className="w-4 h-4" /> Analytics
                        </Link>
                        <Link to="/admin/notifications" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors lg:hidden">
                          <Bell className="w-4 h-4" /> Notification Center
                        </Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-accent-destructive hover:bg-white/5 transition-colors border-t border-white/5">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <Button size="sm" onClick={() => setLoginOpen(true)}>
                <User className="w-4 h-4" /> Sign In
              </Button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="lg:hidden glass border-t border-white/5 py-3 animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 flex flex-col gap-1">
              {navLinks.map(link => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active ? 'text-accent-primary bg-accent-primary/10' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    <link.icon className="w-4 h-4" /> {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Choose a role to sign in" size="sm">
        <p className="text-sm text-text-secondary mb-5">
          This is a demo — pick a role to explore the platform from that perspective.
        </p>
        <div className="space-y-3">
          {(['customer', 'cinemaManager', 'admin'] as Role[]).map(role => (
            <button
              key={role}
              onClick={() => handleLogin(role)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-cinema-elevated hover:bg-cinema-border border border-white/5 hover:border-accent-primary/30 transition-all group"
            >
              <div className="text-left">
                <p className="font-medium">{roleLabels[role]}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {role === 'customer' && 'Browse, book, and manage tickets'}
                  {role === 'cinemaManager' && 'Manage movies, showtimes & halls'}
                  {role === 'admin' && 'Full access — analytics, branches & users'}
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-text-muted group-hover:text-accent-primary -rotate-90 transition-all" />
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
