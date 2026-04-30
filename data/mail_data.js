export const MAIL_DATABASE = {
  "EMP001": {
    userName: "拉姆",
    mails: [
      {
        id: "M1", date: "2024/10/20", sender: "HR部門",    // 這裡補上逗號（如果後面還有屬性
        title: "歡迎加入歸心物流",
        content: "這裡是你開始工作的地方，請遵守員工守則。", // 確保這裡有逗號   
        unlocked: true       // 預設為已解鎖，玩家登入即可見
      },
      {
        id: "M2", date: "2024/10/21", sender: "安全課",
        title: "【警告】關於深夜勤務的異常回報",
        content: "監控顯示你在凌晨三點對著空氣說話，請注意心理健康。",
        unlocked: false      // 預設隱藏，這就是我們要測試解鎖的「偽新增」信件
      },
      {
        id: "M3", date: "2026/02/21", sender: "和昌商旅",
        title: "薪資單已發放",
        content: "小奕的能力不錯，幫妳加薪到四萬。",
        unlocked: false      // 預設隱藏，這就是我們要測試解鎖的「偽新增」信件
      },
      {
        id: "M4", date: "2026/04/30", sender: "雷姆",
        title: "【警告】關於姐姐大人的補魔行動",
        content: "請小奕把拔不要讓拉姆姐姐長期處於魔力匱乏狀態，請適時為姐姐補充白濁滾燙的魔力好嗎?",
        unlocked: false      // 預設隱藏，這就是我們要測試解鎖的「偽新增」信件
      }
      /* 預留 */
    ]
  }
};

// TODO: 之後增加更多員工資料