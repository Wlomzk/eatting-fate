// --- 模組引入 ---
import './firebase-init.js';
import { toggleMenu, showPage, updateHeroBanner } from './ui.js';
import { handleTrack, renderArchive } from './archive.js';
import { testConnection, createPairingSession, joinPairingSession } from './session.js'; // 記得加上 joinPairingSession
import { onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from './firebase-init.js';

// 1. 裝置角色判斷函式
function getDeviceRole() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isMobile ? 'controller' : 'terminal';
}

// 2. 初始化 UI 顯示 (純介面顯示，不觸發邏輯)
function setupDeviceUI() {
    const role = getDeviceRole();
    if (role === 'terminal') {
        document.getElementById('terminal-ui')?.classList.remove('hidden');
    } else {
        document.getElementById('controller-ui')?.classList.remove('hidden');
    }
    return role; // 回傳角色以便後續使用
}

// --- 頁面載入執行 ---
document.addEventListener('DOMContentLoaded', () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    const terminal = document.getElementById('terminal-ui'); // 這是顯示碼
    const controller = document.getElementById('controller-ui'); // 這是輸入框

    // 1. 強制重置：先把兩邊都藏起來
    terminal?.classList.add('hidden');
    controller?.classList.add('hidden');
    
    if (isMobile) {
        // 手機 -> 顯示配對碼 (Terminal UI)
        terminal?.classList.remove('hidden');
    } else {
        // 電腦 -> 顯示輸入框 (Controller UI)
        controller?.classList.remove('hidden');
    }
});

    // A. 先設定介面顯示
    const currentRole = setupDeviceUI();
    
    // B. 設定所有 UI 事件監聽 (這部分不會因為 uid 而出錯，隨時可執行)
    renderArchive();
    updateHeroBanner();
    
    document.getElementById('nav-home')?.addEventListener('click', () => showPage('home'));
    document.getElementById('nav-services')?.addEventListener('click', () => showPage('services'));
    document.getElementById('nav-locations')?.addEventListener('click', () => showPage('locations'));
    document.getElementById('mobile-nav-home')?.addEventListener('click', () => showPage('home'));
    document.getElementById('mobile-nav-services')?.addEventListener('click', () => showPage('services'));
    document.getElementById('mobile-nav-locations')?.addEventListener('click', () => showPage('locations'));
    document.getElementById('mobile-menu-button')?.addEventListener('click', toggleMenu);
    document.getElementById('mobile-menu-close')?.addEventListener('click', toggleMenu);
    document.getElementById('search-btn')?.addEventListener('click', handleTrack);

    // C. 綁定配對按鈕事件
    document.getElementById('btn-pair')?.addEventListener('click', async () => {
        const code = document.getElementById('pairing-input').value;
        const statusText = document.getElementById('pairing-status');
        
        if (code.length !== 8) {
            statusText.innerText = "代碼錯誤，請輸入 8 位數";
            return;
        }

        statusText.innerText = "配對中...";
        // 這裡確保 auth.currentUser 存在才呼叫
        if (auth.currentUser) {
            const success = await joinPairingSession(code, auth.currentUser.uid);
            statusText.innerText = success ? "配對成功！系統已同步。" : "配對失敗，請確認代碼。";
        }
    });

    // D. 處理 Firebase 狀態 (這是核心！)
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("系統連結成功，用戶UID:", user.uid);
            localStorage.setItem('game_uid', user.uid);
            testConnection();

            // 只有在電腦端(Terminal)才產生配對碼
            if (currentRole === 'terminal') {
                const sessionData = await createPairingSession(user.uid);
                // 如果有產生碼，顯示在 UI 上
                const displayCode = document.getElementById('display-code');
                if (displayCode && sessionData && sessionData.pairingCode) {
    // 把資料庫撈到的代碼，強制寫入 HTML 的顯示區
    displayCode.innerText = sessionData.pairingCode; 
    console.log("成功顯示配對碼：", sessionData.pairingCode);
} else {
    console.warn("配對碼為空，請檢查 sessionData 內容");
}
            }
        } else {
            console.log("尚未登入，執行匿名登入...");
            signInAnonymously(auth).catch((error) => console.error("登入失敗:", error));
        }
    });
