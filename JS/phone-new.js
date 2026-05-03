/* ==========================================================
   歸心物流終端機 - 完整整合版 (結構優化與版面修正)
   ========================================================== */

(function() {
    console.log("歸心物流終端機：系統校準中...");

    document.addEventListener("DOMContentLoaded", function() {
        
        // --- [SECTION: 初始化介面] ---
        const phoneWrapper = document.createElement("div");
        phoneWrapper.className = "gx-phone-wrapper";
        phoneWrapper.id = "gx-phone";

        // [新增] 側邊電池通知欄容器 (必須確保 position: absolute)
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

        // --- [SECTION: 效果與監聽] ---
        function randomGlitch() {
            const effect = Math.random() > 0.5 ? 'effect-flicker' : 'effect-glitch';
            phoneWrapper.classList.add(effect);
            setTimeout(() => { phoneWrapper.classList.remove(effect); }, 500);
            setTimeout(randomGlitch, Math.random() * 5000 + 3000);
        }
        randomGlitch();

        function togglePhone() {
            const isOpen = phoneWrapper.classList.toggle("is-open");
            terminalTrigger.style.display = isOpen ? 'none' : 'flex';
        }
        terminalTrigger.addEventListener("click", togglePhone);
        document.getElementById("gx-close").addEventListener("click", togglePhone);

        setInterval(updateClock, 1000);
        updateClock();
    });
})();

// --- [SECTION: 全域變數] ---
let batteryLevel = 100;
let warned60 = false;
let warned30 = false;
let chargingInterval = null;

// --- [SECTION: 電池管理系統] ---
function updateBatteryUI() {
    const fill = document.getElementById('battery-fill');
    const text = document.getElementById('battery-text');
    if (!fill) return;
    
    fill.style.width = batteryLevel + '%';
    text.innerText = batteryLevel + '%';

    // --- 新增這一段：即時更新提醒視窗內的數字 ---
    const alertDisplay = document.getElementById('alert-level-display');
    if (alertDisplay) {
        alertDisplay.innerText = batteryLevel;
    }
    // ----------------------------------------

    fill.classList.remove('warning', 'danger');
    
    if (batteryLevel < 30) fill.classList.add('danger');
    else if (batteryLevel < 60) fill.classList.add('warning');
    
    checkBatteryAlerts();
}

function checkBatteryAlerts() {
    if (batteryLevel <= 60 && !warned60) { warned60 = true; showBatteryAlert(60); }
    else if (batteryLevel <= 30 && !warned30) { warned30 = true; showBatteryAlert(30); }
}

function showBatteryAlert(level) {
    const notifier = document.getElementById('gx-battery-notifier');
    notifier.innerHTML = `
        <span onclick="closeBatteryAlert()" style="position:absolute; top:2px; right:6px; cursor:pointer; color:#FF4444; font-weight:bold;">×</span>
        <div style="flex-grow: 1; color: #32CD32; text-align:center;">
            <div style="font-size: 14px; color: #d41c16; font-weight:bold; margin-bottom:5px;">⚠️ 系統電力</div>
            <div style="font-size: 14px; margin-bottom:8px;">剩餘 <span id="alert-level-display">${level}</span>% 電量</div>
            <button onclick="handleCharge()" style="background:#32CD32; color: #d41c16; border:none; padding:4px 8px; cursor:pointer; font-weight:bold;">[ 充電 ]</button>
        </div>
    `;
    notifier.style.display = 'flex';
}

function closeBatteryAlert() {
    document.getElementById('gx-battery-notifier').style.display = 'none';
    if (chargingInterval) clearInterval(chargingInterval);
}

// [新增] 顯示右側指示框
function showChargingIndicator() {
    const screen = document.querySelector('.gx-phone-screen');
    const indicator = document.createElement('div');
    indicator.className = 'gx-charging-indicator';
    indicator.id = 'gx-charging-box';
    indicator.innerHTML = `<div>⚡</div><div style="font-size:8px;">充電中</div>`;
    screen.appendChild(indicator);
}

// [新增] 移除右側指示框
function hideChargingIndicator() {
    const box = document.getElementById('gx-charging-box');
    if (box) box.remove();
}

// [整合後的充電函數]
function handleCharge() {
    if (chargingInterval) return; 

    closeBatteryAlert();           // 1. 關閉提醒視窗
    showChargingIndicator();       // 2. 顯示右側小方塊
    playChargingAnimation();       // 3. 播放動畫
    
    chargingInterval = setInterval(() => {
        if (batteryLevel < 100) {
            batteryLevel++;
            updateBatteryUI();
        } else {
            clearInterval(chargingInterval);
            chargingInterval = null;
            warned60 = false; warned30 = false;
            hideChargingIndicator(); // 4. 充電完成移除小框框
            alert("系統充能完畢。");
        }
    }, 100);
}

function handleCharge() {
    // 1. 防呆機制：如果已經在充電中，就不要重複啟動
    if (chargingInterval) return; 

    // 2. 關閉提醒視窗
    closeBatteryAlert();
    
    // 3. 顯示右側充電狀態的小方塊
    showChargingIndicator();
    
    // 4. 播放充電動畫 (如果之後有做特效)
    playChargingAnimation();
    
    // 5. [核心邏輯] 開始計時充電
    chargingInterval = setInterval(() => {
        if (batteryLevel < 100) {
            batteryLevel++;
            updateBatteryUI(); // 更新 UI 顯示
        } else {
            // 充飽了，清理資源
            clearInterval(chargingInterval);
            chargingInterval = null;
            warned60 = false;
            warned30 = false;
            
            // 移除右側充電方塊
            hideChargingIndicator(); 
            
            alert("系統充能完畢。");
        }
    }, 1500); // 調整此數字可改變充電速度 (數字越小越快)
}

function drainBattery(amount) {
    batteryLevel = Math.max(0, batteryLevel - amount);
    updateBatteryUI();
}



// --- [SECTION: UI 與應用控制] ---
function updateClock() {
    const timeElement = document.getElementById('system-time');
    if (timeElement) timeElement.innerText = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function openApp(title, content) {
    drainBattery(10);
    const modal = document.getElementById('gx-modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-text').innerText = content;
    modal.style.display = 'block';
}

function closeApp() { document.getElementById('gx-modal').style.display = 'none'; }
function playChargingAnimation() { console.log("動畫播放中..."); }

// --- [最底部的安全耗電循環] ---
// 使用一個不會被外部干擾的獨立循環
setInterval(() => {
    // 檢查點 1: 是否正在充電？如果是，就跳過耗電
    if (chargingInterval !== null) {
        console.log("狀態：充電中 (耗電已暫停)");
        return; 
    }

    // 檢查點 2: 電量是否還有？
    if (batteryLevel > 0) {
        batteryLevel = Math.max(0, batteryLevel - 1);
        updateBatteryUI();
        console.log("狀態：背景耗電中... 目前電量:", batteryLevel + "%");
    } else {
        console.log("狀態：電力耗盡");
    }
}, 5000); // 測試用：改為 5 秒扣 1%，測試完畢請改回 30000 (30秒)