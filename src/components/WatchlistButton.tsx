import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

interface WatchlistButtonProps {
  mediaType: 'movie' | 'tv';
  mediaId: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({ mediaType, mediaId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isInWatchlist, isLoading } = useQuery(
    ['watchlist', mediaType, mediaId],
    async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('media_type', mediaType)
        .eq('media_id', mediaId)
        .maybeSingle();

      if (error) {
        console.error('Error checking watchlist:', error);
        return false;
      }

      return !!data;
    },
    {
      enabled: !!user,
      retry: false,
      staleTime: 30000, // Consider data fresh for 30 seconds
    }
  );

  const { mutate: toggleWatchlist, isLoading: isToggling } = useMutation(
    async () => {
      if (!user) throw new Error('Not authenticated');

      if (isInWatchlist) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('media_type', mediaType)
          .eq('media_id', mediaId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('watchlist')
          .insert({
            user_id: user.id,
            media_type: mediaType,
            media_id: mediaId,
          });

        if (error) {
          // Check if it's a unique constraint violation
          if (error.code === '23505') {
            // Item is already in watchlist, treat as success
            return;
          }
          throw error;
        }
      }
    },
    {
      onMutate: async () => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['watchlist', mediaType, mediaId]);

        // Snapshot the previous value
        const previousValue = queryClient.getQueryData(['watchlist', mediaType, mediaId]);

        // Optimistically update the cache
        queryClient.setQueryData(['watchlist', mediaType, mediaId], !isInWatchlist);

        return { previousValue };
      },
      onError: (error, _, context: any) => {
        // Revert the optimistic update
        queryClient.setQueryData(['watchlist', mediaType, mediaId], context.previousValue);
        console.error('Error updating watchlist:', error);
        toast.error('Failed to update watchlist');
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['watchlist']);
        toast.success(
          isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
          {
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }
        );
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries(['watchlist', mediaType, mediaId]);
      },
    }
  );

  const handleClick = () => {
    if (!user) {
      toast.error('Please sign in to add to watchlist', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
      return;
    }
    toggleWatchlist();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isToggling}
      className={cn(
        "relative p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group",
        isInWatchlist
          ? "bg-primary-500 text-white"
          : "bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]"
      )}
    >
      <Bookmark 
        className={cn(
          "w-5 h-5 transition-all duration-300",
          isInWatchlist && "fill-current"
        )} 
      />
      {(isLoading || isToggling) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="w-4 h-4 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}
      <div className={cn(
        "absolute inset-0 rounded-lg transition-opacity duration-300",
        isInWatchlist ? "opacity-0" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent animate-glow-line" />
      </div>
    </button>
  );
};