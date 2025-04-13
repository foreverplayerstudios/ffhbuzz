import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Film, Tv, TrendingUp, Star, Calendar, Play, Info, ChevronRight, Clapperboard } from 'lucide-react';
import { getTrending, getTopRated } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';
import { createSEOProps } from '../utils/seo-helper';

interface FeaturedBannerProps {
  items: any[];
  mediaType: 'movie' | 'tv';
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ items, mediaType }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [items.length, isHovered]);

  if (!items?.length) return null;

  const currentItem = items[currentIndex];
  const title = mediaType === 'movie' ? currentItem.title : currentItem.name;
  const releaseDate = mediaType === 'movie' ? currentItem.release_date : currentItem.first_air_date;
  const year = new Date(releaseDate).getFullYear();

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/${mediaType}/${currentItem.id}`}>
        <div className="relative aspect-[21/9] sm:aspect-[2/1] md:aspect-[21/9] w-full overflow-hidden rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-black/50">
          {/* Background Image */}
          <div className="absolute inset-0 bg-gray-900">
            <img
              src={`https://cover-images.b-cdn.net/t/p/original${currentItem.backdrop_path}`}
              alt={title}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-[2s] group-hover:scale-110"
            />
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent opacity-70" />
          
          {/* Hover effect overlay */}
          <div 
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: isHovered ? 1 : 0,
              background: 'radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, transparent 70%)',
            }}
          />
          
          {/* Content */}
          <div className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-end">
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8 max-w-7xl mx-auto w-full">
              {/* Poster (Hidden on mobile) */}
              <div className="hidden md:block relative group/poster w-1/4 max-w-[200px] flex-shrink-0">
                <div className="absolute inset-0 rounded-xl transition-colors duration-300 group-hover/poster:bg-primary-500/10" />
                <img
                  src={`https://cover-images.b-cdn.net/t/p/w500${currentItem.poster_path}`}
                  alt={title}
                  className="w-full rounded-xl shadow-2xl transform -translate-y-8 transition-all duration-500 group-hover/poster:scale-105 relative z-10"
                />
                <div className="absolute inset-0 transform -translate-y-8 rounded-xl transition-all duration-500 opacity-0 group-hover/poster:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 via-primary-500/5 to-transparent rounded-xl" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent)]" />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white line-clamp-2 md:line-clamp-none drop-shadow-lg transition-transform duration-300 group-hover:translate-x-2">
                  {title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base">
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500/20 rounded-full backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-medium">{currentItem.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 rounded-full backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                    <span className="text-gray-300">{year}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-500/20 rounded-full backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                    {mediaType === 'movie' ? 
                      <Film className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" /> : 
                      <Tv className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400" />
                    }
                    <span className="text-primary-400 capitalize">{mediaType}</span>
                  </div>
                </div>

                <p className="hidden sm:block text-sm md:text-base text-gray-300 line-clamp-2 md:line-clamp-3 max-w-3xl drop-shadow transition-transform duration-300 group-hover:translate-x-2">
                  {currentItem.overview}
                </p>

                <div className="flex items-center gap-2 sm:gap-4 pt-2">
                  <button className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg sm:rounded-xl hover:bg-primary-700 transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 hover:-translate-y-0.5">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    <span className="hidden sm:inline">Watch</span>
                    <span className="sm:hidden">Play</span>
                  </button>
                  <button className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white/10 text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 inline-flex items-center gap-2 text-sm sm:text-base font-medium backdrop-blur-sm hover:scale-105 hover:-translate-y-0.5">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">More Info</span>
                    <span className="sm:hidden">Info</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Progress Bars */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center gap-1 sm:gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="group p-1"
          >
            <div className={cn(
              "h-1 sm:h-1.5 w-8 sm:w-16 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-primary-500 shadow-lg shadow-primary-500/25" 
                : "bg-gray-600 group-hover:bg-gray-500"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
};

interface CategoryProps {
  title: string;
  icon: React.ElementType;
  items?: any[];
  isLoading?: boolean;
  viewAllLink: string;
  mediaType: 'movie' | 'tv';
}

const Category: React.FC<CategoryProps> = ({ title, icon: Icon, items, isLoading, viewAllLink, mediaType }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <section className="relative group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-500/10 rounded-xl group-hover:bg-primary-500/20 transition-colors relative">
            <Icon className="w-6 h-6 text-primary-500 relative z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2),transparent)] blur-sm" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-primary-200 to-white bg-clip-text text-transparent group-hover:text-primary-400 transition-colors">
            {title}
          </h2>
        </div>
        {items && items.length > 0 && (
          <Link 
            to={viewAllLink}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="relative">
              View All
              <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-primary-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </span>
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform duration-200",
              isHovered && "transform translate-x-1"
            )} />
          </Link>
        )}
      </div>
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-gray-800/50 rounded-xl" />
                <div className="mt-3 h-4 bg-gray-800/50 rounded-full w-3/4" />
                <div className="mt-2 h-4 bg-gray-800/50 rounded-full w-1/2" />
              </div>
            ))
          ) : (
            items?.slice(0, 12).map((item) => (
              <MovieCard key={item.id} item={item} mediaType={mediaType} />
            ))
          )}
        </div>
        {items && items.length > 0 && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0f0f0f] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0f0f0f] to-transparent pointer-events-none" />
          </>
        )}
      </div>
    </section>
  );
};

export const Home = () => {
  const { data: trendingMovies, isLoading: isTrendingMoviesLoading } = useQuery(
    'trendingMovies', 
    () => getTrending('movie'),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
  
  const { data: trendingTVShows, isLoading: isTrendingTVShowsLoading } = useQuery(
    'trendingTVShows', 
    () => getTrending('tv'),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
  
  const { data: topRatedMovies, isLoading: isTopRatedMoviesLoading } = useQuery(
    'topRatedMovies', 
    () => getTopRated('movie'),
    {
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const { data: topRatedTVShows, isLoading: isTopRatedTVShowsLoading } = useQuery(
    'topRatedTVShows', 
    () => getTopRated('tv'),
    {
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const currentUrl = window.location.origin;

  const categories = [
    {
      id: 'movies',
      title: 'Popular Movies',
      description: 'Watch the latest and most popular movies online',
      icon: Film,
      links: [
        { href: '/trending?type=movie', text: 'Trending Movies' },
        { href: '/latest?type=movie', text: 'Latest Releases' },
        { href: '/top-rated?type=movie', text: 'Top Rated Movies' },
      ]
    },
    {
      id: 'tv',
      title: 'TV Shows',
      description: 'Stream your favorite TV series and shows',
      icon: Tv,
      links: [
        { href: '/trending?type=tv', text: 'Trending Shows' },
        { href: '/latest?type=tv', text: 'Currently Airing' },
        { href: '/top-rated?type=tv', text: 'Top Rated Shows' },
      ]
    },
    {
      id: 'genres',
      title: 'Browse by Genre',
      description: 'Discover content across different genres',
      icon: Clapperboard,
      links: [
        { href: '/genre/28/movie', text: 'Action' },
        { href: '/genre/35/movie', text: 'Comedy' },
        { href: '/genre/18/movie', text: 'Drama' },
      ]
    }
  ];

  // Create enhanced SEO props with trending titles for better indexing
  const seoDescription = trendingMovies?.length 
    ? `Stream the latest movies and TV shows in HD quality on FreeFilmHub. Now trending: ${trendingMovies.slice(0, 3).map(m => m.title).join(', ')}. Watch your favorite content anytime, anywhere.`
    : "Stream the latest movies and TV shows in HD quality on FreeFilmHub. Watch your favorite content anytime, anywhere. Free streaming of popular movies and TV series.";

  const seoProps = createSEOProps({
    title: "Watch Movies & TV Shows Online",
    description: seoDescription,
    type: "website"
  });

  return (
    <>
      <SEO {...seoProps} />

      <main className="min-h-screen bg-[#0f0f0f]">
        <h1 className="sr-only">FreeFilmHub - Watch Movies & TV Shows Online</h1>
        
        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
          {/* Featured Content Carousel */}
          <div className="mb-8 sm:mb-12 md:mb-16">
            {trendingMovies && <FeaturedBanner items={trendingMovies.slice(0, 5)} mediaType="movie" />}
          </div>

          {/* Quick Navigation */}
          <section className="mb-16">
            <h2 className="sr-only">Quick Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white/[0.03] rounded-xl p-6 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-primary-500/10 rounded-xl">
                      <category.icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{category.title}</h3>
                  </div>
                  <p className="text-gray-400 mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          className="text-gray-300 hover:text-primary-400 transition-colors flex items-center gap-2"
                        >
                          <ChevronRight className="w-4 h-4" />
                          <span>{link.text}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Categories */}
          <div className="space-y-8 sm:space-y-12 md:space-y-16">
            <Category
              title="Trending Movies"
              icon={TrendingUp}
              items={trendingMovies}
              isLoading={isTrendingMoviesLoading}
              viewAllLink="/trending"
              mediaType="movie"
            />

            <Category
              title="Trending TV Shows"
              icon={Tv}
              items={trendingTVShows}
              isLoading={isTrendingTVShowsLoading}
              viewAllLink="/trending"
              mediaType="tv"
            />

            <Category
              title="Top Rated Movies"
              icon={Star}
              items={topRatedMovies}
              isLoading={isTopRatedMoviesLoading}
              viewAllLink="/top-rated"
              mediaType="movie"
            />

            <Category
              title="Top Rated TV Shows"
              icon={Star}
              items={topRatedTVShows}
              isLoading={isTopRatedTVShowsLoading}
              viewAllLink="/top-rated"
              mediaType="tv"
            />
          </div>
        </div>
      </main>
    </>
  );
};
