// ESM view router. A view lives in views/<name>/ as <name>.html/.css/.js,
// where the JS module exports `init(container)`. Navigation: fetch the HTML,
// inject the CSS, dynamic-import the module, run init, announce the change.
import { loadCSS } from '../shared/util/load-assets.js';

let current = null;

export async function loadView(name) {
  if (name === current) return;
  const content = document.getElementById('content');
  content.innerHTML = '<div class="view-loading"><div class="loader-ring"></div></div>';

  try {
    await loadCSS(`views/${name}/${name}.css`);
    const html = await fetch(`views/${name}/${name}.html`).then(r => {
      if (!r.ok) throw new Error(`View not found: ${name}`);
      return r.text();
    });
    content.innerHTML = html;

    const mod = await import(`../views/${name}/${name}.js`);
    await mod.init?.(content);

    current = name;
    sessionStorage.setItem('activeView', name);
    window.dispatchEvent(new CustomEvent('view:changed', { detail: { name } }));
  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="view-error"><h2>Couldn't load &ldquo;${name}&rdquo;</h2><p>${err.message}</p></div>`;
  }
}
