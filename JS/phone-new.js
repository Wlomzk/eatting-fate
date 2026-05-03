/* ==========================================================
   歸心物流終端機 - 完整整合版 (加入側邊通知欄)
   ========================================================== */

(function() {
    console.log("歸心物流終端機：系統校準中...");

    document.addEventListener("DOMContentLoaded", function() {
        // --- [1. 初始化介面] ---
        const phoneWrapper = document.createElement("div");
        phoneWrapper.className = "gx-phone-wrapper";
        phoneWrapper.id = "gx-phone";

        // [新增] 側邊電池通知欄容器
        const batteryNotifier = document.createElement("div");
        batteryNotifier.id = "gx-battery-notifier";
        phoneWrapper.appendChild(batteryNotifier);

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

        const terminalTrigger = document.createElement("div");
        terminalTrigger.className = "gx-terminal-trigger";
        document.body.appendChild(terminalTrigger);

        // --- [2. 故障效果邏輯] ---
        function randomGlitch() {
            const effect = Math.random() > 0.5 ? 'effect-flicker' : 'effect-glitch';
            phoneWrapper.classList.add(effect);
            setTimeout(() => { phoneWrapper.classList.remove(effect); }, 500);
            setTimeout(randomGlitch, Math.random() * 5000 + 3000);
        }
        randomGlitch();

        // --- [3. 監聽事件綁定] ---
        function togglePhone() {
            const isOpen = phoneWrapper.classList.toggle("is-open");
            terminalTrigger.style.display = isOpen ? 'none' : 'flex';
        }
        terminalTrigger.addEventListener("click", togglePhone);
        document.getElementById("gx-close").addEventListener("click", togglePhone);

        // 初始化時間
        setInterval(updateClock, 1000);
        updateClock();
    });
})();

// --- [4. 全域變數與電池狀態] ---
let batteryLevel = 100;
let warned60 = false;
let warned30 = false;

// --- [5. 電池管理系統] ---
function updateBatteryUI() {
    const fill = document.getElementById('battery-fill');
    const text = document.getElementById('battery-text');
    if (!fill) return;

    fill.style.width = batteryLevel + '%';
    text.innerText = batteryLevel + '%';

    fill.classList.remove('warning', 'danger');
    if (batteryLevel < 30) fill.classList.add('danger');
    else if (batteryLevel < 60) fill.classList.add('warning');

    checkBatteryAlerts();
}

function checkBatteryAlerts() {
    if (batteryLevel <= 60 && !warned60) {
        warned60 = true;
        showBatteryAlert(60);
    } else if (batteryLevel <= 30 && !warned30) {
        warned30 = true;
        showBatteryAlert(30);
    }
}

// 修改後的顯示警告函數 (改為控制側邊欄)
function showBatteryAlert(level) {
    const notifier = document.getElementById('gx-battery-notifier');
    notifier.style.display = 'flex';
    notifier.style.flexDirection = 'column'; // 確保內容垂直排列
    notifier.style.alignItems = 'center';    // 置中對齊

    notifier.innerHTML = `
        <div style="font-size: 14px; margin-bottom:15px; border-bottom:1px solid #32CD32;">SYSTEM</div>
        <div style="font-size: 20px; margin-bottom:15px; color:#FF4444;">${level}%</div>
        <button onclick="handleCharge()" style="background:#32CD32; color:black; border:none; padding:8px 5px; cursor:pointer; font-size:12px; font-weight:bold; writing-mode:vertical-rl;">[充電]</button>
    `;
}

// 修改後的充電函數 (成功後關閉側邊欄)
function handleCharge() {
    console.log("充電中...");
    playChargingAnimation();
    
    setTimeout(() => {
        batteryLevel = 100;
        warned60 = false;
        warned30 = false;
        updateBatteryUI();
        
        // 關閉側邊欄
        const notifier = document.getElementById('gx-battery-notifier');
        notifier.style.display = 'none';
        
        alert("電源已連接，系統充能完畢。");
    }, 2000);
}

function drainBattery(amount) {
    batteryLevel = Math.max(0, batteryLevel - amount);
    updateBatteryUI();
}

setInterval(() => {
    if (batteryLevel > 0) drainBattery(1);
}, 30000);

// --- [6. UI 與 APP 控制] ---
function updateClock() {
    const timeElement = document.getElementById('system-time');
    if (!timeElement) return;
    timeElement.innerText = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function openApp(title, content) {
    drainBattery(10);
    const modal = document.getElementById('gx-modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-text').innerText = content;
    modal.style.display = 'block';
}

function closeApp() {
    document.getElementById('gx-modal').style.display = 'none';
}

function playChargingAnimation() {
    console.log("動畫播放中...");
}