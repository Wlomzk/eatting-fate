// --- UI 相關邏輯 ---

export function updateHeroBanner() {
    const hero = document.getElementById('page-home');
    if (!hero) return;
    
    // 這裡保留你的背景判斷邏輯空間
    // 確保這裡不會影響其他頁面的運作
}

export function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenu) {
        console.error("找不到 #mobile-menu");
        return;
    }

    // 直接獲取當前 display 狀態
    const currentDisplay = window.getComputedStyle(mobileMenu).display;

    // 如果目前是隱藏的，就設為 flex；否則設為 none
    if (currentDisplay === 'none') {
        mobileMenu.style.display = 'flex'; // 強制顯示
        document.body.style.overflow = 'hidden'; // 禁止捲動
    } else {
        mobileMenu.style.display = 'none'; // 強制隱藏
        document.body.style.overflow = ''; // 恢復捲動
    }
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