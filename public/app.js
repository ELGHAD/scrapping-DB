// public/app.js — Frontend logic

const searchInput   = document.getElementById('searchInput');
const pagesSelect   = document.getElementById('pagesSelect');
const searchBtn     = document.getElementById('searchBtn');
const statsBar      = document.getElementById('statsBar');
const filterBar     = document.getElementById('filterBar');
const resultsGrid   = document.getElementById('resultsGrid');
const emptyState    = document.getElementById('emptyState');
const loadingState  = document.getElementById('loadingState');
const errorState    = document.getElementById('errorState');
const errorMsg      = document.getElementById('errorMsg');
const btnDownload   = document.getElementById('btnDownload');
const btnHistory    = document.getElementById('btnHistory');
const historyModal  = document.getElementById('historyModal');
const closeHistory  = document.getElementById('closeHistory');
const historyList   = document.getElementById('historyList');
const filterPrice   = document.getElementById('filterPrice');
const filterRating  = document.getElementById('filterRating');
const sortBy        = document.getElementById('sortBy');
const filteredCount = document.getElementById('filteredCount');

let allProducts = []; // store full results for filtering

// ── Search ─────────────────────────────────────────────
searchBtn.addEventListener('click', runSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });

async function runSearch() {
  const query = searchInput.value.trim();
  const pages = parseInt(pagesSelect.value, 10);
  if (!query) { searchInput.focus(); return; }

  showState('loading');
  searchBtn.disabled = true;

  try {
    const res  = await fetch('/api/scrape', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query, pages }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');

    allProducts = data.products;
    renderStats(data.stats);
    applyFilters();
    showState('results');
  } catch (err) {
    showState('error');
    errorMsg.textContent = err.message;
  } finally {
    searchBtn.disabled = false;
  }
}

// ── Filters & sort ─────────────────────────────────────
filterPrice.addEventListener('input',  applyFilters);
filterRating.addEventListener('change', applyFilters);
sortBy.addEventListener('change',       applyFilters);

function applyFilters() {
  const maxPrice  = parseFloat(filterPrice.value)  || Infinity;
  const minRating = parseFloat(filterRating.value) || 0;
  const sort      = sortBy.value;

  let filtered = allProducts.filter(p => {
    const price  = p.price_raw ?? Infinity;
    const rating = p.rating    ?? 0;
    return price <= maxPrice && rating >= minRating;
  });

  // Sort
  if (sort === 'price_asc')   filtered.sort((a,b) => (a.price_raw||999999) - (b.price_raw||999999));
  if (sort === 'price_desc')  filtered.sort((a,b) => (b.price_raw||0)      - (a.price_raw||0));
  if (sort === 'rating')      filtered.sort((a,b) => (b.rating||0)         - (a.rating||0));
  if (sort === 'reviews')     filtered.sort((a,b) => (b.reviews||0)        - (a.reviews||0));
  if (sort === 'position')    filtered.sort((a,b) => (a.position||99)      - (b.position||99));

  filteredCount.textContent = `${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`;
  renderGrid(filtered);
}

// ── Render stats ───────────────────────────────────────
function renderStats(stats) {
  document.getElementById('statTotal').textContent    = stats.total;
  document.getElementById('statAvgPrice').textContent = stats.avgPrice  ? `${stats.avgPrice} MAD`  : '—';
  document.getElementById('statMin').textContent      = stats.minPrice  ? `${stats.minPrice} MAD`  : '—';
  document.getElementById('statMax').textContent      = stats.maxPrice  ? `${stats.maxPrice} MAD`  : '—';
  document.getElementById('statRating').textContent   = stats.avgRating ? `${stats.avgRating} ★`   : '—';
  document.getElementById('statStores').textContent   = stats.stores    ?? '—';
  statsBar.classList.remove('hidden');
  filterBar.classList.remove('hidden');
}

// ── Render grid ────────────────────────────────────────
function renderGrid(products) {
  resultsGrid.innerHTML = '';

  if (!products.length) {
    resultsGrid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:40px">Aucun produit ne correspond aux filtres.</p>`;
    return;
  }

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';

    const stars = p.rating ? renderStars(p.rating) : '';

    card.innerHTML = `
      <img class="card-thumb"
           src="${p.thumbnail || ''}"
           alt="${esc(p.title)}"
           loading="lazy"
           onerror="this.src='https://placehold.co/200x200/13161c/656c82?text=No+Image'"/>
      <div class="card-body">
        <div class="card-title">${esc(p.title)}</div>
        <div class="card-price ${p.price ? '' : 'no-price'}">
          ${p.price ? esc(p.price) : 'Prix non disponible'}
        </div>
        ${p.store    ? `<div class="card-store">🏪 ${esc(p.store)}</div>` : ''}
        ${p.rating   ? `<div class="card-rating"><span class="stars">${stars}</span><span class="review-count">${p.rating} (${p.reviews ?? 0} avis)</span></div>` : ''}
        ${p.delivery ? `<div class="card-delivery">🚚 ${esc(p.delivery)}</div>` : ''}
        ${p.product_link ? `<a class="card-link" href="${p.product_link}" target="_blank" rel="noopener">Voir le produit →</a>` : ''}
      </div>
    `;

    resultsGrid.appendChild(card);
  });
}

// ── Download Excel ─────────────────────────────────────
btnDownload.addEventListener('click', () => {
  window.location.href = '/api/download';
});

// ── History modal ──────────────────────────────────────
btnHistory.addEventListener('click', openHistory);
closeHistory.addEventListener('click', () => historyModal.classList.add('hidden'));
historyModal.addEventListener('click', e => { if (e.target === historyModal) historyModal.classList.add('hidden'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') historyModal.classList.add('hidden'); });

async function openHistory() {
  historyModal.classList.remove('hidden');
  historyList.innerHTML = '<p class="history-empty">Chargement…</p>';
  try {
    const res  = await fetch('/api/history');
    const data = await res.json();

    if (!data.length) {
      historyList.innerHTML = '<p class="history-empty">Aucune recherche enregistrée.</p>';
      return;
    }

    historyList.innerHTML = '';
    data.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML = `
        <div>
          <div class="h-query">${esc(item.query)}</div>
          <div class="h-meta">
            Prix moy: ${item.avg_price ? item.avg_price + ' MAD' : '—'} &nbsp;·&nbsp;
            Note: ${item.avg_rating ?? '—'} &nbsp;·&nbsp;
            ${new Date(item.last_scraped).toLocaleDateString('fr-MA')}
          </div>
        </div>
        <div class="h-count">${item.total}</div>
      `;
      // Click to reload that search from DB
      el.addEventListener('click', async () => {
        historyModal.classList.add('hidden');
        showState('loading');
        try {
          const r    = await fetch(`/api/history/${encodeURIComponent(item.query)}`);
          const rows = await r.json();
          allProducts = rows;
          renderStats({
            total:    rows.length,
            avgPrice: item.avg_price,
            avgRating:item.avg_rating,
            stores:   [...new Set(rows.map(p => p.store).filter(Boolean))].length,
            minPrice: Math.min(...rows.map(p => p.price_raw).filter(Boolean)),
            maxPrice: Math.max(...rows.map(p => p.price_raw).filter(Boolean)),
          });
          applyFilters();
          showState('results');
          searchInput.value = item.query;
        } catch(err) {
          showState('error');
          errorMsg.textContent = err.message;
        }
      });
      historyList.appendChild(el);
    });
  } catch (err) {
    historyList.innerHTML = `<p class="history-empty">Erreur: ${err.message}</p>`;
  }
}

// ── Helpers ────────────────────────────────────────────
function showState(state) {
  emptyState.classList.add('hidden');
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  resultsGrid.classList.add('hidden');

  if (state === 'empty')   emptyState.classList.remove('hidden');
  if (state === 'loading') loadingState.classList.remove('hidden');
  if (state === 'error')   errorState.classList.remove('hidden');
  if (state === 'results') resultsGrid.classList.remove('hidden');
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function esc(str = '') {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}