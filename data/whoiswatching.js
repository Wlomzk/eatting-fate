// whoiswatching.js
import { MAIL_DATABASE } from './mail_data.js'; // 假設你把資料庫分開存放

export const ACCOUNTS = {
    "EMP001": {
        name: "拉姆",
        password: "HOME666",
        role: "admin",
        permissions: ["view_parcels", "contact_cs", "oracle_access"] 
    },
    "EMP002": {
        name: "失蹤者",
        password: "LINGSHU_REVENGE", // 或者是某個劇情相關密碼
        role: "user",
        permissions: ["view_parcels"] // APP 的權限列表，根據角色不同可能會有不同的權限
    }
};

export const AuthSystem = {
    checkLogin: function(id, pass) {
        const user = ACCOUNTS[id];
        
        // 驗證邏輯
        if (user && user.password === pass) {
            return { success: true, user: user };
        }
        return { success: false, message: "存取拒絕：無效的員工 ID 或 Password。" };
    }
};