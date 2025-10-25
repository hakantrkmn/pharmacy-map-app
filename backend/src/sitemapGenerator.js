/**
 * Dynamic Sitemap Generator for İzmir Nöbetçi Eczane
 * Generates sitemap with date-based URLs for better SEO
 */

const BASE_URL = 'https://izmir-nobetci-eczane.vercel.app';

/**
 * Generate date-based URLs for the last 7 days and next 7 days
 * @returns {Array} Array of URL objects with date parameters
 */
function generateDateUrls() {
  const urls = [];
  const today = new Date();
  
  // Add main page
  urls.push({
    loc: BASE_URL,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '1.0'
  });
  
  // Generate URLs for the last 7 days and next 7 days
  for (let i = -7; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    // Calculate priority based on how close the date is to today
    let priority = '0.8';
    if (i === 0) priority = '1.0'; // Today
    else if (i === 1) priority = '0.9'; // Tomorrow
    else if (i === -1) priority = '0.9'; // Yesterday
    else if (Math.abs(i) <= 3) priority = '0.8'; // Within 3 days
    else priority = '0.7'; // Further dates
    
    urls.push({
      loc: `${BASE_URL}/?date=${dateString}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: priority
    });
  }
  
  return urls;
}

/**
 * Generate the complete sitemap XML
 * @returns {string} Complete sitemap XML
 */
function generateSitemap() {
  const urls = generateDateUrls();
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  urls.forEach(url => {
    sitemap += `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  });
  
  sitemap += `
</urlset>`;
  
  return sitemap;
}

/**
 * Get sitemap with proper headers for Vercel
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export function serveSitemap(req, res) {
  const sitemap = generateSitemap();
  
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.status(200).send(sitemap);
}

export { generateSitemap };
