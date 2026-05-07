/* ==========================================================
   phone-new.js (絕對還原版 - 嚴格保留所有間距、字體與原始參數)
   ========================================================== */

import { AuthSystem } from '../data/whoiswatching.js';
import { MAIL_DATABASE } from '../data/mail_data.js';
import { EVIDENCE_DATABASE } from '../data/evidence_data.js';
import { launchMailApp } from './mail_system.js'; 
import { gameState } from './state.js'; 

// --- 導航據點設定 (預留據點) ---
const NAV_LOCATIONS = [
    { id: 'temple', name: '淡水大廟', x: 30, y: 35, icon: '⛩️', scene: 'scene_temple.html' },
    { id: 'hermit', name: '深山隱居處', x: 85, y: 15, icon: '🛖', scene: 'scene_mountain.html' },
    { id: 'muye', name: '牧野分撥中心', x: 50, y: 50, icon: '📦', scene: 'scene_muye.html' }
];

// --- 全域函數掛載 ---
window.closeApp = closeApp;
window.openApp = openApp;
window.updateAppStage = updateAppStage; 
window.handleOpenEvidence = handleOpenEvidence;
window.openEvidenceDetail = openEvidenceDetail;
window.openImageModal = openImageModal; 
window.closeImageModal = closeImageModal;
window.handleNavSearch = handleNavSearch;   
window.executeNavigation = executeNavigation; 

let currentTarget = null; 

window.addEventListener('stateUpdated', (e) => {
    const newState = e.detail;
    if (currentActiveApp === 'archive') { 
        renderArchiveList(newState.unlockedEvidences);
    }
});

function updateAppStage(appId, newStage) {
    let appSettings = JSON.parse(localStorage.getItem('gx_app_settings')) || {};
    appSettings[appId] = newStage;
    localStorage.setItem('gx_app_settings', JSON.stringify(appSettings));
    renderAppGrid();
}

(function() {
    document.addEventListener("DOMContentLoaded", function() {
        if (window.hasInitializedPhone) return;
        window.hasInitializedPhone = true;

        const phoneWrapper = document.createElement("div");
        phoneWrapper.className = "gx-phone-wrapper";
        phoneWrapper.id = "gx-phone";

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
                </div>
            </div>
            <div class="gx-status-bar">
                <div class="gx-status-signal" id="status-signal">信号: 强</div>
                <div id="system-time" class="gx-time-display">--:--</div>
                <div class="gx-status-battery" id="status-battery">
                    <div class="battery-body"><div class="battery-fill" id="battery-fill"></div></div>
                    <span id="battery-text">--%</span>
                </div>
            </div>   
            <div class="gx-phone-close" id="gx-close" style="z-index: 100;">×</div>
            <div class="gx-app-layer"><div class="gx-app-grid"></div></div>
            <div id="gx-power-off-overlay" class="gx-power-off-overlay">
                <div style="font-size: 50px; margin-bottom: 20px;">🪫</div>
                <div style="font-size: 18px; font-weight:bold; margin-bottom:10px;">系統電力已耗盡</div>
                <button onclick="window.handleCharge()" class="fx-unstable" style="z-index: 241; background:#32CD32; color: #000; border:none; padding:10px 20px; cursor:pointer; font-weight:bold; border-radius:5px;">[ 啟動緊急充電 ]</button>
            </div>
            <div class="gx-crack-overlay" style="z-index: 500; pointer-events: none;"></div>
            <div class="gx-crack-overlay"></div>
            <div class="gx-glitch-overlay"></div>
            <div id="gx-battery-notifier"></div>
            <div id="gx-modal" class="gx-modal">
                <div class="gx-modal-content">
                    <div class="gx-modal-header"><span id="modal-title"></span><button class="gx-modal-close" onclick="closeApp()">×</button></div>
                    <div class="gx-modal-body"><p id="modal-text"></p></div>
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
                    <div class="gx-modal-header"><button onclick="window.backToMailList()" style="margin-bottom:2px; font-size: 90%; cursor:pointer; background:#333; color:#fff; border:1px solid #555; padding:2px 8px;">← 返回列表</button><span id="mail-detail-title"></span></div>
                    <div class="gx-modal-body">
                        <div id="mail-detail-sender" style="font-weight:bold; color:#ffcc00; margin-bottom:5px;"></div>
                        <div id="mail-detail-text"></div>
                    </div>
                </div>
            </div>
            <div id="gx-image-viewer" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:999; justify-content:center; align-items:center; cursor:pointer;" onclick="closeImageModal()">
                <img id="viewer-img" src="" style="max-width:90%; max-height:90%; border:2px solid #fff; box-shadow:0 0 20px rgba(255,255,255,0.5);">
            </div>
        `;

        phoneWrapper.appendChild(phoneScreen);
        document.body.appendChild(phoneWrapper);

        const terminalTrigger = document.createElement("div");
        terminalTrigger.className = "gx-terminal-trigger";
        document.body.appendChild(terminalTrigger);

        document.getElementById('login-btn').addEventListener('click', handleLogin);
        terminalTrigger.addEventListener("click", togglePhone);
        document.getElementById("gx-close").addEventListener("click", togglePhone);

        checkAuthOnStartup();
        setInterval(updateClock, 1000);
    });
})();

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
        const overlay = document.getElementById('gx-login-overlay');
        if (overlay) overlay.style.display = 'none';
        renderAppGrid();
    }
}

function renderAppGrid() {
    const grid = document.querySelector('.gx-app-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const userJson = localStorage.getItem('gx_user');
    if (!userJson) return;

    const appSettings = JSON.parse(localStorage.getItem('gx_app_settings')) || {};

    const allApps = [
        { id: 'app-mail', name: '信件匣', unlocked: true, iconPath: 'image/phone/mail.webp', action: handleOpenMail },
        { id: 'app-logs', name: '系統日誌', title: '系統日誌', content: '數據未加密...', unlocked: true },
        { id: 'app-secret-files', name: '人員清單', title: '人員清單', content: '成員：阿強、小明、[數據已刪除]', unlocked: true },
        { id: 'app-evidence', name: '案件側錄', title: '案件側錄', unlocked: true, iconPath: 'image/phone/evidence.webp', action: handleOpenEvidence },
        { id: 'app-nav', name: '尋蹤導航', unlocked: true, iconPath: 'image/phone/navigation.webp', action: handleOpenNav },
        null, null, null, null, null, null, null
    ];

    allApps.forEach(app => {
        if (!app || !app.unlocked) return;
        app.stage = appSettings[app.id] || 1;
        const div = document.createElement('div');
        div.className = 'gx-app-item';
        if (app.iconPath) {
            const iconDiv = document.createElement('div');
            iconDiv.className = `app-icon stage-${app.stage}`;
            iconDiv.style.backgroundImage = `url('${app.iconPath}')`;
            div.appendChild(iconDiv);
        } else {
            const iconDiv = document.createElement('div');
            iconDiv.className = 'gx-app-icon';
            iconDiv.innerText = app.icon || '📱';
            div.appendChild(iconDiv);
        }
        const nameSpan = document.createElement('span');
        nameSpan.className = 'gx-app-name';
        nameSpan.innerText = app.name;
        div.appendChild(nameSpan);

        div.onclick = () => {
            document.dispatchEvent(new CustomEvent('battery-consume', { detail: { amount: 10 } }));
            if (app.action) {
                app.action();
            } else {
                openApp(app.title, app.content);
            }
        };
        grid.appendChild(div);
    });
}

// --- 導航功能 ---
function handleOpenNav() {
    const modal = document.getElementById('gx-modal');
    document.getElementById('modal-title').innerText = '尋蹤導航';
    document.getElementById('modal-text').innerHTML = `
        <div class="gx-nav-container">
            <input type="text" class="gx-nav-search-bar" placeholder="搜尋據點..." oninput="window.handleNavSearch(this.value)">
            <div class="gx-nav-map-area">
                <img src="image/phone/TAMSUI-MAP.webp" style="width:100%; height:100%; object-fit:cover; opacity:0.6;">
                <svg class="gx-nav-svg-layer"><line id="nav-line" x1="50%" y1="90%" x2="50%" y2="90%" stroke="#32CD32" stroke-width="2" stroke-dasharray="5,5" style="display:none;" /></svg>
                <div class="fx-breathing" style="position:absolute; bottom:10%; left:50%; width:10px; height:10px; background:#d41c16; border-radius:50%; transform:translate(-50%, 50%); z-index:11;"></div>
                <div id="nav-poi-container">
                    ${NAV_LOCATIONS.map(loc => `<div class="gx-nav-poi" id="poi-${loc.id}" style="left:${loc.x}%; top:${loc.y}%; display:none;"><span style="font-size:16px;">${loc.icon}</span><div style="font-size:9px; color:#fff;">${loc.name}</div></div>`).join('')}
                </div>
            </div>
            <button id="nav-go-btn" onclick="window.executeNavigation()" class="fx-unstable" style="display:none; position:absolute; bottom:35px; left:50%; transform:translateX(-50%); background:#32CD32; color:#000; border:none; padding:8px 20px; font-weight:bold; cursor:pointer; z-index:100;">[ 執行前往 ]</button>
        </div>
    `;
    modal.style.display = 'block';
}

function handleNavSearch(val) {
    const line = document.getElementById('nav-line');
    const goBtn = document.getElementById('nav-go-btn');
    document.querySelectorAll('.gx-nav-poi').forEach(p => p.style.display = 'none');
    line.style.display = 'none';
    goBtn.style.display = 'none';
    if (!val) return;
    const found = NAV_LOCATIONS.find(loc => loc.name.includes(val));
    if (found) {
        currentTarget = found;
        document.getElementById(`poi-${found.id}`).style.display = 'block';
        line.setAttribute('x2', `${found.x}%`);
        line.setAttribute('y2', `${found.y}%`);
        line.style.display = 'block';
        goBtn.style.display = 'block';
    }
}

function executeNavigation() {
    if (!currentTarget) return;
    document.dispatchEvent(new CustomEvent('battery-consume', { detail: { amount: 10 } }));
    setTimeout(() => { window.location.href = currentTarget.scene; }, 1000);
}

// --- 證據系統還原 ---
function handleOpenEvidence(filterType = 'all') {
    const modal = document.getElementById('gx-modal');
    document.getElementById('modal-title').innerText = '案件側錄';
    let displayData = EVIDENCE_DATABASE.filter(item => item.isLocked === false);
    if (filterType !== 'all') { displayData = displayData.filter(item => item.type === filterType); }

    let listHtml = `
        <div class="evidence-list" style="height: 250px; overflow-y: auto;">
            ${displayData.length > 0 ? displayData.map(item => {
                const timeToShow = item.timeType === "static" ? item.fixedTime : (item.unlockedTime || "待偵測...");
                return `
                <div style="padding:5px 5px; border-bottom:1px solid #444; cursor:pointer;" 
                     onclick="window.openEvidenceDetail('${item.id}')">
                     <div style="font-size:0.9em; color:#ffcc00;">[${item.type.toUpperCase()}] ${item.title}</div>
                    <div style="font-size:0.7em; color:#888;">${timeToShow}</div>
                </div>
                `;
            }).join('') : '<div style="padding:20px; color:#666; text-align:center;">無相關資料</div>'}
        </div>
        <div style="display:flex; justify-content:space-around; padding-top:10px; border-top:1px solid #666;">
            <button onclick="handleOpenEvidence('all')">全部</button>
            <button onclick="handleOpenEvidence('image')">影像</button>
            <button onclick="handleOpenEvidence('text')">筆記</button>
        </div>
    `;
    document.getElementById('modal-text').innerHTML = listHtml;
    modal.style.display = 'block';
}

function openEvidenceDetail(id) {
    const item = EVIDENCE_DATABASE.find(i => i.id == id);
    if (!item) return;
    document.getElementById('modal-title').innerText = item.title;
    const timeToShow = item.timeType === "static" ? item.fixedTime : (item.unlockedTime || "待偵測...");
    const detailHtml = `
        <button onclick="handleOpenEvidence()" style="margin-bottom:10px; cursor:pointer; background:#333; color:#fff; border:1px solid #555; padding:2px 8px;">← 返回清單</button>
        <div style="color:#aaa; font-size:0.8em; margin-bottom:10px;">側錄時間：${timeToShow}</div>
        <div style="margin-bottom:15px; line-height:1.5; color:#eee;">${item.content}</div>
        ${item.imagePath ? `<img src="${item.imagePath}" style="width:100%; border-radius:5px; border:1px solid #555; cursor:pointer;" onclick="window.openImageModal('${item.imagePath}')">` : ''}
    `;
    document.getElementById('modal-text').innerHTML = detailHtml;
}

function handleOpenMail() {
    const user = JSON.parse(localStorage.getItem('gx_user'));
    const databaseEntry = MAIL_DATABASE[user.id];
    const mailData = { ...user, mails: databaseEntry ? databaseEntry.mails : [] };
    launchMailApp(mailData);
}

function closeApp() {
    document.getElementById('gx-modal').style.display = 'none';
    document.getElementById('mail-list-view').style.display = 'none';
    document.getElementById('mail-content-view').style.display = 'none';
}

function openApp(title, content) {
    document.getElementById('gx-modal').style.display = 'block';
    document.getElementById('modal-title').innerText = title || "系統通知";
    document.getElementById('modal-text').innerText = content || "無資料";
}

function togglePhone() {
    document.getElementById('gx-phone').classList.toggle("is-open");
}

function updateClock() {
    const el = document.getElementById('system-time');
    if (el) el.innerText = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function openImageModal(src) {
    const viewer = document.getElementById('gx-image-viewer');
    const img = document.getElementById('viewer-img');
    img.src = src;
    viewer.style.display = 'flex';
}

function closeImageModal() {
    document.getElementById('gx-image-viewer').style.display = 'none';
}