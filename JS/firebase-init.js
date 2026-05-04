// 請將原本的 10.x.x 全部替換為正確的 10.12.2
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 請換成新產生的 Key
const firebaseConfig = {
  apiKey: "AIzaSyCvEngtZ2RHi5UmvSNuldzprx4FgwNqSUI",
  authDomain: "guixin-express.firebaseapp.com",
  projectId: "guixin-express",
  storageBucket: "guixin-express.firebasestorage.app",
  messagingSenderId: "392731580810",
  appId: "1:392731580810:web:b02971e593fad3a60dd073",
  measurementId: "G-FVGS01H0YL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const style = "background: #000; color: #0f0; font-family: monospace; padding: 5px; font-size: 14px;";

// 執行匿名登入
signInAnonymously(auth)
  .then((userCredential) => {
    // 成功登入後，user 資料藏在 userCredential 裡面
    const user = userCredential.user;
    
    // 這裡使用 console 敘事
    console.log("%c[系統通知] 外部連結已確認...", style);
    console.log("%c[警告] 檢測到非法接入，正在分析IP位置...", "color: #ff0; font-weight: bold;");
    console.log("%c[殷商遺存] 啟動中... 身分ID: " + user.uid.substring(0, 8) + "...", "color: #0ff;");
  })
  .catch((err) => {
    // console.error 不支援 %c CSS 樣式，所以這裡用純文字
    console.error("[系統錯誤] 登入失敗：您已遺失在輪迴的洪流中...", err);
  });