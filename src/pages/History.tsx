import React from 'react';
import { useQuery } from 'react-query';
import { History as HistoryIcon, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDetails } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

export const History = () => {
  const { user } = useAuth();

  const { data: history, isLoading } = useQuery(
    ['history', user?.id],
    async () => {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('watched_at', { ascending: false });

      if (error) throw error;

      // Fetch details for each item
      const items = await Promise.all(
        data.map(async (item) => {
          const details = await getDetails(item.media_type, parseInt(item.media_id));
          return { ...item, details };
        })
      );

      return items;
    },
    {
      enabled: !!user,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Watch History"
        description="Your recently watched movies and TV shows."
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <HistoryIcon className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">Watch History</h1>
        </div>

        {!history || history.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.03] rounded-2xl">
            <HistoryIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No watch history yet</h2>
            <p className="text-gray-400">
              Your watch history will appear here once you start watching content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {history.map((item) => (
              <MovieCard
                key={`${item.media_type}-${item.media_id}`}
                item={item.details}
                mediaType={item.media_type}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};