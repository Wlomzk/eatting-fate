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
            <div class="gx-phone-close" id="gx-close">×</div>
            <div style="color:#32CD32; padding:50px; font-family:Courier New, monospace;">
                [歸心物流終端]<br>
                ----------------<br>
                系統已就緒...<br>
                貞人脈絡：已耦合<br>
                座標：Tamsui-Dist
            </div>
            <div id="gx-crack-overlay"></div>
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