// Reusable scrolling panel. One class, many instances — each parameterized by
// title / accent / count. The accent is exposed as the --box-accent CSS var so
// styling (and any child like review cards) can theme off it.
import { loadCSS } from '../util/load-assets.js';

// Self-load styling so any consumer gets it automatically (idempotent).
loadCSS('shared/components/scroll-box.css');

export class ScrollBox {
  constructor(mount, { title = '', accent = 'var(--accent)', count = '' } = {}) {
    this.mount = mount;
    mount.classList.add('scroll-box');
    if (accent) mount.style.setProperty('--box-accent', accent);
    mount.innerHTML = `
      <div class="sb-head">
        <span class="sb-title">${esc(title)}</span>
        <span class="sb-count">${esc(count)}</span>
      </div>
      <div class="sb-body"></div>`;
    this.bodyEl  = mount.querySelector('.sb-body');
    this.countEl = mount.querySelector('.sb-count');
  }

  setCount(text) { this.countEl.textContent = text; }
  setHTML(html)  { this.bodyEl.innerHTML = html; }
  clear()        { this.bodyEl.innerHTML = ''; }
  append(html)   { this.bodyEl.insertAdjacentHTML('beforeend', html); }
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
