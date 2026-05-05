// --- 模組引入 ---
import './firebase-init.js';
import { toggleMenu, showPage, updateHeroBanner } from './ui.js';
import { handleTrack, renderArchive } from './archive.js';
// 這裡改成了 getOrGeneratePairingSession
import { testConnection, getOrGeneratePairingSession, joinPairingSession } from './session.js';
import { onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from './firebase-init.js';

// 1. 裝置角色判斷 (核心翻轉：手機現在是 terminal，電腦是 controller)
function getDeviceRole() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile ? 'terminal' : 'controller';
}

// 2. 初始化 UI 顯示
function setupDeviceUI() {
    const role = getDeviceRole();
    const terminalUI = document.getElementById('terminal-ui');
    const controllerUI = document.getElementById('controller-ui');

    // 先全部隱藏
    terminalUI?.classList.add('hidden');
    controllerUI?.classList.add('hidden');

    // 根據角色顯示
    if (role === 'terminal') {
        terminalUI?.classList.remove('hidden');
    } else {
        controllerUI?.classList.remove('hidden');
    }
    return role;
}

// --- 頁面載入執行 ---
document.addEventListener('DOMContentLoaded', () => {
    // 執行 UI 初始化
    const currentRole = setupDeviceUI();
    
    // 初始化其他 UI 頁面功能
    renderArchive();
    updateHeroBanner();
    
    // 綁定導航與按鈕事件
    document.getElementById('nav-home')?.addEventListener('click', () => showPage('home'));
    document.getElementById('nav-services')?.addEventListener('click', () => showPage('services'));
    document.getElementById('nav-locations')?.addEventListener('click', () => showPage('locations'));
    document.getElementById('mobile-nav-home')?.addEventListener('click', () => showPage('home'));
    document.getElementById('mobile-nav-services')?.addEventListener('click', () => showPage('services'));
    document.getElementById('mobile-nav-locations')?.addEventListener('click', () => showPage('locations'));
    document.getElementById('mobile-menu-button')?.addEventListener('click', toggleMenu);
    document.getElementById('mobile-menu-close')?.addEventListener('click', toggleMenu);
    document.getElementById('search-btn')?.addEventListener('click', handleTrack);

    // 綁定電腦端「同步資料」按鈕
    document.getElementById('btn-pair')?.addEventListener('click', async () => {
        const code = document.getElementById('pairing-input').value;
        const statusText = document.getElementById('pairing-status');
        
        if (code.length !== 8) {
            statusText.innerText = "代碼錯誤，請輸入 8 位數";
            return;
        }

        statusText.innerText = "配對中...";
        if (auth.currentUser) {
            const success = await joinPairingSession(code, auth.currentUser.uid);
            statusText.innerText = success ? "配對成功！系統已同步。" : "配對失敗，請確認代碼。";
        }
    });

    // 3. Firebase 狀態監聽 (核心連線邏輯)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            localStorage.setItem('game_uid', user.uid);
            testConnection();

            // 如果是手機(Terminal)，自動產生配對碼並顯示
            if (currentRole === 'terminal') {
                const sessionData = await getOrGeneratePairingSession(user.uid);
                const displayCode = document.getElementById('display-code');
                
                if (displayCode && sessionData && sessionData.pairingCode) {
                    displayCode.innerText = sessionData.pairingCode;
                }
            }
        } else {
            // 未登入則自動匿名登入
            signInAnonymously(auth).catch((error) => console.error("登入失敗:", error));
        }
    });

    // 視窗調整監聽
    window.addEventListener('resize', updateHeroBanner);
});