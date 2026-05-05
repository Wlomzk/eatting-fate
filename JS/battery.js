/* ==========================================================
   battery.js - 電池能源管理模組 (優化：登入關聯版)
   ========================================================== */

// 1. 初始化電量邏輯
// 先確認是否為初次使用
let savedBattery = localStorage.getItem('gx_battery');

// 如果沒登入過，電量預設 31%，否則讀取紀錄
if (savedBattery === null) {
    window.batteryLevel = 31;
    localStorage.setItem('gx_battery', 31);
} else {
    window.batteryLevel = parseInt(savedBattery);
}

// 全域變數
window.lastAlertLevel = 0;
window.chargingInterval = null;
window.alert60Shown = false;
window.alert30Shown = false;

// --- 核心邏輯 ---

function updateBatteryUI() {
    // 只有在登入狀態下才更新 UI (避免沒登入時畫面閃爍)
    if (!localStorage.getItem('gx_user')) return;

    const fill = document.getElementById('battery-fill');
    const text = document.getElementById('battery-text');
    
    localStorage.setItem('gx_battery', batteryLevel);
    localStorage.setItem('gx_last_visit', Date.now()); 

    if (!fill) return;

    fill.style.width = batteryLevel + '%';
    text.innerText = batteryLevel + '%';

    // ... (維持你原本的狀態重置機制與類別切換)
    const alertDisplay = document.getElementById('alert-level-display');
    if (alertDisplay) alertDisplay.innerText = batteryLevel;

    if (batteryLevel > 60) {
        alert60Shown = false;
        alert30Shown = false;
    } else if (batteryLevel > 30) {
        alert30Shown = false;
    }

    fill.classList.remove('warning', 'danger');
    if (batteryLevel < 30) fill.classList.add('danger');
    else if (batteryLevel < 60) fill.classList.add('warning');
    
    checkBatteryAlerts();
}

// --- 初始化與狀態恢復 (加入登入判定) ---
window.addEventListener('DOMContentLoaded', () => {
    // 檢查是否有登入
    if (!localStorage.getItem('gx_user')) return;

    const lastVisit = parseInt(localStorage.getItem('gx_last_visit') || Date.now());
    const isCharging = localStorage.getItem('isCharging') === 'true';
    const now = Date.now();
    const diffMs = now - lastVisit;

    if (isCharging) {
        const gainedPower = Math.floor(diffMs / 1500);
        batteryLevel = Math.min(100, batteryLevel + gainedPower);
        handleCharge();
    } else {
        const lostDrain = Math.floor(diffMs / 5000); 
        batteryLevel = Math.max(0, batteryLevel - lostDrain);
    }

    updateBatteryUI();
});

// --- 自動耗電邏輯 (加入登入判定) ---
setInterval(() => {
    // 關鍵：如果沒登入，就不執行耗電
    if (!localStorage.getItem('gx_user')) return; 
    
    if (chargingInterval !== null) return;
    if (batteryLevel > 0) drainBattery(1);
}, 5000);

// --- 以下輔助函數維持原狀 ---

function drainBattery(amount) {
    batteryLevel = Math.max(0, batteryLevel - amount);
    updateBatteryUI();
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
            updateBatteryUI();
        } else {
            stopCharging();
            alert("系統充能完畢。");
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

document.addEventListener('battery-consume', (e) => {
    if (!localStorage.getItem('gx_user')) return;
    const amount = e.detail.amount || 1;
    drainBattery(amount);
});