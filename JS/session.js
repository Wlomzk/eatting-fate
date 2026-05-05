// session.js
import { db, auth } from './firebase-init.js';
import { 
    collection, query, where, getDocs, updateDoc, doc, onSnapshot,
    addDoc, setDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * 1. 產生配對碼 (手機端使用)
 * @param {string} mobileUid - 當前手機的 UID
 */
export async function createPairingSession(mobileUid) {
    try {
        const pairingCode = Math.floor(10000000 + Math.random() * 90000000).toString();
        
        const sessionRef = await addDoc(collection(db, "sessions"), {
            code: pairingCode,
            mobileUid: mobileUid,
            status: "waiting", // 等待 PC 連接
            createdAt: serverTimestamp()
        });
        
        console.log(`[系統] 配對碼生成成功: ${pairingCode}`);
        return { pairingCode, sessionId: sessionRef.id };
    } catch (error) {
        console.error("[系統錯誤] 生成配對碼失敗：", error);
    }
}

/**
 * 2. 監聽配對狀態 (手機端使用)
 * 讓手機在畫面顯示「配對中」，一旦 PC 連上，立刻變更狀態
 */
export function listenForPairing(sessionId, onPaired) {
    const sessionDocRef = doc(db, "sessions", sessionId);
    
    // 即時監聽這個 Session 的狀態
    return onSnapshot(sessionDocRef, (doc) => {
        if (doc.exists() && doc.data().status === "paired") {
            console.log("[系統] 電腦端已成功連線！");
            onPaired(); // 觸發成功後的回呼函式
        }
    });
}

/**
 * 3. 電腦端：輸入代碼進行配對
 */
export async function joinPairingSession(inputCode, pcUid) {
    try {
        const q = query(collection(db, "sessions"), where("code", "==", inputCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("查無此配對碼。");
            return false;
        }

        const sessionDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "sessions", sessionDoc.id), {
            pcUid: pcUid,
            status: "paired"
        });

        console.log("[系統] 配對成功！");
        return true;
    } catch (error) {
        console.error("[系統錯誤] 連線失敗：", error);
        return false;
    }
}

/**
 * 4. 心跳監測
 */
export async function testConnection() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            lastSeen: new Date().toISOString(),
            status: "online"
        }, { merge: true });
        console.log("%c[系統] 連線正常", "color: #0f0;");
    } catch (error) {
        console.error("[系統錯誤] 連線失敗：", error.message);
    }
}