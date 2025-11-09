# SE Project - Frontend

## 專案結構說明

本專案採用 Vue 3 (Composition API)、Vite、Pinia、Vue Router 和 Element Plus 構建。目錄結構遵循模組化和分層的原則，以便於維護和擴充。

```
FREELANCER_MATCH_FRONTEND/
├── .vscode/
├── node_modules/
├── public/
├── src/
│   ├── api/
│   │   ├── auth.js
│   │   ├── contract.js
│   │   ├── http.js
│   │   ├── message.js           # (M8.1 新增)
│   │   ├── notification.js      # (M8.3 新增)
│   │   ├── profile.js
│   │   ├── project.js
│   │   ├── proposal.js
│   │   ├── recommendation.js
│   │   ├── tags.js
│   │   └── user.js
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   │   ├── Navbar.vue         # (M8.3 修改)
│   │   │   └── NotificationBell.vue # (M8.3 新增)
│   │   └── ChatBox.vue            # (M8.1 新增)
│   │
│   ├── config/
│   │   └── env.js
│   │
│   ├── router/
│   │   ├── guards.js
│   │   └── index.js             # (M8.1 修改)
│   │
│   ├── store/
│   │   ├── authStore.js
│   │   ├── chatStore.js         # (M8.1 新增)
│   │   ├── notificationStore.js # (M8.3 新增)
│   │   └── proposalStore.js
│   │
│   ├── styles/
│   │   └── main.scss
│   │
│   ├── views/
│   │   ├── auth/
│   │   │   └── AuthView.vue
│   │   ├── employer/
│   │   │   ├── JobCreateView.vue
│   │   │   ├── MyJobListView.vue
│   │   │   └── ProposalManagementView.vue
│   │   ├── freelancer/
│   │   │   ├── FreelancerDetailView.vue
│   │   │   └── JobListView.vue
│   │   ├── profile/
│   │   │   └── ProfileView.vue
│   │   ├── project/
│   │   │   └── ProjectDetailView.vue
│   │   └── shared/
│   │       ├── ContractListView.vue
│   │       ├── ContractView.vue     # (M8.1 修改)
│   │       └── ChatView.vue         # (M8.1 新增)
│   │   └── HomeView.vue           # (M8.3 修改)
│   │
│   ├── websocket/                 # (M8.1 新增)
│   │   └── socketService.js     # (M8.1 新增)
│   │
│   ├── App.vue                    # (M8.3 修改)
│   └── main.js
│
├── .gitignore
├── index.html
├── jsconfig.json
├── package.json
├── pnpm-lock.yaml
├── README.md
└── vite.config.js
```

**說明:**

- **`src/api/`:** 負責與後端 API 溝通，每個檔案對應一個或一組後端資源。`http.js` 是核心，處理通用的 Axios 設定。
- **`src/components/`:** 存放可在不同頁面重複使用的 UI 元件，例如 `Navbar` 或表單元件。
- **`src/views/`:** 存放頁面級別的元件，通常直接與某個路由對應。子資料夾按照功能模組劃分 (auth, employer, freelancer, profile, projects)。**注意：** 根據截圖 `image_082b73.png`，`HomeView.vue` 被錯誤地放在 `project` 資料夾下，它應該直接放在 `views/` 下。
- **`src/router/`:** 管理前端路由跳轉和訪問權限控制。
- **`src/store/`:** 使用 Pinia 進行全局狀態管理，目前主要是 `authStore`。
- **`src/styles/`:** 放置全局 CSS 或 Sass 檔案。
- **`main.js`:** 應用程式的起點，負責組裝所有部分。
- **根目錄配置文件:** 如 `vite.config.js`, `jsconfig.json` 等，用於配置開發工具和環境。

---

## technical stack

有些功能還沒開發到，所以相關的套件還沒裝。看 package.json 比較準。

| 層級             | 技術                           | 功能說明                                                       |
| ---------------- | ------------------------------ | -------------------------------------------------------------- |
| **主框架**       | 🟦 **Vue 3 (Composition API)** | 前端核心框架，提供元件化結構與反應式資料綁定。                 |
| **建構工具**     | ⚙️ **Vite**                    | 高效開發伺服器與打包工具，支援 HMR（Hot Module Replacement）。 |
| **路由管理**     | 🚦 **Vue Router 4**            | 負責頁面導向與角色權限守衛。                                   |
| **全局狀態管理** | 🧩 **Pinia**                   | 管理登入狀態、使用者資料、聊天室、通知、搜尋條件等。           |
| **HTTP 請求**    | 🌐 **Axios**                   | 呼叫後端 API，整合攔截器自動附帶 JWT Token。                   |
| **UI 元件庫**    | 🎨 **Element Plus**            | 提供商業級 UI 元件（表單、按鈕、對話框、分頁）。               |
| **表單驗證**     | 🧾 **Vee-Validate + Yup**      | 管理表單驗證規則（Email、密碼、必填欄位）。                    |
| **圖示系統**     | 🖼 **Font Awesome**             | 全局統一使用的圖示庫。                                         |
| **日期處理**     | ⏰ **Day.js**                  | 格式化時間（合約日期、通知時間、活動時間等）。                 |
| **樣式管理**     | 🎨 **Sass / CSS Modules**      | 支援變數化與模組化樣式，維護性高。                             |
| **即時通訊**     | 🔴 **WebSocket (原生 API)**    | 用於聊天室與通知的即時溝通。                                   |
| **PDF 支援**     | 📄 **pdfjs-dist** _(可選)_     | 驗證上傳檔案為有效 PDF，避免錯誤格式。                         |
| **開發輔助**     | 🧹 **ESLint + Prettier**       | 程式碼規範與自動格式化。                                       |
