import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Calendar, Clock, Star, Award, Tv, Film, ChevronDown, Play, Info, Share2 } from 'lucide-react';
import { getDetails, getSeasonDetails, getRecommendations } from '../services/tmdb';
import VideoPlayer from '../components/VideoPlayer';
import MovieCard from '../components/MovieCard';
import { SEO } from '../components/SEO';
import { cn } from '../utils/cn';
import { WatchlistButton } from '../components/WatchlistButton';
import { Comments } from '../components/Comments';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { GenreBadge } from '../components/GenreBadge';
import { createSEOProps, formatMovieTitle } from '../utils/seo-helper';

export const Watch = () => {
  const { mediaType = 'movie', id } = useParams<{ mediaType: 'movie' | 'tv'; id: string }>();
  const { user } = useAuth();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [showSeasons, setShowSeasons] = useState(false);

  // Get last watched episode
  const { data: lastWatched } = useQuery(
    ['lastWatched', mediaType, id],
    async () => {
      if (!user || mediaType !== 'tv' || !id) return null;

      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('media_type', mediaType)
        .eq('media_id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching last watched:', error);
        return null;
      }

      return data;
    },
    {
      enabled: !!user && mediaType === 'tv' && !!id,
    }
  );

  // Get show details
  const { data: details, isLoading: isDetailsLoading } = useQuery(
    ['details', mediaType, id],
    () => getDetails(mediaType!, parseInt(id!)),
    {
      enabled: !!mediaType && !!id,
    }
  );

  // Get season details
  const { data: seasonDetails } = useQuery(
    ['seasonDetails', id, selectedSeason],
    () => getSeasonDetails(parseInt(id!), selectedSeason),
    { 
      enabled: mediaType === 'tv' && !!id && !!selectedSeason 
    }
  );

  // Get recommendations
  const { data: recommendations } = useQuery(
    ['recommendations', mediaType, id],
    () => getRecommendations(mediaType!, parseInt(id!)),
    {
      enabled: !!mediaType && !!id,
    }
  );

  // Set initial season/episode from history
  useEffect(() => {
    if (lastWatched && mediaType === 'tv') {
      setSelectedSeason(lastWatched.season_number || 1);
      setSelectedEpisode(lastWatched.episode_number || 1);
    }
  }, [lastWatched, mediaType]);

  if (isDetailsLoading || !details) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-primary-500/20 rounded-full animate-ping" />
          <div className="absolute inset-0 border-2 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const title = 'title' in details ? details.title : details.name;
  const releaseDate = 'release_date' in details ? details.release_date : details.first_air_date;
  const runtime = 'runtime' in details ? details.runtime : details.episode_run_time?.[0];

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        text: details.overview,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEpisodeSelect = (season: number, episode: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setShowSeasons(false);
  };

  // Create enhanced SEO configuration for movie/TV show
  const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;
  const formattedTitle = formatMovieTitle(title, year);
  
  // Create SEO props with media-specific data
  const seoProps = createSEOProps({
    title: formattedTitle,
    description: `Stream ${title} (${year}) online free in HD on FreeFilmHub. ${details.overview?.substring(0, 150)}...`,
    type: mediaType === 'movie' ? 'video.movie' : 'video.episode',
    mediaType,
    id: id,
    image: details.backdrop_path ? `https://cover-images.b-cdn.net/t/p/w1280${details.backdrop_path}` : undefined,
    publishedAt: releaseDate,
    rating: details.vote_average,
    duration: runtime,
    genres: details.genres?.map(g => g.name),
    actors: details.credits?.cast?.slice(0, 5).map(actor => actor.name),
    director: details.credits?.crew?.find(person => person.job === 'Director')?.name
  });

  return (
    <>
      <SEO {...seoProps} />

      <main className="min-h-screen bg-[#0f0f0f]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)] z-20" />
          <img
            src={`https://cover-images.b-cdn.net/t/p/original${details.backdrop_path}`}
            alt={title}
            className="w-full h-[60vh] object-cover opacity-30"
          />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 lg:w-1/4">
                <div className="sticky top-24">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 via-primary-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <img
                      src={`https://cover-images.b-cdn.net/t/p/w500${details.poster_path}`}
                      alt={title}
                      className="w-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] relative z-10"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group">
                      <Play className="w-5 h-5 fill-current transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-medium">Watch Now</span>
                    </button>
                    <WatchlistButton mediaType={mediaType!} mediaId={id!} />
                    <button 
                      onClick={handleShare}
                      className="p-3 bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1] rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3 lg:w-3/4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-200 to-white">{title}</h1>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-yellow-400">{details.vote_average.toFixed(1)}</span>
                  </div>
                  {runtime && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                      <Clock className="w-5 h-5 text-gray-300" />
                      <span className="text-gray-300">{runtime} min</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                    <Calendar className="w-5 h-5 text-gray-300" />
                    <span className="text-gray-300">{new Date(releaseDate).getFullYear()}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 rounded-full backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                    {mediaType === 'movie' ? <Film className="w-5 h-5 text-primary-400" /> : <Tv className="w-5 h-5 text-primary-400" />}
                    <span className="text-primary-400 capitalize">{mediaType}</span>
                  </div>
                </div>

                {details.genres && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {details.genres.map((genre) => (
                      <GenreBadge
                        key={genre.id}
                        id={genre.id}
                        name={genre.name}
                        mediaType={mediaType as 'movie' | 'tv'}
                      />
                    ))}
                  </div>
                )}

                <div className="prose prose-invert max-w-none mb-8">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 mt-1 flex-shrink-0 text-primary-400" />
                    <p className="text-gray-300 leading-relaxed">{details.overview}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <VideoPlayer 
                    mediaType={mediaType as 'movie' | 'tv'} 
                    id={id!} 
                    season={mediaType === 'tv' ? selectedSeason : undefined}
                    episode={mediaType === 'tv' ? selectedEpisode : undefined}
                    title={title}
                  />
                </div>

                {mediaType === 'tv' && details.seasons && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-200 to-white">Episodes</h2>
                      <div className="relative">
                        <button
                          onClick={() => setShowSeasons(!showSeasons)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors duration-200"
                        >
                          <span className="text-white">Season {selectedSeason}</span>
                          <ChevronDown className={cn(
                            "w-4 h-4 text-gray-400 transition-transform duration-200",
                            showSeasons && "transform rotate-180"
                          )} />
                        </button>
                        {showSeasons && (
                          <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-xl border border-white/[0.05] py-1 z-50">
                            {details.seasons.map((season) => (
                              <button
                                key={season.season_number}
                                onClick={() => handleEpisodeSelect(season.season_number, 1)}
                                className={cn(
                                  "flex items-center w-full px-4 py-2 text-left transition-colors duration-200",
                                  selectedSeason === season.season_number
                                    ? "bg-primary-500/20 text-primary-400"
                                    : "text-gray-300 hover:bg-white/[0.05] hover:text-white"
                                )}
                              >
                                <span>Season {season.season_number}</span>
                                <span className="ml-auto text-sm text-gray-500">
                                  {season.episode_count} eps
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {seasonDetails?.episodes.map((episode) => (
                        <button
                          key={episode.episode_number}
                          onClick={() => handleEpisodeSelect(selectedSeason, episode.episode_number)}
                          className={cn(
                            "w-full text-left p-4 rounded-lg transition-all duration-300 group hover:scale-[1.01]",
                            episode.episode_number === selectedEpisode
                              ? "bg-primary-500/20 border border-primary-500/50"
                              : "bg-white/[0.03] hover:bg-white/[0.06]"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative overflow-hidden rounded-lg">
                              {episode.still_path ? (
                                <img
                                  src={`https://cover-images.b-cdn.net/t/p/w300${episode.still_path}`}
                                  alt={episode.name}
                                  className="w-40 aspect-video object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-40 aspect-video bg-gray-700 rounded flex items-center justify-center">
                                  <Play className="w-8 h-8" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-lg group-hover:text-primary-400 transition-colors duration-300">
                                  Episode {episode.episode_number}: {episode.name}
                                </h3>
                                <span className="text-sm text-gray-400">
                                  {new Date(episode.air_date).toLocaleDateString()}
                                </span>
                              </div>
                              {episode.overview && (
                                <p className="mt-2 text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                                  {episode.overview}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-12">
                  <Comments mediaType={mediaType!} mediaId={id!} />
                </div>

                {recommendations && recommendations.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-200 to-white">You May Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {recommendations.slice(0, 8).map((item) => (
                        <MovieCard
                          key={item.id}
                          item={item}
                          mediaType={mediaType as 'movie' | 'tv'}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
