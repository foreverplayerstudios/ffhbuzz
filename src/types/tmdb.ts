export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  runtime?: number;
  genres?: Genre[];
  production_companies?: ProductionCompany[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  episode_run_time?: number[];
  genres?: Genre[];
  seasons?: Season[];
  production_companies?: ProductionCompany[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  overview: string;
  still_path: string | null;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface SearchResult {
  page: number;
  results: (Movie | TVShow & { media_type: 'movie' | 'tv' })[];
  total_pages: number;
  total_results: number;
}