import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Film } from 'lucide-react';
import { Header } from './Header';

export const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  // Scroll to top when location changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <div className="pt-24">
        <Outlet />
      </div>

      <footer className="border-t border-white/[0.05]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Film className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold text-white">FreeFilmHub</span>
            </Link>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} FreeFilmHub. Watch your favorite movies and TV shows anytime, anywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};