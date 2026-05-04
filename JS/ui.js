// --- UI 相關邏輯 ---

export function updateHeroBanner() {
    const hero = document.getElementById('page-home');
    if (!hero) return;
    // 你的背景判斷邏輯...
}

export function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;

    // 1. 直接切換 class (Tailwind 的 hidden 會自動處理 display: none)
    mobileMenu.classList.toggle('hidden');

    // 2. 判斷現在是開還是關，來決定 body 是否可以滾動
    const isHidden = mobileMenu.classList.contains('hidden');
    document.body.style.overflow = isHidden ? '' : 'hidden';
}

export function showPage(pageName) {
    const pages = ['page-home', 'page-services', 'page-locations'];
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.style.display = '';
        }
    });
    
    const target = document.getElementById('page-' + pageName);
    if (target) {
        target.classList.remove('hidden');
        if (pageName === 'home') {
            target.style.display = 'flex';
            target.style.flexDirection = 'column';
            updateHeroBanner();
        } else {
            target.style.display = 'block';
        }
    }
    
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && window.getComputedStyle(mobileMenu).display !== 'none') {
        toggleMenu();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}