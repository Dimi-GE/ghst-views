import { initSidebar } from '../layers/sidebar/sidebar.js';
import { initHeader } from '../layers/header/header.js';
import { loadView } from './router.js';

initSidebar();
initHeader();
loadView(sessionStorage.getItem('activeView') || 'reviews');
