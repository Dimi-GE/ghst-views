// Public Pages front-end. Render-only: loads reviews.json (pushed in by the
// private scraper's Action) and shows it. No scraping logic ships here.

const STORE_NAMES = {
  chrome:  'Chrome Web Store',
  firefox: 'Firefox Add-ons',
  edge:    'Edge Add-ons',
  opera:   'Opera Add-ons',
};
const ORDER = ['chrome', 'firefox', 'edge', 'opera'];

init();

async function init() {
  let data;
  try {
    data = await (await fetch('./reviews.json', { cache: 'no-store' })).json();
  } catch (e) {
    document.getElementById('grid').innerHTML =
      `<div class="box-empty">Couldn't load reviews.json yet — waiting for the first scrape.</div>`;
    return;
  }

  const meta = document.getElementById('meta');
  if (data.generatedAt) meta.textContent = `generated ${new Date(data.generatedAt).toLocaleString()}`;

  const select = document.getElementById('ext-select');
  const slugs  = Object.keys(data.extensions);
  select.innerHTML = slugs.map(s => `<option value="${s}">${escHtml(data.extensions[s].name || s)}</option>`).join('');
  select.onchange = () => renderExtension(data.extensions[select.value]);

  renderExtension(data.extensions[slugs[0]]);
}

function renderExtension(ext) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (const key of ORDER) {
    const store = ext.stores[key] || {};
    const reviews = store.reviews || [];

    const body = store.error
      ? `<div class="box-empty">${escHtml(store.error)}</div>`
      : reviews.length
        ? reviews.map(renderReview).join('')
        : '<div class="box-empty">No reviews.</div>';

    const countLabel = store.error
      ? '—'
      : store.windowDays
        ? `${reviews.length} in ${store.windowDays}d · ${store.total} total`
        : `${reviews.length}${store.total ? ` / ${store.total}` : ''}`;

    grid.insertAdjacentHTML('beforeend', `
      <div class="box">
        <div class="box-head">
          <span class="box-title">${STORE_NAMES[key]}</span>
          <span class="box-count">${countLabel}</span>
        </div>
        <div class="box-list">${body}</div>
      </div>`);
  }
}

function renderReview(r) {
  const avatar = r.avatar
    ? `<img class="rv-avatar" src="${escAttr(r.avatar)}" alt="" onerror="this.replaceWith(rvInitial('${escAttr(r.name)}'))">`
    : `<div class="rv-avatar rv-initial">${escHtml((r.name || '?').charAt(0).toUpperCase())}</div>`;

  const stars = typeof r.rating === 'number'
    ? Array.from({ length: 5 }, (_, i) =>
        `<svg class="rv-star ${i < r.rating ? 'on' : 'off'}" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>`).join('')
    : '';

  return `
    <div class="rv">
      <div class="rv-head">
        ${avatar}
        <div class="rv-meta">
          <div class="rv-name">${escHtml(r.name)}</div>
          <div class="rv-sub">
            <span>${escHtml(r.date)}</span>
            ${r.lang    ? `<span class="rv-badge">${escHtml(r.lang)}</span>` : ''}
            ${r.version ? `<span>v${escHtml(r.version)}</span>` : ''}
          </div>
        </div>
        <div class="rv-stars">${stars}</div>
      </div>
      <div class="rv-text">${escHtml(r.text)}</div>
    </div>`;
}

window.rvInitial = function (name) {
  const el = document.createElement('div');
  el.className = 'rv-avatar rv-initial';
  el.textContent = (name || '?').charAt(0).toUpperCase();
  return el;
};

function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return String(s).replace(/"/g, '&quot;'); }
