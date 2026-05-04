// --- UI 相關邏輯 ---

export function updateHeroBanner() {
    const hero = document.getElementById('page-home');
    if (!hero) return;
    
    // 這裡保留你的背景判斷邏輯空間
    // 確保這裡不會影響其他頁面的運作
}

export function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    
    // 除錯日誌 1：檢查函數是否被觸發
    console.log("toggleMenu 函數已執行");

    if (!mobileMenu) {
        console.error("錯誤：找不到 ID 為 'mobile-menu' 的元素！請檢查 HTML。");
        return;
    }

    // 除錯日誌 2：顯示當前狀態
    const isCurrentlyHidden = mobileMenu.classList.contains('hidden');
    console.log("當前選單狀態 (hidden class):", isCurrentlyHidden);

    // 1. 切換 class
    mobileMenu.classList.toggle('hidden');

    // 2. 判斷 body 是否可以滾動
    const isNowHidden = mobileMenu.classList.contains('hidden');
    document.body.style.overflow = isNowHidden ? '' : 'hidden';
    
    console.log("已切換狀態為:", isNowHidden ? "隱藏" : "顯示");
}

export function showPage(pageName) {
    const pages = ['page-home', 'page-services', 'page-locations'];
    
    // 隱藏所有頁面
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = ''; // 清除 inline style 讓 Tailwind 的 hidden 生效
        }
    });
    
    // 顯示目標頁面
    const target = document.getElementById('page-' + pageName);
    if (target) {
        target.classList.remove('hidden');
        
        // 設定顯示模式
        if (pageName === 'home') {
            target.style.display = 'flex';
            target.style.flexDirection = 'column';
            updateHeroBanner();
        } else {
            target.style.display = 'block';
        }
    }
    
    // 如果選單是開著的，自動關閉
    const mobileMenu = document.getElementById('mobile-menu');
    // 使用 getComputedStyle 檢查是否為顯示狀態
    if (mobileMenu && window.getComputedStyle(mobileMenu).display !== 'none') {
        toggleMenu();
    }
    
    // 平滑捲動至頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}