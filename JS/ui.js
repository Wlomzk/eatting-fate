// --- UI 相關邏輯 ---

export function updateHeroBanner() {
    const hero = document.getElementById('page-home');
    if (!hero) return;
    // 你的背景判斷邏輯...
}

export function toggleMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    const isHidden = window.getComputedStyle(mobileMenu).display === 'none';
    if (isHidden) {
        mobileMenu.style.setProperty('display', 'flex', 'important');
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.style.setProperty('display', 'none', 'important');
        document.body.style.overflow = '';
    }
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