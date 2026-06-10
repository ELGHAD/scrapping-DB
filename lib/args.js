// lib/args.js
function parse(argv) {
  const flags = { query: null, pages: 1, excelOnly: false, dbOnly: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if      (arg === '--pages' && argv[i+1]) flags.pages     = parseInt(argv[++i], 10) || 1;
    else if (arg === '--excel-only')         flags.excelOnly = true;
    else if (arg === '--db-only')            flags.dbOnly    = true;
    else if (!arg.startsWith('--'))         flags.query     = arg;
  }
  return flags;
}
module.exports = { parse };