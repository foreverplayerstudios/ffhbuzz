import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import type { Movie, TVShow } from '../types/tmdb';

interface MovieCardProps {
  item: Movie | TVShow;
  mediaType: 'movie' | 'tv';
}

const MovieCard: React.FC<MovieCardProps> = ({ item, mediaType }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const title = 'title' in item ? item.title : item.name;
  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';

  if (!item) return null;

  return (
    <Link 
      to={`/${mediaType}/${item.id}`}
      className="group relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-[1.02] hover:ring-2 hover:ring-primary-500/50 bg-[#161616]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[2/3] w-full">
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: isHovered ? 
              'linear-gradient(to top, rgba(0,0,0,0.95), rgba(99,102,241,0.2), transparent)' : 
              'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)'
          }}
        >
          <div 
            className="absolute bottom-0 p-4 w-full transition-all duration-500"
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(20%)',
              opacity: isHovered ? 1 : 0
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {item.vote_average !== undefined && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/20 rounded-full backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-medium">
                      {item.vote_average.toFixed(1)}
                    </span>
                  </div>
                )}
                {year !== 'N/A' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-gray-300">{year}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold text-white line-clamp-2 transition-all duration-300"
                  style={{
                    color: isHovered ? 'rgb(129, 140, 248)' : 'white',
                    textShadow: isHovered ? '0 0 20px rgba(99,102,241,0.5)' : 'none'
                  }}
                >
                  {title}
                </h3>
                {item.overview && (
                  <p 
                    className="text-sm text-gray-300 line-clamp-2 mt-2 transition-all duration-500"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered ? 'translateY(0)' : 'translateY(10px)'
                    }}
                  >
                    {item.overview}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hover border effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0 }}
      >
        <div className="absolute inset-0 border-2 border-primary-500/50 rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent animate-glow-line" />
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;