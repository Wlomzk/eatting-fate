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
    document.getElementById('login-view').style.display = 'none';
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

/** 刷新介面狀態 (登入/列表/內文切換) */
function refreshMailUI() {
    const loginView = document.getElementById('login-view');
    const mailListView = document.getElementById('mail-list-view');
    const mailContentView = document.getElementById('mail-content-view');
    const winTitle = document.getElementById('mail-win-title');
    const nameDisplay = document.getElementById('user-display-name');

    // --- 【除錯用】檢查看看變數與元素 ---
    console.log("當前使用者:", currentUser); 
    console.log("名字顯示元素:", nameDisplay);
    // ----------------------------------

    if (currentUser) {
        loginView.style.display = 'none';
        mailListView.style.display = 'flex';
        mailContentView.style.display = 'none';

        // 使用 || "員工" 當作預設值，避免 undefined 錯誤
        const displayName =currentUser.name || currentUser.userName || "員工";
        
        winTitle.innerText = `系統郵件 - ${currentUser.userName}`;
        document.getElementById('user-display-name').innerText = currentUser.name
        
        renderMailList();
        updateLEDStatus(); 
    } else {
        loginView.style.display = 'flex';
        mailListView.style.display = 'none';
        mailContentView.style.display = 'none';
        winTitle.innerText = `系統郵件 - 鎖定中`;
        updateLEDStatus();
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