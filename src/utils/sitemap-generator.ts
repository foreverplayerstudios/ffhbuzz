import { getTrending, getTopRated } from '../services/tmdb';

/**
 * Generates a dynamic sitemap for the application
 * including static routes and dynamic content pages
 */
export async function generateSitemap(baseUrl: string): Promise<string> {
  // Start XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';
  
  // Add static routes
  const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/trending', changefreq: 'daily', priority: '0.8' },
    { path: '/latest', changefreq: 'daily', priority: '0.8' },
    { path: '/top-rated', changefreq: 'weekly', priority: '0.7' },
    { path: '/search', changefreq: 'weekly', priority: '0.6' },
  ];
  
  staticRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  try {
    // Add dynamic movie/TV show routes
    const [trendingMovies, trendingTVShows, topRatedMovies, topRatedTVShows] = await Promise.all([
      getTrending('movie'),
      getTrending('tv'),
      getTopRated('movie'),
      getTopRated('tv')
    ]);
    
    // Process movie data
    const processedMovieIds = new Set<number>();
    
    // Helper to add media items to sitemap
    const addMediaToSitemap = (items: any[], mediaType: 'movie' | 'tv') => {
      items?.forEach(item => {
        const id = item.id;
        
        // Skip if we've already added this ID
        if (processedMovieIds.has(id)) return;
        processedMovieIds.add(id);
        
        const title = mediaType === 'movie' ? item.title : item.name;
        const releaseDate = mediaType === 'movie' ? item.release_date : item.first_air_date;
        
        // Add item to sitemap
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/${mediaType}/${id}</loc>\n`;
        xml += `    <lastmod>${releaseDate || new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        
        // Add video extension for enhanced video sitemaps
        xml += '    <video:video>\n';
        xml += `      <video:title>${escapeXml(title)}</video:title>\n`;
        xml += `      <video:description>${escapeXml(item.overview || '')}</video:description>\n`;
        xml += `      <video:thumbnail_loc>${baseUrl}/api/thumbnail/${mediaType}/${id}</video:thumbnail_loc>\n`;
        xml += `      <video:content_loc>${baseUrl}/${mediaType}/${id}</video:content_loc>\n`;
        xml += '      <video:player_loc allow_embed="yes">' + 
                 `${baseUrl}/${mediaType}/${id}` +
               '</video:player_loc>\n';
        if (releaseDate) {
          xml += `      <video:publication_date>${releaseDate}</video:publication_date>\n`;
        }
        if (mediaType === 'movie') {
          xml += '      <video:family_friendly>yes</video:family_friendly>\n';
          xml += '      <video:duration>7200</video:duration>\n';
        }
        xml += '    </video:video>\n';
        xml += '  </url>\n';
      });
    };
    
    // Add all media items to sitemap
    addMediaToSitemap(trendingMovies, 'movie');
    addMediaToSitemap(trendingTVShows, 'tv');
    addMediaToSitemap(topRatedMovies, 'movie');
    addMediaToSitemap(topRatedTVShows, 'tv');
    
  } catch (error) {
    console.error('Error generating dynamic sitemap content:', error);
  }
  
  // Close XML
  xml += '</urlset>';
  
  return xml;
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
