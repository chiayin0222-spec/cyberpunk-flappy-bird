# Cyberpunk Flappy Space Bird 🚀

* **GitHub 專案網址**：[https://github.com/chiayin0222-spec/cyberpunk-flappy-bird](https://github.com/chiayin0222-spec/cyberpunk-flappy-bird)
* **線上試玩 Demo**：[https://chiayin0222-spec.github.io/cyberpunk-flappy-bird/](https://chiayin0222-spec.github.io/cyberpunk-flappy-bird/)

這是一款賽博龐克（Cyberpunk）風格的太空版 Flappy Bird 網頁遊戲。玩家將操控一艘高科技太空飛船，穿越致命的霓虹雷射障礙物！

---

## 🎮 遊戲特色

* **賽博龐克霓虹美學**：飛船與雷射障礙物均採用 HTML5 Canvas 動態渲染，帶有迷人的霓虹漸層與發光特效。
* **🤖 AI 自動駕駛模式**：內建自動避障演算法。點擊「AI MODE」按鈕（或按鍵盤 `A` 鍵）即可啟動 AI 自動遊玩，AI 會實時偵測前方雷射通道並調整飛船高度。
* **🔊 音量即時調整**：整合多種復古音效與背景音樂，並提供音量控制滑桿，可在遊戲過程中即時靜音或調整音量大小。
* **📐 障礙物大小控制（新功能）**：新增 `SIZE` 調整滑桿，可將雷射障礙物的寬度在 `50%` 至 `200%` 之間即時縮放，增加遊戲樂趣與挑戰難度！
* **🏆 本地最高分紀錄**：採用瀏覽器 `localStorage` 技術，會自動儲存您的最高分紀錄。

---

## ⌨️ 遊戲操作

| 操作動作 | 對應按鍵 / 滑鼠操作 | 說明 |
| :--- | :--- | :--- |
| **飛船跳躍** | `Space` (空白鍵) / `ArrowUp` (上鍵) / `X` 鍵 / 點擊畫布 | 控制飛船向上飛躍 |
| **重新開始** | 飛船跳躍鍵（同上） | 遊戲結束時點擊可重新開始 |
| **切換 AI 模式** | 鍵盤 `A` 鍵 / 點擊 **AI MODE** 按鈕 | 切換 AI 自動避障模式 |

---

## 🛠️ 開發技術

* **核心語法**：Vanilla JavaScript (ES6), HTML5 Canvas
* **視覺樣式**：CSS3 (自訂霓虹變數、毛玻璃面板效果、動態星空背景動畫)
* **音訊處理**：Web Audio API
