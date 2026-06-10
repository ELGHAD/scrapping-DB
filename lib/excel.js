// lib/excel.js
const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

async function exportToExcel(products, query, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const wb   = new ExcelJS.Workbook();
  wb.creator = 'ShopScraper Maroc';
  wb.created = new Date();

  // ── Sheet 1: Products ──────────────────────────
  const sheet = wb.addWorksheet('Products', { views: [{ state: 'frozen', ySplit: 2 }] });

  sheet.mergeCells('A1:N1');
  const titleCell      = sheet.getCell('A1');
  titleCell.value      = `Google Shopping — "${query}" — Maroc`;
  titleCell.font       = { name: 'Arial', bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
  titleCell.fill       = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  titleCell.alignment  = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  const columns = [
    { header: '#',          key: 'position',     width: 5  },
    { header: 'Titre',      key: 'title',        width: 45 },
    { header: 'Prix',       key: 'price',        width: 14 },
    { header: 'Prix (num)', key: 'price_raw',    width: 13 },
    { header: 'Devise',     key: 'currency',     width: 10 },
    { header: 'Note',       key: 'rating',       width: 8  },
    { header: 'Avis',       key: 'reviews',      width: 10 },
    { header: 'Boutique',   key: 'store',        width: 18 },
    { header: 'Livraison',  key: 'delivery',     width: 20 },
    { header: 'État',       key: 'condition',    width: 12 },
    { header: 'Lien',       key: 'product_link', width: 12 },
    { header: 'Miniature',  key: 'thumbnail',    width: 12 },
    { header: 'Recherche',  key: 'query',        width: 18 },
    { header: 'Extrait le', key: 'scraped_at',   width: 22 },
  ];
  sheet.columns = columns;

  const headerRow = sheet.getRow(2);
  headerRow.values = columns.map(c => c.header);
  headerRow.eachCell(cell => {
    cell.font      = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6C63FF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  headerRow.height = 22;

  products.forEach((p, i) => {
    const row = sheet.addRow({
      position: p.position, title: p.title, price: p.price,
      price_raw: p.price_raw, currency: p.currency, rating: p.rating,
      reviews: p.reviews, store: p.store, delivery: p.delivery,
      condition: p.condition, product_link: p.product_link,
      thumbnail: p.thumbnail, query: p.query, scraped_at: p.scraped_at,
    });
    const bg = i % 2 === 0 ? 'FFF5F5FF' : 'FFFFFFFF';
    row.eachCell({ includeEmpty: true }, cell => {
      cell.font      = { name: 'Arial', size: 9 };
      cell.alignment = { vertical: 'middle' };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    });
    if (p.product_link) {
      const lc = row.getCell('product_link');
      lc.value = { text: 'Voir', hyperlink: p.product_link };
      lc.font  = { name: 'Arial', size: 9, color: { argb: 'FF4F46E5' }, underline: true };
    }
    if (p.rating) {
      const rc    = row.getCell('rating');
      const color = p.rating >= 4 ? 'FF16A34A' : p.rating >= 3 ? 'FFD97706' : 'FFDC2626';
      rc.font     = { name: 'Arial', size: 9, bold: true, color: { argb: color } };
    }
    row.height = 18;
  });

  // ── Sheet 2: Summary ───────────────────────────
  const sum = wb.addWorksheet('Résumé');
  sum.columns = [
    { header: 'Indicateur', key: 'metric', width: 28 },
    { header: 'Valeur',     key: 'value',  width: 20 },
  ];
  ['A1','B1'].forEach(addr => {
    const c = sum.getCell(addr);
    c.font      = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    c.alignment = { horizontal: 'center' };
  });
  const d1 = 3, dN = products.length + 2;
  [
    ['Recherche',      query],
    ['Total produits', products.length],
    ['Extrait le',     new Date().toLocaleString('fr-MA')],
    ['Prix moyen',     `=IFERROR(AVERAGE(Products!D${d1}:D${dN}),"-")`],
    ['Prix min',       `=IFERROR(MIN(Products!D${d1}:D${dN}),"-")`],
    ['Prix max',       `=IFERROR(MAX(Products!D${d1}:D${dN}),"-")`],
    ['Note moyenne',   `=IFERROR(AVERAGE(Products!F${d1}:F${dN}),"-")`],
  ].forEach(([metric, value], i) => {
    const row = sum.addRow({ metric, value });
    const bg  = i % 2 === 0 ? 'FFF5F5FF' : 'FFFFFFFF';
    row.eachCell(cell => {
      cell.font = { name: 'Arial', size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    });
    row.getCell('metric').font = { name: 'Arial', size: 10, bold: true };
  });

  await wb.xlsx.writeFile(outputPath);
}

module.exports = { export: exportToExcel };