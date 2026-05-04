/* ==========================================================
   歸心物流終端機 - 主程式 (UI 與 互動)
   ========================================================== */

(function() {
    console.log("歸心物流終端機：系統校準中...");

    document.addEventListener("DOMContentLoaded", function() {
        
        // --- [SECTION: 初始化介面容器] ---
        const phoneWrapper = document.createElement("div");
        phoneWrapper.className = "gx-phone-wrapper";
        phoneWrapper.id = "gx-phone";

        // [側邊通知欄]
        const batteryNotifier = document.createElement("div");
        batteryNotifier.id = "gx-battery-notifier";
        phoneWrapper.appendChild(batteryNotifier);

        // --- [SECTION: UI 渲染 (畫面結構)] ---
        const phoneScreen = document.createElement("div");
        phoneScreen.className = "gx-phone-screen";
        phoneScreen.innerHTML = `
            <div class="gx-status-bar">
                <div class="gx-status-signal" id="status-signal">信号: 强</div>
                <div id="system-time" style="font-size: 12px; font-family: monospace;">--:--</div>
                <div class="gx-status-battery" id="status-battery">
                    <div class="battery-body">
                        <div class="battery-fill" id="battery-fill"></div>
                    </div>
                    <span id="battery-text">100%</span>
                </div>
            </div>    
            <div class="gx-phone-close" id="gx-close" style="z-index: 100;">×</div>
            <div class="gx-app-layer">
                <div class="gx-app-grid">
                    <div class="gx-app-item" id="app-logs" onclick="openApp('系統日誌', '讀取中... [Access Denied]')">
                        <div class="gx-app-icon">🖥️</div>
                        <span class="gx-app-name">系統日誌</span>
                    </div>
                    <div class="gx-app-item is-locked" id="app-secret-files" onclick="openApp('人員清單', '成員：阿強、小明、[數據損毀]')">
                        <div class="gx-app-icon">👤</div>
                        <span class="gx-app-name">人員清單</span>
                    </div>
                    <div class="gx-app-item is-locked" id="app-cam" onclick="openApp('監控畫面', 'NO SIGNAL')">
                        <div class="gx-app-icon">📹</div>
                        <span class="gx-app-name">監控中心</span>
                    </div>
                </div>
            </div>
            <div class="gx-crack-overlay"></div>
            <div id="gx-modal" class="gx-modal">
                <div class="gx-modal-content">
                    <div class="gx-modal-header">
                        <span id="modal-title">APP名稱</span>
                        <button class="gx-modal-close" onclick="closeApp()">×</button>
                    </div>
                    <div class="gx-modal-body">
                        <p id="modal-text">內容加載中...</p>
                    </div>
                </div>
            </div>
        `;

        phoneWrapper.appendChild(phoneScreen);
        document.body.appendChild(phoneWrapper);

        // [終端機啟動按鈕]
        const terminalTrigger = document.createElement("div");
        terminalTrigger.className = "gx-terminal-trigger";
        document.body.appendChild(terminalTrigger);

        // --- [SECTION: 動態效果邏輯] ---
        // 隨機故障效果
        function randomGlitch() {
            const effect = Math.random() > 0.5 ? 'effect-flicker' : 'effect-glitch';
            phoneWrapper.classList.add(effect);
            setTimeout(() => { phoneWrapper.classList.remove(effect); }, 500);
            setTimeout(randomGlitch, Math.random() * 5000 + 3000);
        }
        randomGlitch();

        // 螢幕開關切換
        function togglePhone() {
            const isOpen = phoneWrapper.classList.toggle("is-open");
            terminalTrigger.style.display = isOpen ? 'none' : 'flex';
        }
        
        // 監聽器綁定
        terminalTrigger.addEventListener("click", togglePhone);
        document.getElementById("gx-close").addEventListener("click", togglePhone);

        // --- [SECTION: 背景循環執行] ---
        setInterval(updateClock, 1000);
        updateClock();
    });
})();

// --- [SECTION: 全域功能與控制 (APP 管理)] ---

// 更新時鐘
function updateClock() {
    const timeElement = document.getElementById('system-time');
    if (timeElement) timeElement.innerText = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// 開啟 APP (統一介面控制)
function openApp(title, content) {
    // 呼叫 battery.js 裡面的 drainBattery 函數 (保持原有參數)
    if (typeof drainBattery === 'function') {
        drainBattery(10);
    }
    const modal = document.getElementById('gx-modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-text').innerText = content;
    modal.style.display = 'block';
}

// 關閉 APP
function closeApp() { 
    document.getElementById('gx-modal').style.display = 'none'; 
}