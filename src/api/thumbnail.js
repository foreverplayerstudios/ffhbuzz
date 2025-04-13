/**
 * API handler for video thumbnails
 * This is used for thumbnail URLs in the video sitemap
 */

/**
 * Handles thumbnail requests for the video sitemap
 */
export default async function handler(req, res) {
  try {
    // Extract parameters from the request
    const { path = '' } = req.query;
    const [mediaType, id] = path.split('/');
    
    if (!mediaType || !id) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // TMDB image path for backdrop image
    // Note: Using the CDN configured for the project
    const imageUrl = `https://cover-images.b-cdn.net/t/p/w780${mediaType === 'tv' ? 
      `/tv/${id}/backdrop.jpg` : 
      `/movie/${id}/backdrop.jpg`
    }`;
    
    // Set cache headers (cache for 7 days)
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800');
    
    // Redirect to the TMDB image
    return res.redirect(307, imageUrl);
  } catch (error) {
    console.error('Error handling thumbnail request:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
