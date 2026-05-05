import { db, auth } from './firebase-init.js';
import { 
    collection, query, where, getDocs, updateDoc, doc, onSnapshot,
    addDoc, setDoc, serverTimestamp, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * 輔助函式：清理該使用者的舊 Session (防止資料庫爆炸)
 */
async function clearOldSessions(mobileUid) {
    const q = query(collection(db, "sessions"), where("mobileUid", "==", mobileUid));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
    await Promise.all(deletePromises);
}

/**
 * 1. 產生配對碼 (手機端使用)
 */
export async function createPairingSession(mobileUid) {
    try {
        // 先清理該使用者的舊 Session
        await clearOldSessions(mobileUid);
        
        const pairingCode = Math.floor(10000000 + Math.random() * 90000000).toString();
        
        const sessionRef = await addDoc(collection(db, "sessions"), {
            code: pairingCode,
            mobileUid: mobileUid,
            status: "waiting",
            createdAt: serverTimestamp()
        });
        
        console.log(`[系統] 配對碼生成成功: ${pairingCode}`);
        return { pairingCode, sessionId: sessionRef.id };
    } catch (error) {
        console.error("[系統錯誤] 生成配對碼失敗：", error);
    }
}

/**
 * 聰明的配對碼獲取：有舊的就回傳舊的，沒有才創新的
 */
export async function getOrGeneratePairingSession(mobileUid) {
    // 1. 先找找看有沒有已經存在的 Session
    const q = query(collection(db, "sessions"), where("mobileUid", "==", mobileUid), where("status", "==", "waiting"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // 找到了！回傳現有的代碼
        const doc = querySnapshot.docs[0];
        console.log("[系統] 偵測到現有配對碼，直接沿用:", doc.data().code);
        return { pairingCode: doc.data().code, sessionId: doc.id };
    }

    // 2. 沒找到，才執行「產生新碼」的動作
    console.log("[系統] 沒有現有配對碼，產生新的...");
    return await createPairingSession(mobileUid);
}

/**
 * 2. 監聽配對狀態 (手機端使用)
 */
export function listenForPairing(sessionId, onPaired) {
    const sessionDocRef = doc(db, "sessions", sessionId);
    
    return onSnapshot(sessionDocRef, (doc) => {
        if (doc.exists() && doc.data().status === "paired") {
            console.log("[系統] 電腦端已成功連線！");
            onPaired();
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
    } catch (error) {
        console.error("[系統錯誤] 連線失敗：", error.message);
    }
}