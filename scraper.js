// scraper.js — CLI entry point (optional, server.js is the main way)
// Usage: node scraper.js "coffee" --pages 2 --excel-only
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const args    = require('./lib/args');
const serpapi = require('./lib/serpapi');
const db      = require('./lib/db');
const excel   = require('./lib/excel');

const CONFIG = {
  SERPAPI_KEY: '',  // ← replace
  EXCEL_PATH:  './output/products.xlsx',
};

async function main() {
  const { query, pages, excelOnly, dbOnly } = args.parse(process.argv.slice(2));
  if (!query) { console.error('Usage: node scraper.js "query"'); process.exit(1); }

  console.log(`\n🔍  Searching: "${query}" (${pages} page(s))\n`);
  let allProducts = [];
  for (let page = 0; page < pages; page++) {
    process.stdout.write(`   Fetching page ${page+1}/${pages}...`);
    const products = await serpapi.fetchShopping(query, page * 10, CONFIG.SERPAPI_KEY);
    allProducts = allProducts.concat(products);
    console.log(` ✓ (${products.length} products)`);
  }

  if (!allProducts.length) { console.log('\n⚠️  No products found.'); process.exit(0); }
  console.log(`\n📦  Total: ${allProducts.length} products\n`);

  if (!excelOnly) { try { await db.save(allProducts, query); console.log('✅  Saved to PostgreSQL'); } catch(e) { console.error('❌  DB error:', e.message); } }
  if (!dbOnly)    { try { await excel.export(allProducts, query, CONFIG.EXCEL_PATH); console.log(`✅  Excel → ${CONFIG.EXCEL_PATH}`); } catch(e) { console.error('❌  Excel error:', e.message); } }
  console.log('\n🎉  Done!\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });