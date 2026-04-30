import { MAIL_DATABASE } from '../data/mail_data.js';

// --- 全域變數（狀態紀錄） ---
let currentUser = null;    // 紀錄當前登入的使用者資料物件
let currentMails = [];      // 紀錄該使用者的郵件清單

// 從 localStorage 讀取已讀紀錄
let readMails = new Set(JSON.parse(localStorage.getItem('readMails') || '[]')); 

export function initMailSystem() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.onclick = () => checkLogin(); 
    }
    // 初始化畫面
    refreshMailUI();
}

function refreshMailUI() {
    const loginView = document.getElementById('login-view');
    const mailListView = document.getElementById('mail-list-view'); // 對應 HTML 結構
    const mailContentView = document.getElementById('mail-content-view');
    const winTitle = document.getElementById('mail-win-title');

    if (currentUser) {
        loginView.style.display = 'none';
        mailListView.style.display = 'flex';
        mailContentView.style.display = 'none';
        winTitle.innerText = `系統郵件 - ${currentUser.userName}`;
        renderMailList();
        updateLEDStatus(); // 同步更新主頁面的 LED
    } else {
        loginView.style.display = 'flex';
        mailListView.style.display = 'none';
        mailContentView.style.display = 'none';
        winTitle.innerText = `系統郵件 - 鎖定中`;
        updateLEDStatus();
    }
}

function checkLogin() {
    const id = document.getElementById('user-id').value.trim();
    const pass = document.getElementById('user-pass').value.trim();
    
    /* 預留：這裡可以加入錯誤訊息顯示邏輯 */

    if (MAIL_DATABASE[id] && pass === "HOME666") {
        currentUser = MAIL_DATABASE[id];
        currentMails = currentUser.mails;
        refreshMailUI();
    } else {
        alert("存取拒絕：無效的員工 ID 或 Access Key。");
    }
}

function renderMailList() {
    const container = document.getElementById('mail-items-container');
    if (!container) return;
    container.innerHTML = ''; 

    // 重要：僅顯示已解鎖的信件
    const visibleMails = currentMails.filter(mail => mail.unlocked);

    visibleMails.forEach((mail) => {
        const div = document.createElement('div');
        const isRead = readMails.has(mail.id);
        
        div.className = `mail-item ${isRead ? 'read' : 'unread'}`;
        div.style.cursor = 'pointer';
        div.style.padding = '10px';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        div.style.display = 'flex';
        div.style.flexDirection = 'column';

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="mail-title" style="font-weight: ${isRead ? 'normal' : 'bold'}; color: ${isRead ? '#777' : '#deff9a'};">
                    ${isRead ? '✉' : '📩'} ${mail.title}
                </span>
            </div>
            <div class="mail-date" style="align-self: flex-end; font-size: 0.65rem; color: ${isRead ? '#444' : '#666'}; margin-top: 4px;">
                ${mail.date || '2024/10/24'}
            </div>
        `;
        
        div.onclick = () => {
            if (!readMails.has(mail.id)) {
                readMails.add(mail.id);
                saveReadStatus();
            }
            showMailDetail(mail);
            renderMailList(); // 重新渲染列表以更新已讀顏色
            updateLEDStatus();
        };
        container.appendChild(div);
    });
}

function showMailDetail(mail) {
    const mailListView = document.getElementById('mail-list-view');
    const mailContentView = document.getElementById('mail-content-view');
    
    mailListView.style.display = 'none';
    mailContentView.style.display = 'block';

    document.getElementById('mail-detail-sender').innerText = `寄件者: ${mail.sender || '系統'}`;
    document.getElementById('mail-detail-text').innerText = mail.content;
    
    /* 預留：未來可以在這裡加入信件附件的功能 */
}

function saveReadStatus() {
    localStorage.setItem('readMails', JSON.stringify(Array.from(readMails)));
}

// 與主頁面 HTML 邏輯同步用的 LED 更新
function updateLEDStatus() {
    const mailBadge = document.getElementById('mail-notification');
    const powerLed = document.querySelector('.power-led');
    
    // 只有已解鎖且未讀的才算新信
    const hasUnread = currentMails.some(mail => mail.unlocked && !readMails.has(mail.id));
    
    if (currentUser && hasUnread) {
        if (mailBadge) mailBadge.style.display = 'block';
        if (powerLed) powerLed.style.display = 'block';
    } else {
        if (mailBadge) mailBadge.style.display = 'none';
        if (powerLed) powerLed.style.display = 'none';
    }
}

export function logout() {
    currentUser = null;
    currentMails = [];
    refreshMailUI();
}

window.checkLogin = checkLogin;
window.backToMailList = () => {
    document.getElementById('mail-list-view').style.display = 'flex';
    document.getElementById('mail-content-view').style.display = 'none';
};