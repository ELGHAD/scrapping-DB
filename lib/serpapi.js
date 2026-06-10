// lib/serpapi.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

function fetchShopping(query, start = 0, apiKey) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      engine:  'google_shopping',
      q:       query,
      api_key: apiKey,
      start:   String(start),
      num:     '10',
     
      hl:      'fr',   // French — change to 'ar' for Arabic
    });

    const req = https.request(
      { hostname: 'serpapi.com', path: `/search.json?${params}`, method: 'GET' },
      (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            if (json.error) return reject(new Error(`SerpAPI: ${json.error}`));
            const products = (json.shopping_results || []).map(item => ({
              position:     item.position  ?? null,
              title:        item.title     || '',
              price:        item.price     || null,
              price_raw:    extractPrice(item.price),
              currency:     extractCurrency(item.price),
              rating:       item.rating    ?? null,
              reviews:      item.reviews   ?? null,
              store:        item.source    || '',
              product_link: item.link      || '',
              thumbnail:    item.thumbnail || '',
              delivery:     item.delivery  || null,
              condition:    item.second_hand_condition || 'new',
              scraped_at:   new Date().toISOString(),
              query,
            }));
            resolve(products);
          } catch (e) {
            reject(new Error('Failed to parse SerpAPI response: ' + e.message));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function extractPrice(str) {
  if (!str) return null;
  const m = str.replace(/,/g, '').replace(/\s/g, '').match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

function extractCurrency(str) {
  if (!str) return null;
  if (str.includes('MAD') || str.includes('DH')) return 'MAD';
  if (str.includes('$'))  return 'USD';
  if (str.includes('€'))  return 'EUR';
  if (str.includes('£'))  return 'GBP';
  return null;
}

module.exports = { fetchShopping };