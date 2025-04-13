import { Request, Response } from 'express';
import { generateSitemap } from '../utils/sitemap-generator';

/**
 * Handle the sitemap.xml request
 */
export async function handleSitemapRequest(req: Request, res: Response) {
  try {
    // Get base URL from request or use environment variable
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    // Generate the sitemap XML
    const sitemapXml = await generateSitemap(baseUrl);
    
    // Set headers and send response
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(sitemapXml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

/**
 * Handle the robots.txt request
 */
export function handleRobotsRequest(req: Request, res: Response) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow
Disallow: /auth/
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$
Disallow: /*.php$
Disallow: /*.html$

# Crawl-delay
Crawl-delay: 10`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(robotsTxt);
}

/**
 * Handle image thumbnail requests for sitemap
 */
export async function handleThumbnailRequest(req: Request, res: Response) {
  const { mediaType, id } = req.params;
  
  // Redirect to TMDB image
  res.redirect(`https://cover-images.b-cdn.net/t/p/w500/${id}/backdrop.jpg`);
}
