// JS/game.js

// 1. 引入倉庫
import { ARCHIVE_DATABASE } from '../data/keyword.js';

// --- [ 1. 全域工具函數：背景校準 ] ---
// 將背景更新邏輯移入 JS，確保換頁時能同步觸發
function updateHeroBanner() {
    const hero = document.getElementById('page-home');
    if (!hero) return;
    const isMobile = (window.innerWidth < 768);
    const img = isMobile ? "image/index-mobile.webp" : "image/hero-bg.webp";
    hero.style.backgroundImage = `url('${img}')`;
    hero.style.backgroundSize = "cover";
    hero.style.backgroundPosition = "center";
}

// --- [ 2. 手機版全螢幕選單控制 - 拉姆大一統版 ] ---
window.toggleMenu = function() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;

    // 直接抓取當前的 display 狀態，無視所有外部 CSS 的隱藏干擾
    const isHidden = window.getComputedStyle(mobileMenu).display === 'none';

    if (isHidden) {
        // 使用 setProperty 的最高優先級，強行開啟選單
        mobileMenu.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden'; // 防止背景捲動
    } else {
        mobileMenu.style.setProperty('display', 'none', 'important');
        document.body.style.overflow = '';
    }
};

// --- [ 3. 頁面切換邏輯 - 解決跑版關鍵 ] ---
window.showPage = function(pageName) {
    // A. 所有的區塊 ID 清單
    const pages = ['page-home', 'page-services', 'page-locations'];
    
    // B. 徹底清除所有區塊的顯示狀態
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = ''; 
        }
    });
    
    // C. 顯示指定的區塊
    const target = document.getElementById('page-' + pageName);
    if (target) {
        target.classList.remove('hidden');
        
        if (pageName === 'home') {
            // 🚀 關鍵修正：加入 flex-col，讓內容乖乖從上往下排
            target.style.display = 'flex';
            target.style.flexDirection = 'column'; 
            updateHeroBanner();
        } else {
            target.style.display = 'block';
        }
    }
    
    // D. 換頁後如果手機選單開著，自動關閉
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && window.getComputedStyle(mobileMenu).display !== 'none') {
        toggleMenu();
    }
    
    // E. 畫面平滑位置重置
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- [ 4. 核心資料與成就系統 ] ---
let unlockedItems = JSON.parse(localStorage.getItem('guixin_archive')) || [];

window.handleTrack = function() {
    const input = document.getElementById('trackInput');
    const resultContent = document.getElementById('result-content');
    const resultArea = document.getElementById('search-result');
    
    if (!input || !input.value.trim()) {
        alert("請輸入貨物檢索碼");
        return;
    }

    const keyword = input.value.trim();
    if (resultArea) resultArea.style.display = 'block';

    const item = ARCHIVE_DATABASE[keyword];

    if (item) {
        resultContent.innerHTML = `<span style="color: #3d3832; font-weight: bold;">【檢索成功】</span><br>「${item.title}」：${item.content}`;
        resultContent.style.color = '#3d3832';

        if (!unlockedItems.includes(keyword)) {
            unlockedItems.push(keyword);
            localStorage.setItem('guixin_archive', JSON.stringify(unlockedItems));
        }
        renderArchive();
    } else {
        resultContent.innerHTML = `<span style="color: #7f1d1d; font-weight: bold;">【查無此物】</span><br>警告：檢索碼「${keyword}」不存在於當前緯度。`;
        resultContent.style.color = '#7f1d1d';
    }
};

function renderArchive() {
    const archiveSection = document.getElementById('archive-section');
    const keywordList = document.getElementById('keyword-list');
    const completionRate = document.getElementById('completion-rate');

    if (!archiveSection || !keywordList) return;

    if (unlockedItems.length > 0) {
        archiveSection.classList.remove('hidden');
        keywordList.innerHTML = unlockedItems.map(item => 
            `<span class="px-3 py-1 bg-[#d9d4cc] text-[#3d3832] text-xs rounded border border-stone-300 shadow-sm animate-fade-in">${item}</span>`
        ).join('');
        completionRate.innerText = `PROGRESS: ${unlockedItems.length} / 25`;
    }
}

// --- [ 5. 事件監聽初始化 ] ---
document.addEventListener('DOMContentLoaded', () => {
    renderArchive();
    updateHeroBanner(); // 啟動時跑一次背景判定

    // 重新綁定監聽器，確保 HTML 上的 onclick 失效時還能運作
    const menuBtn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('close-menu');

    if (menuBtn) menuBtn.onclick = toggleMenu;
    if (closeBtn) closeBtn.onclick = toggleMenu;

    // 視窗大小改變時更新背景
    window.addEventListener('resize', updateHeroBanner);
});