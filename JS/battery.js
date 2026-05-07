/* ==========================================================
   battery.js - 電池能源管理模組 (完整整合版)
   ========================================================== */

// --- 初始化變數 ---
let savedBattery = localStorage.getItem('gx_battery');
// 如果沒紀錄，預設 34%，否則讀取紀錄
window.batteryLevel = (savedBattery === null) ? 34 : parseInt(savedBattery);

// 全域變數掛載
window.lastAlertLevel = 0;
window.chargingInterval = null;
window.alert60Shown = false;
window.alert30Shown = false;

// --- 【關鍵修正】暴露給外部呼叫的更新函數 ---
window.updateBatteryUI = function() {
    // 只有在登入狀態下才更新 UI
    if (!localStorage.getItem('gx_user')) return;

    const fill = document.getElementById('battery-fill');
    const text = document.getElementById('battery-text');
    
    // 同步儲存
    localStorage.setItem('gx_battery', batteryLevel);
    localStorage.setItem('gx_last_visit', Date.now()); 

    if (fill) {
        fill.style.width = batteryLevel + '%';
        // 確保顏色正確
        fill.classList.remove('warning', 'danger');
        if (batteryLevel < 30) fill.classList.add('danger');
        else if (batteryLevel < 60) fill.classList.add('warning');
    }
    
    if (text) {
        text.innerText = batteryLevel + '%';
    }

    // 更新彈窗內的數字顯示
    const alertDisplay = document.getElementById('alert-level-display');
    if (alertDisplay) alertDisplay.innerText = batteryLevel;

    // 處理警示邏輯重置
    if (batteryLevel > 60) {
        alert60Shown = false;
        alert30Shown = false;
    } else if (batteryLevel > 30) {
        alert30Shown = false;
    }

    checkBatteryAlerts();
};

// --- 初始化與狀態恢復 ---
window.addEventListener('DOMContentLoaded', () => {
    // 檢查是否有登入，沒有的話先隱藏電量相關顯示或直接不運作
    if (!localStorage.getItem('gx_user')) return;

    const lastVisit = parseInt(localStorage.getItem('gx_last_visit') || Date.now());
    const isCharging = localStorage.getItem('isCharging') === 'true';
    const now = Date.now();
    const diffMs = now - lastVisit;

    // 計算離線期間的電量變化
    if (isCharging) {
        const gainedPower = Math.floor(diffMs / 1500);
        batteryLevel = Math.min(100, batteryLevel + gainedPower);
        handleCharge();
    } else {
        const lostDrain = Math.floor(diffMs / 5000); 
        batteryLevel = Math.max(0, batteryLevel - lostDrain);
    }

    // 初始更新 UI
    window.updateBatteryUI();
});

// --- 自動耗電邏輯 ---
setInterval(() => {
    if (!localStorage.getItem('gx_user')) return; 
    if (chargingInterval !== null) return;
    if (batteryLevel > 0) drainBattery(1);
}, 5000); // 每 5 秒扣 1% 電

// --- 輔助函數 ---

function drainBattery(amount) {
    batteryLevel = Math.max(0, batteryLevel - amount);
    window.updateBatteryUI();
}

function stopCharging() {
    if (chargingInterval) {
        clearInterval(chargingInterval);
        chargingInterval = null;
    }
    localStorage.setItem('isCharging', 'false');
    hideChargingIndicator();
}

function handleCharge() {
    if (chargingInterval) return;
    closeBatteryAlert();
    showChargingIndicator();
    localStorage.setItem('isCharging', 'true');
    localStorage.setItem('chargeStartTime', Date.now());
    chargingInterval = setInterval(() => {
        if (batteryLevel < 100) {
            batteryLevel++;
            window.updateBatteryUI();
        } else {
            stopCharging();
            // 充飽了可以選配一個提醒，如果不需要可以註解掉
            // alert("系統充能完畢。");
            alert60Shown = false; 
            alert30Shown = false;
        }
    }, 1500);
}

function checkBatteryAlerts() {
    if (chargingInterval !== null) return;
    if (batteryLevel <= 30 && !alert30Shown) {
        alert30Shown = true;
        showBatteryAlert(batteryLevel);
    } else if (batteryLevel <= 60 && !alert60Shown) {
        alert60Shown = true;
        showBatteryAlert(batteryLevel);
    }
}

function showBatteryAlert(level) {
    const notifier = document.getElementById('gx-battery-notifier');
    if(!notifier) return;
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
    if(document.getElementById('gx-charging-box')) return;
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

// 監聽器，供其他模組呼叫扣電
document.addEventListener('battery-consume', (e) => {
    if (!localStorage.getItem('gx_user')) return;
    const amount = e.detail.amount || 1;
    drainBattery(amount);
});