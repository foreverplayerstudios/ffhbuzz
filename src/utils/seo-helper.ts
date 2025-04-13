/**
 * SEO Helper Utility
 * Provides helper functions for consistent SEO implementation across the app
 */

interface DynamicSEOConfig {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'video.movie' | 'video.episode';
  mediaType?: 'movie' | 'tv';
  id?: string;
  publishedAt?: string;
  modifiedAt?: string;
  rating?: number;
  duration?: number;
  genres?: string[];
  actors?: string[];
  director?: string;
}

/**
 * Creates SEO props with default values suitable for FreeFilmHub
 */
export function createSEOProps(config: DynamicSEOConfig) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const {
    title,
    description,
    image,
    type = 'website',
    mediaType,
    id,
    publishedAt,
    modifiedAt,
    rating,
    duration,
    genres,
    actors,
    director
  } = config;
  
  // Create dynamic image URL if no specific image is provided
  let imageUrl = image;
  
  if (!imageUrl) {
    // Create a dynamic OG image based on the content type
    if (type !== 'website' && mediaType && id) {
      // For movies and TV shows, use the og-template with specific parameters
      const params = new URLSearchParams();
      params.append('title', title);
      params.append('description', description.substring(0, 120));
      
      if (genres?.length) {
        params.append('badge1', genres[0]);
        if (genres.length > 1) params.append('badge2', genres[1]);
      }
      
      if (rating) {
        params.append('badge3', `Rating: ${rating}/10`);
      } else if (mediaType) {
        params.append('badge3', mediaType === 'movie' ? 'Movie' : 'TV Show');
      }
      
      imageUrl = `${baseUrl}/api/og-image?${params.toString()}`;
    } else {
      // For other pages, use the default image
      imageUrl = `${baseUrl}/og-image.jpg`;
    }
  }
  
  // Create keywords from the content type, title, and genres
  const keywordsList = [
    'free movies',
    'free tv shows',
    'watch online',
    'streaming',
    title.toLowerCase(),
    ...(genres || [])
  ];
  
  if (mediaType) {
    keywordsList.push(mediaType === 'movie' ? 'movie' : 'tv show');
  }
  
  // Create a year if we have a published date
  const year = publishedAt ? new Date(publishedAt).getFullYear().toString() : '';
  if (year) {
    keywordsList.push(year);
  }
  
  return {
    title,
    description,
    keywords: keywordsList.join(', '),
    image: imageUrl,
    type,
    publishedAt,
    modifiedAt,
    rating,
    duration,
    genres,
    actors,
    director,
    alternateLanguages: {
      'en': `${baseUrl}${window.location.pathname}`,
      'es': `${baseUrl}/es${window.location.pathname}`,
      'fr': `${baseUrl}/fr${window.location.pathname}`
    }
  };
}

/**
 * Truncates a string to a specified length and adds ellipsis
 */
export function truncateForSEO(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formats movie title for SEO
 */
export function formatMovieTitle(title: string, year?: string | number): string {
  const yearStr = year ? ` (${year})` : '';
  return `${title}${yearStr} - Watch Online Free in HD`;
}

/**
 * Creates a canonical URL
 */
export function createCanonicalUrl(path: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  // Remove multiple slashes and trailing slashes
  const normalizedPath = path.replace(/\/+/g, '/').replace(/\/$/, '');
  return `${baseUrl}${normalizedPath}`;
}
