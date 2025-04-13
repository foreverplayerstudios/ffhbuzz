/**
 * Dynamic robots.txt generator
 * Creates a custom robots.txt file based on the environment
 */

/**
 * API Route handler for robots.txt
 */
export default function handler(req, res) {
  // Determine the environment
  const host = req.headers.host || '';
  const isProduction = !host.includes('localhost') && !host.includes('vercel.app');
  
  // Base URL for sitemap reference
  const baseUrl = isProduction 
    ? `https://${host}`
    : `https://${host}`;
    
  // Generate robots.txt content
  let content = '';
  
  if (isProduction) {
    // Production environment - allow all crawling
    content = `User-agent: *
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
  } else {
    // Development or preview environment - disallow all crawling
    content = `User-agent: *
Disallow: /

# This is a non-production environment
# Please do not index this site`;
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  
  // Send the robots.txt content
  res.status(200).send(content);
}
