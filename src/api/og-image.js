/**
 * Dynamic Open Graph Image Generator
 * This handler generates dynamic Open Graph images for social sharing
 */

// Import required puppeteer only on server-side
const puppeteer = typeof window === 'undefined' ? require('puppeteer') : null;

/**
 * Generate a dynamic Open Graph image from the HTML template
 * @param {Object} params - Parameters to customize the image
 * @returns {Promise<Buffer>} - Image buffer
 */
export async function generateOGImage(params = {}) {
  if (!puppeteer) {
    throw new Error('Cannot generate OG image on client side');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport to match OG image dimensions
    await page.setViewport({
      width: 1200,
      height: 630,
      deviceScaleFactor: 1,
    });

    // Build URL with query parameters
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://freefilmhub.buzz';
    
    // Construct URL with query parameters for dynamic content
    let url = `${baseUrl}/images/og-template.html`;
    
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      url += `?${searchParams.toString()}`;
    }

    // Navigate to the template
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Wait for any animations to complete
    await page.waitForTimeout(100);
    
    // Take screenshot
    const buffer = await page.screenshot({ 
      type: 'jpeg',
      quality: 90
    });
    
    return buffer;
  } finally {
    await browser.close();
  }
}

/**
 * API Route handler for OG image generation
 */
export default async function handler(req, res) {
  try {
    const params = req.query;
    
    // Generate OG image
    const imageBuffer = await generateOGImage(params);
    
    // Set cache headers (cache for 1 day)
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Content-Type', 'image/jpeg');
    
    // Send the image
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error generating OG image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
