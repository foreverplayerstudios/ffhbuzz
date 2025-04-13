import React, { useState, useEffect, useRef } from 'react';
import { Film, Tv, ChevronDown, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useQuery } from 'react-query';
import { getSeasonDetails } from '../services/tmdb';
import toast from 'react-hot-toast';

interface VideoPlayerProps {
  mediaType: 'movie' | 'tv';
  id: string;
  season?: number;
  episode?: number;
  title: string;
}

type PlayerSource = 'videasy' | 'vidsrc' | 'moviesapi' | 'vidora';

interface PlayerConfig {
  name: string;
  icon: React.ElementType;
  getUrl: (props: VideoPlayerProps) => string;
  useSandbox?: boolean;
  sandboxPermissions?: string[];
  adBlockingMode: 'strict' | 'moderate' | 'custom';
  hasAds?: boolean;
}

const PLAYERS: Record<PlayerSource, PlayerConfig> = {
  videasy: {
    name: 'Videasy',
    icon: Film,
    useSandbox: true,
    sandboxPermissions: [
      'allow-same-origin',
      'allow-scripts',
      'allow-forms',
      'allow-presentation',
      'allow-modals',
    ],
    adBlockingMode: 'strict',
    getUrl: ({ mediaType, id, season, episode }) => {
      const baseUrl = 'https://player.videasy.net';
      const params = new URLSearchParams({
        color: '3B82F6',
        autoplayNextEpisode: 'true',
        episodeSelector: 'true',
        adblock: 'true',
        hideAds: 'true',
      });
      if (mediaType === 'movie') {
        return `${baseUrl}/movie/${id}?${params}`;
      } else {
        return `${baseUrl}/tv/${id}/${season}/${episode}?${params}&nextEpisode=true`;
      }
    },
  },
  vidsrc: {
    name: 'VidSrc',
    icon: Film,
    useSandbox: true,
    sandboxPermissions: [
      'allow-same-origin',
      'allow-scripts',
      'allow-forms',
      'allow-presentation',
    ],
    adBlockingMode: 'strict',
    getUrl: ({ mediaType, id, season, episode }) => {
      if (mediaType === 'movie') {
        return `https://vidsrc.su/embed/movie/${id}`;
      } else {
        return `https://vidsrc.su/embed/tv/${id}/${season}/${episode}`;
      }
    },
  },
  moviesapi: {
    name: 'MoviesAPI',
    icon: Tv,
    useSandbox: false,
    adBlockingMode: 'custom',
    hasAds: true,
    getUrl: ({ mediaType, id, season, episode }) => {
      if (mediaType === 'movie') {
        return `https://moviesapi.club/movie/${id}`;
      } else {
        return `https://moviesapi.club/tv/${id}-${season}-${episode}`;
      }
    },
  },
  vidora: {
    name: 'Vidora',
    icon: Film,
    useSandbox: true,
    sandboxPermissions: [
      'allow-same-origin',
      'allow-scripts',
      'allow-forms',
      'allow-presentation',
    ],
    adBlockingMode: 'strict',
    getUrl: ({ mediaType, id, season, episode }) => {
      const params = new URLSearchParams({
        autoplay: 'true',
        colour: '6366f1',
        autonextepisode: 'true',
        pausescreen: 'true',
        adblock: 'true',
      });
      if (mediaType === 'movie') {
        return `https://vidora.su/movie/${id}?${params}`;
      } else {
        return `https://vidora.su/tv/${id}/${season}/${episode}?${params}`;
      }
    },
  },
};

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { user } = useAuth();
  const [currentPlayer, setCurrentPlayer] = useState<PlayerSource>('videasy');
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasTrackedView = useRef(false);
  const updateTimeout = useRef<NodeJS.Timeout>();

  // Get episode details for TV shows
  const { data: seasonDetails } = useQuery(
    ['seasonDetails', props.id, props.season],
    () => getSeasonDetails(parseInt(props.id), props.season!),
    {
      enabled: props.mediaType === 'tv' && !!props.season,
    }
  );

  // Get current episode info
  const currentEpisode = props.mediaType === 'tv' && seasonDetails?.episodes?.find(
    ep => ep.episode_number === props.episode
  );

  // Track view in history with debouncing
  const updateHistory = async () => {
    if (!user || hasTrackedView.current) return;

    try {
      // Clear any existing timeout
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }

      // Set a new timeout to update history after 2 seconds
      updateTimeout.current = setTimeout(async () => {
        const { error } = await supabase
          .from('watch_history')
          .upsert({
            user_id: user.id,
            media_type: props.mediaType,
            media_id: props.id,
            season_number: props.mediaType === 'tv' ? props.season : null,
            episode_number: props.mediaType === 'tv' ? props.episode : null,
            episode_name: currentEpisode?.name || null,
            watched_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,media_type,media_id'
          });

        if (error) {
          console.error('Error updating watch history:', error);
          return;
        }

        hasTrackedView.current = true;
      }, 2000);
    } catch (error) {
      console.error('Error updating watch history:', error);
    }
  };

  // Update history when component mounts or episode changes
  useEffect(() => {
    if (user && (props.mediaType === 'movie' || (props.mediaType === 'tv' && props.season && props.episode))) {
      updateHistory();
    }

    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, [user, props.mediaType, props.id, props.season, props.episode, currentEpisode]);

  // Reset tracking when source changes
  useEffect(() => {
    hasTrackedView.current = false;
  }, [currentPlayer]);

  return (
    <div className="relative group">
      {/* Player Controls Overlay */}
      <div className="absolute inset-x-0 top-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-black/80 hover:bg-black text-white rounded-lg backdrop-blur-sm transition-colors group"
              >
                <div className="flex items-center gap-2">
                  {React.createElement(PLAYERS[currentPlayer].icon, { className: 'w-4 h-4' })}
                  <span className="text-sm font-medium">{PLAYERS[currentPlayer].name}</span>
                  {PLAYERS[currentPlayer].hasAds && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 rounded text-yellow-400 text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Ads</span>
                    </div>
                  )}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      showSourceMenu && 'transform rotate-180'
                    )}
                  />
                </div>
              </div>

              {/* Source Menu */}
              {showSourceMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-black rounded-lg shadow-xl border border-gray-800/50 overflow-hidden z-30">
                  {Object.entries(PLAYERS).map(([key, player]) => {
                    const Icon = player.icon;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          setCurrentPlayer(key as PlayerSource);
                          setShowSourceMenu(false);
                        }}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors cursor-pointer',
                          currentPlayer === key
                            ? 'bg-primary-500/20 text-primary-400'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="flex items-center justify-between flex-1">
                          <span>{player.name}</span>
                          {player.hasAds && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/20 rounded text-yellow-400 text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Ads</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {props.mediaType === 'tv' && currentEpisode && (
              <div className="text-white">
                <span className="text-gray-400">Now Playing:</span>{' '}
                <span className="font-medium">{props.title}</span>{' '}
                <span className="text-gray-400">•</span>{' '}
                <span className="text-primary-400">S{props.season} E{props.episode}</span>{' '}
                <span className="text-gray-400">•</span>{' '}
                <span className="text-sm text-gray-300">{currentEpisode.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div
        ref={playerContainerRef}
        className={cn('relative pt-[56.25%] bg-black rounded-lg overflow-hidden')}
      >
        <iframe
          ref={iframeRef}
          key={`${currentPlayer}-${props.season}-${props.episode}`}
          src={PLAYERS[currentPlayer].getUrl(props)}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="encrypted-media; autoplay; fullscreen"
          {...(PLAYERS[currentPlayer].useSandbox && {
            sandbox: PLAYERS[currentPlayer].sandboxPermissions?.join(' '),
          })}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
        {currentPlayer === 'moviesapi' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-yellow-500/90 text-yellow-900 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2 z-20">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">This player may contain ads</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
