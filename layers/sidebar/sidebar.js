import { loadView } from '../../app/router.js';
import { NAV_ITEMS } from '../../shared/nav.js';

function buildNav(active) {
  return NAV_ITEMS.map((item, i) => `
    <div class="nav-item${item.view === active ? ' active' : ''}" data-i="${i}">
      <i class="ti ${item.icon}"></i>
      <span class="nav-label">${item.label}</span>
    </div>`).join('');
}

export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const wrapper = document.querySelector('.window-wrapper');
  const active  = sessionStorage.getItem('activeView') || 'reviews';

  // ── Desktop sidebar ──
  sidebar.innerHTML = `
    <nav class="sidebar-nav">${buildNav(active)}</nav>
    <button class="sidebar-toggle" title="Toggle sidebar"><i class="ti ti-chevron-left"></i></button>`;

  // ── Mobile drawer ──
  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-backdrop';
  document.body.appendChild(backdrop);

  const drawer = document.createElement('nav');
  drawer.className = 'mobile-drawer';
  drawer.innerHTML = buildNav(active);
  document.body.appendChild(drawer);

  const hamburger = document.createElement('button');
  hamburger.className = 'mobile-hamburger';
  hamburger.title = 'Menu';
  hamburger.innerHTML = '<i class="ti ti-menu-2"></i>';
  document.body.appendChild(hamburger);

  const openDrawer  = () => { drawer.classList.add('open');  backdrop.classList.add('open'); };
  const closeDrawer = () => { drawer.classList.remove('open'); backdrop.classList.remove('open'); };
  hamburger.addEventListener('click', openDrawer);
  backdrop.addEventListener('click', closeDrawer);

  function wire(container, alsoClose) {
    container.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => {
        const item = NAV_ITEMS[+el.dataset.i];
        if (!item.view) return;
        if (alsoClose) closeDrawer();
        loadView(item.view);
      });
    });
  }
  wire(sidebar, false);
  wire(drawer, true);

  // ── Collapse toggle ──
  sidebar.querySelector('.sidebar-toggle')
    .addEventListener('click', () => wrapper.classList.toggle('sidebar-collapsed'));

  const mq = window.matchMedia('(max-width: 768px)');
  mq.addEventListener('change', e => wrapper.classList.toggle('sidebar-collapsed', e.matches));
  if (mq.matches) wrapper.classList.add('sidebar-collapsed');

  // ── Keep active item in sync with the router ──
  window.addEventListener('view:changed', e => {
    [sidebar, drawer].forEach(c => c.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', NAV_ITEMS[+n.dataset.i].view === e.detail.name);
    }));
  });
}
