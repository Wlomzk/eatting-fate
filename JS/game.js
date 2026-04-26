// --- [ 1. 手機版全螢幕選單控制 ] ---
window.toggleMenu = function() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;

    // 切換 hidden (隱藏) 與 flex (顯示)
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
        // 防止選單打開時，後面的網頁還能滾動
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        // 恢復網頁滾動
        document.body.style.overflow = '';
    }
};

// --- [ 2. 核心資料與成就系統 ] ---
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
    resultArea.style.display = 'block';

    fetch('data/items.json')
        .then(response => {
            if (!response.ok) throw new Error('無法讀取資料庫');
            return response.json();
        })
        .then(db => {
            if (db[keyword]) {
                const item = db[keyword];
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
        })
        .catch(error => {
            console.error('系統錯誤:', error);
            resultContent.innerHTML = "系統連線異常，請稍後再試。";
        });
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

// --- [ 3. 頁面切換邏輯 ] ---
window.showPage = function(pageName) {
    const pages = ['page-home', 'page-services', 'page-locations'];
    
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    const target = document.getElementById('page-' + pageName);
    if (target) target.classList.remove('hidden');
    
    // 如果是手機選單開啟狀態下跳轉，自動關閉選單
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        toggleMenu();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- [ 4. 事件監聽初始化 ] ---
document.addEventListener('DOMContentLoaded', () => {
    renderArchive();

    // 綁定選單按鈕
    const menuBtn = document.getElementById('mobile-menu-button');
    const closeBtn = document.getElementById('close-menu');
    const overlay = document.getElementById('menu-overlay');

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
});