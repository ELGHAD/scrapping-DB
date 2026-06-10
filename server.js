// server.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const path    = require('path');
const fs      = require('fs');
const serpapi = require('./lib/serpapi');
const db      = require('./lib/db');
const excel   = require('./lib/excel');

const app  = express();
const PORT = 3000;

const CONFIG = {
  SERPAPI_KEY: 'a2493c97dd86b47b8fca5ec872114c203c345958846d0123bc21ff23b175e024',  // ← replace with your key
  EXCEL_PATH:  './output/products.xlsx',
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /api/scrape
app.post('/api/scrape', async (req, res) => {
  const { query, pages = 1 } = req.body;
  if (!query || !query.trim()) return res.status(400).json({ error: 'Query is required.' });
  try {
    let allProducts = [];
    for (let page = 0; page < pages; page++) {
      const products = await serpapi.fetchShopping(query.trim(), page * 10, CONFIG.SERPAPI_KEY);
      allProducts = allProducts.concat(products);
    }
    await db.save(allProducts, query.trim());
    await excel.export(allProducts, query.trim(), CONFIG.EXCEL_PATH);
    const prices  = allProducts.map(p => p.price_raw).filter(Boolean);
    const ratings = allProducts.map(p => p.rating).filter(Boolean);
    res.json({
      products: allProducts,
      stats: {
        total:     allProducts.length,
        avgPrice:  prices.length  ? +(prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(2)   : null,
        avgRating: ratings.length ? +(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : null,
        stores:    [...new Set(allProducts.map(p => p.store).filter(Boolean))].length,
        minPrice:  prices.length  ? Math.min(...prices) : null,
        maxPrice:  prices.length  ? Math.max(...prices) : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/download
app.get('/api/download', (req, res) => {
  const filePath = path.resolve(CONFIG.EXCEL_PATH);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'No Excel file yet.' });
  res.download(filePath, 'products.xlsx');
});

// GET /api/history
app.get('/api/history', async (req, res) => {
  try { res.json(await db.getHistory()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/history/:query
app.get('/api/history/:query', async (req, res) => {
  try { res.json(await db.fetchAll(decodeURIComponent(req.params.query))); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`\n✅  Server running → http://localhost:${PORT}\n`));