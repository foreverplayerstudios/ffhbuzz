/**
 * Dynamic sitemap.xml generator
 * Generates a sitemap with both static and dynamic routes
 */

import { generateSitemap } from '../utils/sitemap-generator';

/**
 * API Route handler for sitemap.xml
 */
export default async function handler(req, res) {
  try {
    // Get the base URL from the request
    const host = req.headers.host || 'freefilmhub.buzz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Generate the sitemap XML
    const sitemapXml = await generateSitemap(baseUrl);
    
    // Set headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    
    // Send the sitemap
    res.status(200).send(sitemapXml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}
