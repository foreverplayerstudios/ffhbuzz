import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search as SearchIcon, Menu, X, TrendingUp, Clock, Star, Home, User, LogIn, UserPlus, Bookmark, History as HistoryIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: TrendingUp, label: 'Trending', path: '/trending' },
  { icon: Clock, label: 'Latest', path: '/latest' },
  { icon: Star, label: 'Top Rated', path: '/top-rated' },
];

const userNavItems = [
  { icon: Bookmark, label: 'Watchlist', path: '/watchlist' },
  { icon: HistoryIcon, label: 'History', path: '/history' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || 
          (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement))) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsMenuOpen(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
        !isHeaderVisible && "transform -translate-y-full",
        "bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md",
        "before:absolute before:inset-0 before:bg-[radial-gradient(600px_circle_at_center,rgba(99,102,241,0.07),transparent)] before:animate-pulse before:pointer-events-none",
        "after:absolute after:inset-x-0 after:h-px after:-bottom-px after:pointer-events-none",
        "after:bg-gradient-to-r after:from-transparent after:via-primary-500/30 after:to-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-12">
            <Link 
              to="/" 
              className="flex items-center gap-3 group relative"
            >
              <div className="relative">
                <Film className="w-8 h-8 text-primary-500 transition-all duration-300 group-hover:scale-110 animate-neon" />
                <div className="absolute inset-0 bg-primary-500/10 blur-lg rounded-full transition-all duration-300 group-hover:blur-xl group-hover:bg-primary-500/20" />
              </div>
              <span className="text-xl font-bold animate-text-shimmer">
                FreeFilmHub
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                      "hover:bg-white/[0.02]",
                      isActive && "bg-primary-500/5 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 transition-all duration-200",
                      isActive ? "text-primary-400" : "text-gray-400 group-hover:text-white"
                    )} />
                    <span className={cn(
                      "font-medium transition-colors duration-200",
                      isActive ? "text-primary-400" : "text-gray-400 group-hover:text-white"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <form 
              onSubmit={handleSearch} 
              className={cn(
                "hidden md:flex items-center transition-all duration-300 relative group",
                isSearchFocused ? "w-[400px]" : "w-72"
              )}
            >
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="search"
                  name="search"
                  placeholder="Search movies and TV shows..."
                  className={cn(
                    "w-full h-10 px-4 pl-10 rounded-lg",
                    "bg-white/[0.03] border border-white/[0.06]",
                    "text-white placeholder-gray-500",
                    "focus:outline-none focus:border-primary-500/20 focus:bg-white/[0.04]",
                    "focus:ring-[2px] focus:ring-primary-500/10",
                    "transition-all duration-200"
                  )}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-white/[0.06] rounded border border-white/[0.06]">
                  <span className="text-[10px]">⌘</span>
                  <span>K</span>
                </kbd>
              </div>
            </form>

            {/* Auth Buttons / Profile Menu */}
            <div className="hidden md:flex items-center gap-3 relative z-50">
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors group relative z-50"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-500/10 flex items-center justify-center">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary-400" />
                      )}
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {user.user_metadata?.username || 'Profile'}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-xl border border-white/[0.05] py-1 z-50">
                      {userNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="relative z-50 flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-all duration-200 hover:bg-white/[0.02] rounded-lg active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/auth/register"
                    className="relative z-50 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "md:hidden relative p-2 rounded-lg z-50",
                "text-gray-400 hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                "bg-white/[0.03] border border-white/[0.06]"
              )}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="search"
                  name="search"
                  placeholder="Search movies and TV shows..."
                  className={cn(
                    "w-full h-10 px-4 pl-10 rounded-lg",
                    "bg-white/[0.03] border border-white/[0.06]",
                    "text-white placeholder-gray-500",
                    "focus:outline-none focus:border-primary-500/20 focus:bg-white/[0.04]",
                    "focus:ring-[2px] focus:ring-primary-500/10",
                    "transition-colors duration-200"
                  )}
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </form>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
                      isActive 
                        ? "bg-primary-500/5 text-primary-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]" 
                        : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user && userNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
                      isActive 
                        ? "bg-primary-500/5 text-primary-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]" 
                        : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.02] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-500/10 flex items-center justify-center">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary-400" />
                      )}
                    </div>
                    <span>{user.user_metadata?.username || 'Profile Settings'}</span>
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all duration-200 bg-white/[0.03] hover:bg-white/[0.06] active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};