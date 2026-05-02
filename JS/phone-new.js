/* ==============================
   歸心物流終端機 - 完整整合版
   ============================== */
(function() {
    console.log("歸心物流終端機：系統校準中...");

    document.addEventListener("DOMContentLoaded", function() {
        // 1. 建立「外層容器」
        const phoneWrapper = document.createElement("div");
        phoneWrapper.className = "gx-phone-wrapper";
        phoneWrapper.id = "gx-phone";

        // 2. 建立「手機主介面」 (這裡補上了關閉按鈕)
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
        <div style="color:#32CD32; padding:50px; font-family:Courier New, monospace;">
            [歸心物流終端]<br>
            ----------------<br>
            系統已就緒...<br>
            <button class="gx-interact-btn">【功能測試】</button>
        </div>
    </div>

    <div class="gx-crack-overlay"></div>
`;

        // 3. 組裝結構
        phoneWrapper.appendChild(phoneScreen);
        document.body.appendChild(phoneWrapper);

        // 4. 建立「終端機開關」
        const terminalTrigger = document.createElement("div");
        terminalTrigger.className = "gx-terminal-trigger";
        document.body.appendChild(terminalTrigger);

        // 5. 定義統一的切換函數
        function togglePhone() {
            const isOpen = phoneWrapper.classList.toggle("is-open");
            // 開啟時隱藏按鈕，關閉時顯示按鈕
            terminalTrigger.style.display = isOpen ? 'none' : 'flex';
        }

        // 6. 綁定監聽事件
        terminalTrigger.addEventListener("click", togglePhone);
        
        // 記得抓取剛剛生成的關閉按鈕
        const closeBtn = document.getElementById("gx-close");
        closeBtn.addEventListener("click", togglePhone);

        console.log("歸心物流終端機：骨架已掛載，等待貞人啟動。");
    });
})();

function updateClock() {
    const timeElement = document.getElementById('system-time');
    if (!timeElement) return;

    const now = new Date();
    
    // 將 hour12 改為 true，並且確保時區設定正確
    const timeString = now.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true // 關鍵在這裡：設為 true 就會自動顯示上午/下午
    });

    timeElement.innerText = timeString;
}

// 啟動計時器，每 1000 毫秒（1秒）刷新一次
setInterval(updateClock, 1000);

// 頁面載入時先執行一次，才不會等一秒才顯示
updateClock();