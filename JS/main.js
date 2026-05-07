// --- 1. 模組引入 ---
import './firebase-init.js';
import { auth } from './firebase-init.js';
import { onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { toggleMenu, showPage, updateHeroBanner } from './ui.js';
import { handleTrack, renderArchive } from './keyword.js';
import { testConnection, getOrGeneratePairingSession, joinPairingSession } from './session.js';

// --- 2. 狀態設定 ---
const isDev = true;

// --- 3. 裝置角色判斷邏輯 ---
function getDeviceRole() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile ? 'terminal' : 'controller';
}

// --- 4. 初始化 UI 顯示控制 ---
function setupDeviceUI() {
    const role = getDeviceRole();
    const terminalUI = document.getElementById('terminal-ui');
    const controllerUI = document.getElementById('controller-ui');

    terminalUI?.classList.add('hidden');
    controllerUI?.classList.add('hidden');

    if (role === 'terminal') {
        terminalUI?.classList.remove('hidden');
    } else {
        controllerUI?.classList.remove('hidden');
    }
    return role;
}

// --- 5. 核心事件綁定與初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    // A. 啟動裝置角色 UI
    const currentRole = setupDeviceUI();
    
    // B. 初始化數據與橫幅
    updateHeroBanner();
    renderArchive();
    
    // C. 常規導航事件綁定
    document.getElementById('nav-home')?.addEventListener('click', () => showPage('home'));
    document.getElementById('nav-services')?.addEventListener('click', () => showPage('services'));
    document.getElementById('nav-locations')?.addEventListener('click', () => showPage('locations'));
    
    // D. 手機版菜單事件
    document.getElementById('mobile-nav-home')?.addEventListener('click', () => showPage('home'));
    document.getElementById('mobile-nav-services')?.addEventListener('click', () => showPage('services'));
    document.getElementById('mobile-nav-locations')?.addEventListener('click', () => showPage('locations'));
    document.getElementById('mobile-menu-button')?.addEventListener('click', toggleMenu);
    document.getElementById('mobile-menu-close')?.addEventListener('click', toggleMenu);

    // E. 貨物檢索功能綁定
    document.getElementById('search-btn')?.addEventListener('click', handleTrack);

    // F. 配對同步功能 (電腦端 Controller 使用)
    document.getElementById('btn-pair')?.addEventListener('click', async () => {
        const code = document.getElementById('pairing-input').value;
        const statusText = document.getElementById('pairing-status');
        
        // --- 修改處：放寬長度判定，改為判斷是否為空，並修正提示語 ---
        if (!code || code.length < 8) {
            statusText.innerText = "編號格式有誤，請確認載體標籤。";
            return;
        }

        statusText.innerText = "正在定錨命運...";
        if (auth.currentUser) {
            const success = await joinPairingSession(code, auth.currentUser.uid);
            statusText.innerText = success ? "配對成功！系統已同步。嘻嘻。" : "配對失敗，該編號尚未定錨。";
        }
    });

    // G. Firebase 帳號與連線監聽
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            localStorage.setItem('game_uid', user.uid);
            testConnection();

            // 若為手機(Terminal)角色，顯示自動生成的配對碼
            if (currentRole === 'terminal') {
                const sessionData = await getOrGeneratePairingSession(user.uid);
                const displayCode = document.getElementById('display-code');
                if (displayCode && sessionData?.pairingCode) {
                    displayCode.innerText = sessionData.pairingCode;
                }
            }
        } else {
            signInAnonymously(auth).catch((error) => console.error("登入失敗:", error));
        }
    });

    // H. 其他環境監聽
    window.addEventListener('resize', updateHeroBanner);
});