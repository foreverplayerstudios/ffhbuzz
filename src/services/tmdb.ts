import axios from 'axios';
import { Movie, TVShow, Genre } from '../types/tmdb';

const TMDB_API_KEY = 'ea021b3b0775c8531592713ab727f254';
const BASE_URL = 'https://api.themoviedb.org/3';

// Create axios instance with default config
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  headers: {
    'Cache-Control': 'public, max-age=3600',
  }
});

// Add response interceptor for error handling
tmdbApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 1;
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(tmdbApi(error.config));
        }, retryAfter * 1000);
      });
    }
    return Promise.reject(error);
  }
);

export const getTrending = async (mediaType: 'movie' | 'tv', timeWindow: 'day' | 'week' = 'week') => {
  try {
    const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching trending ${mediaType}:`, error);
    return [];
  }
};

export const getPopular = async (mediaType: 'movie' | 'tv') => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/popular`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching popular ${mediaType}:`, error);
    return [];
  }
};

export const getTopRated = async (mediaType: 'movie' | 'tv') => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/top_rated`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching top rated ${mediaType}:`, error);
    return [];
  }
};

export const getLatest = async (mediaType: 'movie' | 'tv') => {
  try {
    const endpoint = mediaType === 'movie' ? 'now_playing' : 'on_the_air';
    const response = await tmdbApi.get(`/${mediaType}/${endpoint}`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching latest ${mediaType}:`, error);
    return [];
  }
};

export const getGenres = async (mediaType: 'movie' | 'tv'): Promise<Genre[]> => {
  try {
    const response = await tmdbApi.get(`/genre/${mediaType}/list`);
    return response.data.genres;
  } catch (error) {
    console.error(`Error fetching genres for ${mediaType}:`, error);
    return [];
  }
};

export const getByGenre = async (mediaType: 'movie' | 'tv', genreId: number) => {
  try {
    const response = await tmdbApi.get(`/discover/${mediaType}`, {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching ${mediaType} by genre:`, error);
    return [];
  }
};

export const getDetails = async (mediaType: 'movie' | 'tv', id: number) => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${mediaType} details:`, error);
    return null;
  }
};

export const getSeasonDetails = async (tvId: number, seasonNumber: number) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching season details:', error);
    return null;
  }
};

export const getRecommendations = async (mediaType: 'movie' | 'tv', id: number) => {
  try {
    const response = await tmdbApi.get(`/${mediaType}/${id}/recommendations`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching recommendations for ${mediaType}:`, error);
    return [];
  }
};

export const search = async (query: string, page: number = 1) => {
  if (!query.trim()) {
    return { results: [], total_pages: 0, total_results: 0 };
  }

  try {
    const [movieResponse, tvResponse] = await Promise.all([
      tmdbApi.get('/search/movie', {
        params: {
          query,
          page,
          include_adult: false,
          language: 'en-US',
        }
      }),
      tmdbApi.get('/search/tv', {
        params: {
          query,
          page,
          include_adult: false,
          language: 'en-US',
        }
      })
    ]);

    const movies = movieResponse.data.results.map((movie: any) => ({
      ...movie,
      media_type: 'movie'
    }));

    const tvShows = tvResponse.data.results.map((show: any) => ({
      ...show,
      media_type: 'tv'
    }));

    const combined = [...movies, ...tvShows].sort((a, b) => b.popularity - a.popularity);

    return {
      results: combined,
      total_pages: Math.max(movieResponse.data.total_pages, tvResponse.data.total_pages),
      total_results: movieResponse.data.total_results + tvResponse.data.total_results
    };
  } catch (error) {
    console.error('Error searching:', error);
    return { results: [], total_pages: 0, total_results: 0 };
  }
};