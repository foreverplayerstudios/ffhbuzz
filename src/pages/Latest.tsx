import React from 'react';
import { useQuery } from 'react-query';
import { Clock, Film, Tv } from 'lucide-react';
import { getLatest } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';

export const Latest = () => {
  const [activeTab, setActiveTab] = React.useState<'movie' | 'tv'>('movie');

  const { data: latestItems, isLoading } = useQuery(
    ['latest', activeTab],
    () => getLatest(activeTab),
    {
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  const tabs = [
    { id: 'movie' as const, label: 'Movies', icon: Film },
    { id: 'tv' as const, label: 'TV Shows', icon: Tv },
  ];

  return (
    <>
      <SEO
        title={`Latest ${activeTab === 'movie' ? 'Movies' : 'TV Shows'}`}
        description={`Watch the latest ${activeTab === 'movie' ? 'movies in theaters' : 'TV shows on air'}. Stream new releases in HD quality.`}
        keywords={`new ${activeTab === 'movie' ? 'movies' : 'tv shows'}, latest releases, watch online, streaming`}
        type="website"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">
            {activeTab === 'movie' ? 'Now Playing in Theaters' : 'Currently On Air'}
          </h1>
        </div>

        <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg w-fit mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                activeTab === id
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
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
                <div className="aspect-[2/3] bg-gray-800/50 rounded-xl" />
                <div className="mt-3 h-4 bg-gray-800/50 rounded-full w-3/4" />
                <div className="mt-2 h-4 bg-gray-800/50 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : !latestItems || latestItems.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.03] rounded-xl">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No {activeTab === 'movie' ? 'movies' : 'TV shows'} found</h2>
            <p className="text-gray-400">
              {activeTab === 'movie'
                ? 'There are no movies currently playing in theaters.'
                : 'There are no TV shows currently on air.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {latestItems.map((item) => (
              <MovieCard key={item.id} item={item} mediaType={activeTab} />
            ))}
          </div>
        )}
      </main>
    </>
  );
};