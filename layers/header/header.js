import { NAV_ITEMS } from '../../shared/nav.js';

export function initHeader() {
  const header = document.getElementById('header');
  header.innerHTML = '<span class="header-title"></span>';
  const titleEl = header.querySelector('.header-title');

  window.addEventListener('view:changed', e => {
    const item = NAV_ITEMS.find(n => n.view === e.detail.name);
    titleEl.textContent = item ? item.label : e.detail.name;
  });
}
