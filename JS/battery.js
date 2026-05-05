/* ==========================================================
   battery.js - 電池能源管理模組
   ========================================================== */

   // 如果瀏覽器裡有存過電量，就拿出來用；沒有的話預設 100
   const savedBattery = localStorage.getItem('gx_battery');
window.batteryLevel = savedBattery !== null ? parseInt(savedBattery) : 100;

// 全域變數 (掛載在 window 下確保其他檔案也能存取)
window.lastAlertLevel = 0; // 紀錄上一次報警的層級
window.chargingInterval = null;
window.alert60Shown = false; 
window.alert30Shown = false;

// --- 電池核心邏輯UI 更新函式 (自動存檔) ---

function updateBatteryUI() {
    const fill = document.getElementById('battery-fill');
    const text = document.getElementById('battery-text');
    if (!fill) return;
    
    fill.style.width = batteryLevel + '%';
    text.innerText = batteryLevel + '%';

    // 【自動存檔機制】只要介面更新，就記錄電量
    localStorage.setItem('gx_battery', batteryLevel);

    // 即時更新提醒視窗內的數字
    const alertDisplay = document.getElementById('alert-level-display');
    if (alertDisplay) alertDisplay.innerText = batteryLevel;

    // --- 【狀態重置機制】---
    // 當電量充回 60% 以上，兩者都重置
    if (batteryLevel > 60) {
        alert60Shown = false;
        alert30Shown = false;
    } 
    // 當電量充回 30% 以上，重置 30% 的開關
    else if (batteryLevel > 30) {
        alert30Shown = false;
    }

    fill.classList.remove('warning', 'danger');
    if (batteryLevel < 30) fill.classList.add('danger');
    else if (batteryLevel < 60) fill.classList.add('warning');
    
    checkBatteryAlerts();
}

function checkBatteryAlerts() {
    // 【新增邏輯】如果系統正在充電中 (chargingInterval 不為 null)，
    // 我們就暫停所有彈出式警示，避免干擾使用者。
    if (chargingInterval !== null) {
        return; 
    }
    // 檢查 30% (優先級高，放在前面)
    if (batteryLevel <= 30 && !alert30Shown) {
        alert30Shown = true; // 鎖定狀態
        showBatteryAlert(batteryLevel);
    } 
    // 檢查 60% (如果已經不是 30% 的狀態)
    else if (batteryLevel <= 60 && !alert60Shown) {
        alert60Shown = true; // 鎖定狀態
        showBatteryAlert(batteryLevel);
    }
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
    const notifier = document.getElementById('gx-battery-notifier');
    if(notifier) notifier.style.display = 'none';
}

function showChargingIndicator() {
    const screen = document.querySelector('.gx-phone-screen');
    if(!screen) return;
    const indicator = document.createElement('div');
    indicator.className = 'gx-charging-indicator';
    indicator.id = 'gx-charging-box';
    indicator.innerHTML = `<div>⚡</div><div style="font-size:8px;">充電中</div>`;
    screen.appendChild(indicator);
}

function hideChargingIndicator() {
    const box = document.getElementById('gx-charging-box');
    if (box) box.remove();
}

function playChargingAnimation() { 
    console.log("動畫播放中..."); 
}

function handleCharge() {
    if (chargingInterval) return; 

    closeBatteryAlert();
    showChargingIndicator();
    playChargingAnimation();
    
    chargingInterval = setInterval(() => {
        if (batteryLevel < 100) {
            batteryLevel++;
            updateBatteryUI();
        } else {
            clearInterval(chargingInterval);
            chargingInterval = null;
            
            // --- 修正這裡：改用新的變數名稱 ---
            alert60Shown = false;
            alert30Shown = false;
            // -------------------------------
            
            hideChargingIndicator(); 
            alert("系統充能完畢。");
        }
    }, 1500);
}

function drainBattery(amount) {
    batteryLevel = Math.max(0, batteryLevel - amount);
    updateBatteryUI();
}

// --- 背景耗電循環 ---
setInterval(() => {
    if (chargingInterval !== null) {
        return; 
    }

    if (batteryLevel > 0) {
        drainBattery(1); // 每 5 秒消耗 1%，這裡可以根據需要調整
    }
}, 5000);

// 任何檔案只要發出 'battery-consume' 這個訊號，這裡就會收到
document.addEventListener('battery-consume', (e) => {
    const amount = e.detail.amount || 1; // 預設消耗 1%，除非 APP 指定
    drainBattery(amount);
});

// --- 修正：確保網頁一載入，UI 就會立刻更新為記憶中的數值 ---
window.addEventListener('DOMContentLoaded', () => {
    updateBatteryUI();
});