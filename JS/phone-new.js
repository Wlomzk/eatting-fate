/* ==========================================================
   歸心物流終端機 - phone-new.js (最終修正 - 裂痕回歸版)
   ========================================================== */

// 1. 引入外部模組
import { AuthSystem } from '../data/whoiswatching.js';
import { MAIL_DATABASE } from '../data/mail_data.js';

// 2. 解決 Module 作用域限制
window.closeApp = closeApp;
window.backToMailList = backToMailList;
window.openApp = openApp;

// 初始化防止重複載入
if (window.hasInitializedPhone) {
    console.warn("手機系統被重複載入，已攔截！");
} else {
    window.hasInitializedPhone = true;
    console.log("手機系統初始化成功");
}

// 3. App 資料庫
const appList = [
    { id: 'app-logs', name: '系統日誌', icon: '🖥️', locked: true, title: '系統日誌', content: '讀取中... [Access Denied]' },
    { id: 'app-secret-files', name: '人員清單', icon: '👤', locked: false, title: '人員清單', content: '成員：阿強、小明、[數據損毀]' },
    { id: 'app-cam', name: '監控中心', icon: '📹', locked: true, title: '監控畫面', content: 'NO SIGNAL' },
    { id: 'app-mail', name: '郵件系統', icon: '../image/phone/mail.webp', locked: false } 
];

// 郵件系統變數
let currentUserMailData = null;

(function() {
    document.addEventListener("DOMContentLoaded", function() {
        const phoneWrapper = document.createElement("div");
        phoneWrapper.className = "gx-phone-wrapper";
        phoneWrapper.id = "gx-phone";

        const batteryNotifier = document.createElement("div");
        batteryNotifier.id = "gx-battery-notifier";
        phoneWrapper.appendChild(batteryNotifier);

        const phoneScreen = document.createElement("div");
        phoneScreen.className = "gx-phone-screen";
        phoneScreen.innerHTML = `
            <div id="gx-login-overlay" class="gx-login-overlay">
                <div class="login-box">
                    <h3>歸心物流 - 系統登入</h3>
                    <input type="text" id="login-id" placeholder="User ID">
                    <input type="password" id="login-pass" placeholder="Password">
                    <button id="login-btn">登入系統</button>
                    <p id="login-error" style="color: red; font-size: 0.8em; margin-top: 10px;"></p>
                    <a href="#" style="color: #666; font-size: 0.7em;">忘記密碼？請聯繫客服</a>
                </div>
            </div>
            <div class="gx-status-bar">
                <div class="gx-status-signal" id="status-signal">信号: 强</div>
                <div id="system-time" class="gx-time-display">--:--</div>
                <div class="gx-status-battery" id="status-battery">
                    <div class="battery-body"><div class="battery-fill" id="battery-fill"></div></div>
                    <span id="battery-text">100%</span>
                </div>
            </div>   
            <div class="gx-phone-close" id="gx-close" style="z-index: 100;">×</div>
            
            <div class="gx-app-layer">
                <div class="gx-app-grid"></div>
            </div>

            <div class="gx-crack-overlay"></div>

            <div id="gx-modal" class="gx-modal">
                <div class="gx-modal-content">
                    <div class="gx-modal-header"><span id="modal-title"></span><button class="gx-modal-close" onclick="closeApp()">×</button></div>
                    <div class="gx-modal-body">
                        <p id="modal-text"></p>
                    </div>
                </div>
            </div>

            <div id="mail-list-view" class="gx-modal" style="display:none; z-index:90;">
                <div class="gx-modal-content">
                    <div class="gx-modal-header"><span id="mail-win-title">系統郵件</span><button class="gx-modal-close" onclick="closeApp()">×</button></div>
                    <div id="mail-items-container" class="gx-modal-body"></div>
                </div>
            </div>
            <div id="mail-content-view" class="gx-modal" style="display:none; z-index:91;">
                <div class="gx-modal-content">
                    <div class="gx-modal-header"><button onclick="backToMailList()">←</button><span id="mail-detail-title"></span></div>
                    <div class="gx-modal-body">
                        <div id="mail-detail-sender" style="font-weight:bold; color:#ffcc00; margin-bottom:5px;"></div>
                        <div id="mail-detail-text"></div>
                    </div>
                </div>
            </div>
        `;

        phoneWrapper.appendChild(phoneScreen);
        document.body.appendChild(phoneWrapper);

        const terminalTrigger = document.createElement("div");
        terminalTrigger.className = "gx-terminal-trigger";
        document.body.appendChild(terminalTrigger);

        document.getElementById('login-btn').addEventListener('click', handleLogin);
        checkAuthOnStartup();
        setInterval(updateClock, 1000);
        terminalTrigger.addEventListener("click", togglePhone);
        document.getElementById("gx-close").addEventListener("click", togglePhone);
    });
})();

// --- 核心渲染與控制 ---

function handleLogin() {
    const id = document.getElementById('login-id').value;
    const pass = document.getElementById('login-pass').value;
    const result = AuthSystem.checkLogin(id, pass);
    
    if (result.success) {
        localStorage.setItem('gx_user', JSON.stringify({ ...result.user, id: id }));
        document.getElementById('gx-login-overlay').style.display = 'none';
        renderAppGrid();
    } else {
        document.getElementById('login-error').innerText = result.message;
    }
}

function checkAuthOnStartup() {
    if (localStorage.getItem('gx_user')) {
        document.getElementById('gx-login-overlay').style.display = 'none';
        renderAppGrid();
    }
}

function renderAppGrid() {
    const grid = document.querySelector('.gx-app-grid');
    if (!grid) return;
    grid.innerHTML = ''; 
    const userJson = localStorage.getItem('gx_user');
    if (!userJson) return;
    
    appList.filter(app => !app.locked).forEach(app => {
        const appItem = document.createElement('div');
        appItem.className = 'gx-app-item';
        
        if(app.id === 'app-mail') {
            appItem.onclick = openMailApp;
        } else {
            // 通用 App 走原本的邏輯
            appItem.setAttribute('onclick', `openApp('${app.title}', '${app.content}')`);
        }
        
        const iconContent = app.icon.startsWith('../') 
            ? `<div style="width:30px; height:30px; background:url('${app.icon}') center/cover;"></div>` 
            : `<div class="gx-app-icon">${app.icon}</div>`;

        appItem.innerHTML = `${iconContent}<span class="gx-app-name">${app.name}</span>`;
        grid.appendChild(appItem);
    });
}

// --- 郵件邏輯 ---

function openMailApp() {
    const user = JSON.parse(localStorage.getItem('gx_user'));
    const databaseEntry = MAIL_DATABASE[user.id];
    
    currentUserMailData = {
        name: user.name,
        mails: databaseEntry ? databaseEntry.mails : []
    };
    
    document.getElementById('mail-list-view').style.display = 'block';
    document.getElementById('mail-win-title').innerText = `系統郵件 - ${currentUserMailData.name}`;
    renderMailList();
}

function renderMailList() {
    const container = document.getElementById('mail-items-container');
    container.innerHTML = '';
    currentUserMailData.mails.filter(m => m.unlocked).forEach(mail => {
        const div = document.createElement('div');
        div.className = 'mail-item';
        div.style.padding = '8px';
        div.style.borderBottom = '1px solid #444';
        // 修正這裡：顯示日期，並把 div 關閉
        div.innerHTML = `<div>${mail.title}</div><div style="font-size:10px;color:#888;">${mail.date}</div>`;
        div.onclick = () => showMailDetail(mail);
        container.appendChild(div);
    });
}

function showMailDetail(mail) {
    document.getElementById('mail-list-view').style.display = 'none';
    document.getElementById('mail-content-view').style.display = 'block';
    
    document.getElementById('mail-detail-title').innerText = mail.title;
    // 寄件者欄位
    document.getElementById('mail-detail-sender').innerText = `寄件者: ${mail.sender || '歸心物流中心'}`;
    document.getElementById('mail-detail-text').innerText = mail.content;
}

function backToMailList() {
    document.getElementById('mail-content-view').style.display = 'none';
    document.getElementById('mail-list-view').style.display = 'block';
}

function closeApp() { 
    document.getElementById('gx-modal').style.display = 'none'; 
    document.getElementById('mail-list-view').style.display = 'none';
    document.getElementById('mail-content-view').style.display = 'none';
}

function togglePhone() {
    document.getElementById('gx-phone').classList.toggle("is-open");
}

function updateClock() {
    const el = document.getElementById('system-time');
    if (el) el.innerText = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function openApp(title, content) {
    const modal = document.getElementById('gx-modal');
    // 確保這些 ID 存在
    const titleEl = document.getElementById('modal-title');
    const textEl = document.getElementById('modal-text');
    if(titleEl && textEl) {
        titleEl.innerText = title;
        textEl.innerText = content;
        modal.style.display = 'block';
    }
}