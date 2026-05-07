/* ============================================================
   [郵件系統核心模組] 
   功能：登入驗證、郵件渲染、狀態同步與鍵盤互動
   ============================================================ */

// ------------------------------------------------------------
// 1. 狀態管理與初始化區
// ------------------------------------------------------------
let currentUser = null;     
let currentMails = [];      
let readMails = new Set(JSON.parse(localStorage.getItem('readMails') || '[]'));

// 【直接啟動 App 的入口】
export function launchMailApp(data) {
    currentUser = data; 
    currentMails = data.mails || []; 
    
    // 直接顯示列表，不需要登入頁
    document.getElementById('mail-list-view').style.display = 'flex';
    document.getElementById('mail-content-view').style.display = 'none';
    
    // 更新 UI
    refreshMailUI();
}

export function initMailSystem(MAIL_DATABASE) {
    // 綁定鍵盤事件 (全域輔助)
    setupEventListeners();
}

// 【合併後的唯一入口】
export function loadUserIntoMailSystem(data) {
    // 1. 將完整的資料存入 currentUser
    currentUser = data; 
    
    // 2. 將該使用者的信件存入 currentMails
    currentMails = data.mails || []; 
    
    // 3. 直接呼叫你原本就寫好的 UI 更新邏輯
    // 這樣就不需要手動在外面改 innerText，程式碼更簡潔
    refreshMailUI(); 
    
    // 4. 隱藏登入介面，顯示列表
    document.getElementById('gx-login-overlay').style.display = 'none';
    document.getElementById('mail-list-view').style.display = 'flex';
}

// ------------------------------------------------------------
// 2. 登入與權限管理區
// ------------------------------------------------------------
window.logoutMail = function() {
    currentUser = null;
    currentMails = [];
    document.getElementById('user-id').value = '';
    document.getElementById('user-pass').value = '';
    refreshMailUI();
};

// ------------------------------------------------------------
// 3. UI 渲染與視覺控制區
// ------------------------------------------------------------

/** 刷新介面狀態 */
function refreshMailUI() {
    // 1. 抓取正確的 DOM 元素 (確保 ID 與 phone-new.js 定義的完全一致)
    const loginView = document.getElementById('gx-login-overlay'); // 注意：如果手機版已經不需要這個，可考慮移除
    const mailListView = document.getElementById('mail-list-view');
    const mailContentView = document.getElementById('mail-content-view');
    const winTitle = document.getElementById('mail-win-title');

    // 2. 如果使用者已登入 (currentUser 是從 phone-new.js 傳過來的)
    if (currentUser) {
        // 設定標題
        winTitle.innerText = `系統郵件 - ${currentUser.name || "員工"}`;
        
        // 切換視圖
        if (loginView) loginView.style.display = 'none';
        if (mailListView) mailListView.style.display = 'flex';
        if (mailContentView) mailContentView.style.display = 'none';
        
        // 渲染列表 (確保此函式在下方有定義)
        renderMailList();
        
        // 更新狀態燈號 (確保此函式有定義)
        if (typeof updateLEDStatus === 'function') updateLEDStatus(); 

    } else {
        // 未登入的鎖定狀態
        winTitle.innerText = `系統郵件 - 鎖定中`;
        if (loginView) loginView.style.display = 'flex';
        if (mailListView) mailListView.style.display = 'none';
        if (mailContentView) mailContentView.style.display = 'none';
    }
}

/** 渲染郵件列表 */
function renderMailList() {
    const container = document.getElementById('mail-items-container');
    if (!container) return; 
    container.innerHTML = '';

    const visibleMails = currentMails.filter(mail => mail.unlocked);

    visibleMails.forEach((mail) => {
        const div = document.createElement('div');
        const isRead = readMails.has(mail.id);
        
        div.className = `mail-item ${isRead ? 'read' : 'unread'}`;
        div.style.cursor = 'pointer';
        div.style.padding = '2px';
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
            renderMailList(); 
            updateLEDStatus();
        };
        container.appendChild(div);
    });
}

/** 顯示信件內文 */
function showMailDetail(mail) {
    document.getElementById('mail-list-view').style.display = 'none';
    document.getElementById('mail-content-view').style.display = 'block';
    document.getElementById('mail-detail-sender').innerText = `寄件者: ${mail.sender || '系統'}`;
    document.getElementById('mail-detail-text').innerText = mail.content;
}

/** 更新通知紅點狀態 */
function updateLEDStatus() {
    const mailBadge = document.getElementById('mail-notification');
    const hasUnread = currentMails.some(mail => mail.unlocked && !readMails.has(mail.id));
    
    if (currentUser && hasUnread) {
        if (mailBadge) mailBadge.style.display = 'block';
    } else {
        if (mailBadge) mailBadge.style.display = 'none';
    }
}

window.backToMailList = function() {
    document.getElementById('mail-list-view').style.display = 'flex';
    document.getElementById('mail-content-view').style.display = 'none';
};

// ------------------------------------------------------------
// 4. 事件監聽與資料持久化
// ------------------------------------------------------------
function saveReadStatus() {
    localStorage.setItem('readMails', JSON.stringify(Array.from(readMails)));
}

function setupEventListeners() {
    // Enter 登入
    [document.getElementById('user-id'), document.getElementById('user-pass')].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter') window.checkLogin(); 
            });
        }
    });

    // Backspace 返回列表
    window.addEventListener('keydown', (e) => {
        const isEditing = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
        const isContentView = document.getElementById('mail-content-view').style.display === 'block';
        if (e.key === 'Backspace' && !isEditing && isContentView) {
            e.preventDefault(); 
            window.backToMailList();
        }
    });
}