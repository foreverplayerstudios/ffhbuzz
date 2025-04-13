/**
 * Script to generate the default Open Graph image
 * Run with: node scripts/generate-og-image.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateOGImage() {
  console.log('Generating default Open Graph image...');

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
      deviceScaleFactor: 2, // Higher resolution for sharper image
    });

    // Get the absolute path to the HTML template
    const templatePath = path.join(__dirname, '..', 'public', 'images', 'og-template.html');
    const fileUrl = `file://${templatePath}`;
    
    console.log(`Using template at: ${templatePath}`);
    
    // Navigate to the template file
    await page.goto(fileUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait a bit for any animations to complete
    await page.waitForTimeout(200);
    
    // Take screenshot
    const screenshotBuffer = await page.screenshot({ 
      type: 'png'
    });
    
    // Output paths
    const outputJpg = path.join(__dirname, '..', 'public', 'og-image.jpg');
    
    // Use sharp to convert to JPG with compression
    await sharp(screenshotBuffer)
      .jpeg({ 
        quality: 85,
        progressive: true
      })
      .toFile(outputJpg);
    
    console.log(`✅ Open Graph image generated at: ${outputJpg}`);
    
  } catch (error) {
    console.error('❌ Error generating Open Graph image:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the image generation
generateOGImage().catch(error => {
  console.error('Failed to generate OG image:', error);
  process.exit(1);
});
