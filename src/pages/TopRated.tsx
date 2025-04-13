import React from 'react';
import { useQuery } from 'react-query';
import { Star, Film, Tv } from 'lucide-react';
import { getTopRated } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';

export const TopRated = () => {
  const [activeTab, setActiveTab] = React.useState<'movie' | 'tv'>('movie');

  const { data: topRatedItems, isLoading } = useQuery(
    ['topRated', activeTab],
    () => getTopRated(activeTab)
  );

  const tabs = [
    { id: 'movie' as const, label: 'Movies', icon: Film },
    { id: 'tv' as const, label: 'TV Shows', icon: Tv },
  ];

  return (
    <>
      <SEO
        title="Top Rated Movies & TV Shows"
        description="Watch the highest rated movies and TV shows of all time. Stream critically acclaimed content in HD quality."
        keywords="top rated movies, best tv shows, highest rated, watch online, streaming"
        type="website"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">Top Rated</h1>
        </div>

        <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg w-fit mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                activeTab === id
                  ? "bg-primary-500 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg" />
                <div className="mt-2 h-4 bg-gray-800 rounded w-3/4" />
                <div className="mt-2 h-4 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {topRatedItems?.map((item) => (
              <MovieCard key={item.id} item={item} mediaType={activeTab} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};