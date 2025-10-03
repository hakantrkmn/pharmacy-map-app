import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import redisCache from './redis.js';

/**
 * Fetch pharmacy data from İzmir Eczacı Odası website
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Array of pharmacy objects
 */
async function fetchPharmaciesFromWebsite(date) {
  try {
    console.log(`Fetching pharmacy data for date: ${date}`);
    
    // Prepare form data for POST request
    const formData = new URLSearchParams();
    formData.append('tarih1', date);
    formData.append('ilce', ''); // All districts
    formData.append('gnr', 'Kayıt Ara');
    
    // Fetch data from İzmir Eczacı Odası website
    const response = await fetch('https://www.izmireczaciodasi.org.tr/nobetci-eczaneler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const pharmacies = parsePharmacyData(html);
    
    console.log(`Fetched ${pharmacies.length} pharmacies from website`);
    return pharmacies;
  } catch (error) {
    console.error('Error fetching pharmacy data from website:', error);
    throw error;
  }
}

/**
 * Parse pharmacy data from HTML content
 * @param {string} html - HTML content from the website
 * @returns {Array} Array of pharmacy objects
 */
function parsePharmacyData(html) {
  const pharmacies = [];
  const seenPharmacies = new Set();

  // Create DOM from HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find all pharmacy containers
  const pharmacyElements = document.querySelectorAll('div.col_10_of_12');

  pharmacyElements.forEach((element) => {
    const h4Element = element.querySelector('h4 strong');
    const pElement = element.querySelector('p');

    if (h4Element && pElement) {
      // Extract pharmacy name and location from h4
      // Format: "ECZANE ADI - TARİH / BÖLGE"
      const h4Text = h4Element.textContent?.trim() || '';
      const nameLocationMatch = h4Text.match(/^(.+?)\s*-\s*\d{2}\.\d{2}\.\d{4}\s*\/\s*(.+)$/);

      if (nameLocationMatch) {
        const pharmacyName = cleanText(nameLocationMatch[1].replace('ECZANESİ', '').trim());
        const location = cleanText(nameLocationMatch[2]);

        // Extract phone from tel link
        const phoneLink = pElement.querySelector('a[href^="tel:"]');
        const phone = phoneLink ? normalizePhone(phoneLink.textContent?.trim() || '') : '';

        // Extract address - first line after the home icon
        const addressMatch = pElement.textContent?.match(/fa-home main-color[^>]*>([^<]+)/);
        const address = addressMatch ? cleanText(addressMatch[1]) : '';

        // Extract coordinates from Google Maps link
        const mapLink = pElement.querySelector('a[href*="google.com/maps"]');
        let coordinates = null;
        if (mapLink) {
          const href = mapLink.getAttribute('href') || '';
          const coordMatch = href.match(/q=([0-9.-]+),([0-9.-]+)/);
          if (coordMatch) {
            coordinates = {
              latitude: parseFloat(coordMatch[1]),
              longitude: parseFloat(coordMatch[2])
            };
          }
        }

        // Check for special notes (like time restrictions)
        const notesMatch = pElement.textContent?.match(/\*\s*\(([^)]+)\)/);
        const notes = notesMatch ? cleanText(notesMatch[1]) : '';

        // Create unique key to avoid duplicates
        const uniqueKey = `${pharmacyName}-${location}-${phone}`;

        if (pharmacyName && location && !seenPharmacies.has(uniqueKey)) {
          seenPharmacies.add(uniqueKey);
          pharmacies.push({
            name: pharmacyName,
            location: location,
            address: address,
            phone: phone,
            notes: notes,
            coordinates: coordinates,
            mapLink: mapLink ? mapLink.getAttribute('href') || '' : '',
            extractedAt: new Date().toISOString()
          });
        }
      }
    }
  });

  return pharmacies;
}

/**
 * Cleans text by removing extra whitespace and formatting
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes phone number to standard Turkish format
 * @param {string} phone - Phone number to normalize
 * @returns {string} Normalized phone number
 */
function normalizePhone(phone) {
  if (!phone) return '';
  
  // Remove all spaces and non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If it's 10 digits and starts with area code, add leading 0
  if (cleanPhone.length === 10 && /^[2-5]/.test(cleanPhone)) {
    return '0' + cleanPhone;
  }
  
  // If it's 11 digits and starts with 0, return as is
  if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    return cleanPhone;
  }
  
  return cleanPhone;
}

/**
 * Get pharmacy data with Redis caching
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Array of pharmacy objects
 */
export async function getPharmacies(date) {
  try {
    // First, try to get data from cache
    let pharmacies = await redisCache.getPharmacies(date);
    
    if (pharmacies) {
      return pharmacies;
    }
    
    // If not in cache, fetch from website
    pharmacies = await fetchPharmaciesFromWebsite(date);
    
    // Cache the data for 24 hours
    await redisCache.setPharmacies(date, pharmacies, 24 * 60 * 60);
    
    return pharmacies;
  } catch (error) {
    console.error('Error getting pharmacies:', error);
    throw error;
  }
}

export { fetchPharmaciesFromWebsite, parsePharmacyData };
