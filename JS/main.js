import './firebase-init.js';
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
    
    // 關鍵修正：宣告 searchBtn 但不強求它一定要存在
    const searchBtn = document.getElementById('search-btn');

    if (menuBtn) menuBtn.onclick = toggleMenu;
    if (closeBtn) closeBtn.onclick = toggleMenu;

    // 嚴格的安全判斷：只有找到按鈕時，才綁定事件，這就是模組化需要的穩定性
    if (searchBtn) {
        searchBtn.onclick = handleTrack;
    }

    window.addEventListener('resize', updateHeroBanner);
});

// /* 預留 */ 區塊已保留，邏輯執行順序已修正