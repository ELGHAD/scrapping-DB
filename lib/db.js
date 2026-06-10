// lib/db.js
const { Client } = require('pg');

const DB_CONFIG = {
  host:     'localhost',
  port:     5433,            // ← change to 5433 if needed
  database: '',   // ← your DB name
  user:     '',     // ← your user
  password: '', // ← your password
};

async function save(products, query) {
  const client = new Client(DB_CONFIG);
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id           SERIAL PRIMARY KEY,
        position     INT,
        title        TEXT          NOT NULL,
        price        VARCHAR(50),
        price_raw    NUMERIC(10,2),
        currency     VARCHAR(10),
        rating       NUMERIC(3,1),
        reviews      INT,
        store        TEXT,
        product_link TEXT          UNIQUE,
        thumbnail    TEXT,
        delivery     TEXT,
        condition    TEXT DEFAULT 'new',
        query        TEXT,
        scraped_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    let inserted = 0;
    for (const p of products) {
      const r = await client.query(
        `INSERT INTO products
           (position,title,price,price_raw,currency,rating,reviews,store,product_link,thumbnail,delivery,condition,query,scraped_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (product_link) DO NOTHING`,
        [p.position,p.title,p.price,p.price_raw,p.currency,p.rating,p.reviews,p.store,p.product_link,p.thumbnail,p.delivery,p.condition,p.query,p.scraped_at]
      );
      if (r.rowCount > 0) inserted++;
    }
    console.log(`   DB: ${inserted} inserted, ${products.length - inserted} skipped`);
  } finally {
    await client.end();
  }
}

async function fetchAll(query) {
  const client = new Client(DB_CONFIG);
  await client.connect();
  try {
    const r = await client.query(
      query
        ? 'SELECT * FROM products WHERE query=$1 ORDER BY scraped_at DESC'
        : 'SELECT * FROM products ORDER BY scraped_at DESC',
      query ? [query] : []
    );
    return r.rows;
  } finally {
    await client.end();
  }
}

async function getHistory() {
  const client = new Client(DB_CONFIG);
  await client.connect();
  try {
    const r = await client.query(`
      SELECT
        query,
        COUNT(*)                          AS total,
        ROUND(AVG(price_raw)::numeric, 2) AS avg_price,
        ROUND(AVG(rating)::numeric,    1) AS avg_rating,
        MAX(scraped_at)                   AS last_scraped
      FROM products
      GROUP BY query
      ORDER BY last_scraped DESC
    `);
    return r.rows;
  } finally {
    await client.end();
  }
}

module.exports = { save, fetchAll, getHistory };