/* ============================================================
   [郵件系統核心模組 - 搬運自失物招領處主頁最新邏輯] 
   ============================================================ */

// 狀態變數
let currentUser = null;     // 紀錄當前登入的使用者資料物件
let currentMails = [];      // 紀錄該使用者的郵件清單

// 從 localStorage 讀取已讀紀錄
let readMails = new Set(JSON.parse(localStorage.getItem('readMails') || '[]'));

/**
 * 初始化郵件系統
 * 綁定全域函式供 HTML 元素調用
 */
export function initMailSystem(MAIL_DATABASE) {
    
    // [登入判定邏輯 - 搬運自主頁最新狀態]
    window.checkLogin = function() {
        const id = document.getElementById('user-id').value.trim();
        const pass = document.getElementById('user-pass').value.trim();

        /* 預留：這裡可以加入錯誤訊息顯示邏輯 */

        // 搬運：密碼判定採用主頁最新的 "HOME666" 邏輯
        if (MAIL_DATABASE[id] && pass === "HOME666") {
            currentUser = MAIL_DATABASE[id];
            currentMails = currentUser.mails;
            
            refreshMailUI();
            
            /* 預留 */
        } else {
            alert("存取拒絕：無效的員工 ID 或 Access Key。");
        }
    };

    /**
     * 刷新整體郵件介面狀態
     */
    function refreshMailUI() {
        const loginView = document.getElementById('login-view');
        const mailListView = document.getElementById('mail-list-view');
        const mailContentView = document.getElementById('mail-content-view');
        const winTitle = document.getElementById('mail-win-title');

        if (currentUser) {
            loginView.style.display = 'none';
            mailListView.style.display = 'flex';
            mailContentView.style.display = 'none';
            
            // 同步顯示名稱與視窗標題
            winTitle.innerText = `系統郵件 - ${currentUser.userName}`;
            document.getElementById('user-display-name').innerText = currentUser.userName;
            
            renderMailList();
            updateLEDStatus(); 
        } else {
            // 登出狀態
            loginView.style.display = 'flex';
            mailListView.style.display = 'none';
            mailContentView.style.display = 'none';
            winTitle.innerText = `系統郵件 - 鎖定中`;
            
            updateLEDStatus();
        }
    }

    /**
     * 渲染郵件清單 - 依據主頁最新排版樣式
     */
    function renderMailList() {
        const container = document.getElementById('mail-items-container');
        if (!container) return; 
        
        container.innerHTML = '';

        // 重要：僅顯示已解鎖 (unlocked: true) 的信件
        const visibleMails = currentMails.filter(mail => mail.unlocked);

        visibleMails.forEach((mail) => {
            const div = document.createElement('div');
            const isRead = readMails.has(mail.id);
            
            // 搬運主頁最新 Class 判定
            div.className = `mail-item ${isRead ? 'read' : 'unread'}`;
            
            // 嚴格保留主頁 inline 樣式與排版結構
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

    /**
     * 顯示郵件內文
     */
    function showMailDetail(mail) {
        const mailListView = document.getElementById('mail-list-view');
        const mailContentView = document.getElementById('mail-content-view');
        
        mailListView.style.display = 'none';
        mailContentView.style.display = 'block';

        document.getElementById('mail-detail-sender').innerText = `寄件者: ${mail.sender || '系統'}`;
        document.getElementById('mail-detail-text').innerText = mail.content;
        
        /* 預留：未來可以在這裡加入信件附件的功能 */
    }

    /**
     * 更新紅點狀態 - 主頁最新狀態判定
     */
    function updateLEDStatus() {
        const mailBadge = document.getElementById('mail-notification');
        
        // 判定邏輯：必須登入 且 存在「已解鎖但未讀」的信件
        const hasUnread = currentMails.some(mail => mail.unlocked && !readMails.has(mail.id));
        
        if (currentUser && hasUnread) {
            if (mailBadge) mailBadge.style.display = 'block';
        } else {
            if (mailBadge) mailBadge.style.display = 'none';
        }
    }

    /**
     * 登出功能
     */
    window.logoutMail = function() {
        currentUser = null;
        currentMails = [];
        
        // 清空輸入框
        document.getElementById('user-id').value = '';
        document.getElementById('user-pass').value = '';
        
        refreshMailUI();
    };

    /**
     * 返回清單功能
     */
    window.backToMailList = function() {
        document.getElementById('mail-list-view').style.display = 'flex';
        document.getElementById('mail-content-view').style.display = 'none';
    };

    /**
     * 儲存已讀狀態至 LocalStorage
     */
    function saveReadStatus() {
        localStorage.setItem('readMails', JSON.stringify(Array.from(readMails)));
    }

    // 鍵盤輔助功能：Enter 登入
    [document.getElementById('user-id'), document.getElementById('user-pass')].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter') window.checkLogin(); 
            });
        }
    });

    // 鍵盤輔助功能：Backspace 返回
    window.addEventListener('keydown', (e) => {
        const isEditing = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
        const isContentView = document.getElementById('mail-content-view').style.display === 'block';
        if (e.key === 'Backspace' && !isEditing && isContentView) {
            e.preventDefault(); 
            window.backToMailList();
        }
    });
}