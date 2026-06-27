import { ScrollBox } from '../../shared/components/scroll-box.js';

const STORES = [
  { key: 'chrome',  name: 'Chrome Web Store', accent: 'var(--store-chrome)'  },
  { key: 'firefox', name: 'Firefox Add-ons',  accent: 'var(--store-firefox)' },
  { key: 'edge',    name: 'Edge Add-ons',     accent: 'var(--store-edge)'    },
  { key: 'opera',   name: 'Opera Add-ons',    accent: 'var(--store-opera)'   },
];

export async function init() {
  const grid   = document.getElementById('rv-grid');
  const select = document.getElementById('rv-ext');
  const meta   = document.getElementById('rv-meta');

  let data;
  try {
    data = await (await fetch('reviews.json', { cache: 'no-store' })).json();
  } catch {
    grid.innerHTML = '<div class="sb-empty">Couldn\'t load reviews.json yet — waiting for the first scrape.</div>';
    return;
  }

  if (data.generatedAt) meta.textContent = `generated ${new Date(data.generatedAt).toLocaleString()}`;

  const slugs = Object.keys(data.extensions);
  select.innerHTML = slugs.map(s => `<option value="${escAttr(s)}">${escHtml(data.extensions[s].name || s)}</option>`).join('');

  // Build the four store boxes once; re-render their bodies on selection change.
  grid.innerHTML = '';
  const boxes = {};
  for (const s of STORES) {
    const mount = document.createElement('div');
    grid.appendChild(mount);
    boxes[s.key] = new ScrollBox(mount, { title: s.name, accent: s.accent });
  }

  function render(slug) {
    const ext = data.extensions[slug];
    for (const s of STORES) {
      const store   = ext.stores[s.key] || {};
      const reviews = store.reviews || [];
      const body = store.error
        ? `<div class="sb-empty">${escHtml(store.error)}</div>`
        : reviews.length
          ? reviews.map(renderReview).join('')
          : '<div class="sb-empty">No reviews.</div>';
      boxes[s.key].setHTML(body);
      boxes[s.key].setCount(
        store.error ? '—'
        : store.windowDays ? `${reviews.length} in ${store.windowDays}d · ${store.total} total`
        : `${reviews.length}${store.total ? ` / ${store.total}` : ''}`
      );
    }
  }

  select.onchange = () => render(select.value);
  render(slugs[0]);
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

// Exposed for the <img onerror> avatar fallback.
window.rvInitial = function (name) {
  const el = document.createElement('div');
  el.className = 'rv-avatar rv-initial';
  el.textContent = (name || '?').charAt(0).toUpperCase();
  return el;
};

function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) { return String(s).replace(/"/g, '&quot;'); }
