import { toggleMenu, showPage, updateHeroBanner } from './ui.js';
import { handleTrack, renderArchive } from './archive.js';

// 將函數掛載到 window，讓 HTML 的 onclick 可以呼叫到它們
window.toggleMenu = toggleMenu;
window.showPage = showPage;
window.handleTrack = handleTrack;

document.addEventListener('DOMContentLoaded', () => {
    renderArchive();
    updateHeroBanner();

    const menuBtn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('close-menu');

    if (menuBtn) menuBtn.onclick = toggleMenu;
    if (closeBtn) closeBtn.onclick = toggleMenu;

    window.addEventListener('resize', updateHeroBanner);
});