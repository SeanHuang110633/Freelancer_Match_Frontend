# Software Engineering Course Project

## 專案結構說明

本專案採用 Vue 3 (Composition API)、Vite、Pinia、Vue Router 和 Element Plus 構建。目錄結構遵循模組化和分層的原則，以便於維護和擴充。

```
freelancer-match-frontend/
├── node_modules/           # 專案依賴包
├── public/                 # Vite 靜態資源目錄 (不會被打包處理)
├── src/                    # 主要原始碼目錄
│   ├── api/                # API 請求封裝
│   │   ├── auth.js         # 身份驗證相關 API (登入、註冊)
│   │   ├── http.js         # Axios 實例配置與攔截器 (自動附加 Token, 處理 401)
│   │   ├── profile.js      # 個人/公司 Profile 相關 API (讀取、建立、更新)
│   │   ├── project.js      # 案件相關 API (刊登、搜尋、讀取詳情、讀取我的案件)
│   │   ├── recommendation.js # 推薦相關 API (推薦案件、推薦人才)
│   │   ├── tags.js         # 技能標籤 API (獲取所有標籤)
│   │   └── user.js         # 使用者資訊 API (獲取 /users/me)
│   ├── assets/             # 靜態資源 (圖片、字體等，會被 Vite 處理)
│   ├── components/         # 可重用 UI 元件
│   │   ├── auth/           # 身份驗證相關元件
│   │   │   ├── LoginForm.vue     # 登入表單元件
│   │   │   └── RegisterForm.vue  # 註冊表單元件
│   │   └── layout/         # 全局佈局相關元件
│   │       ├── Navbar.vue        # 頂部全局導覽列
│   │       └── HelloWorld.vue    # (Vite 預設元件，可移除)
│   ├── config/             # 專案配置文件
│   │   └── env.js          # 環境變數 (API_BASE_URL, WS_URL)
│   ├── router/             # Vue Router 路由配置
│   │   ├── guards.js       # 路由守衛 (檢查登入狀態、獲取用戶資料)
│   │   └── index.js        # 路由定義 (路徑與元件映射)
│   ├── store/              # Pinia 全局狀態管理
│   │   └── authStore.js    # 身份驗證狀態 Store (管理 token, user, 登入登出邏輯)
│   ├── styles/             # 全局樣式
│   │   └── main.scss       # 全局 Sass 樣式 (背景色、基礎佈局)
│   ├── views/              # 頁面級元件 (與路由對應)
│   │   ├── auth/           # 身份驗證頁面
│   │   │   └── AuthView.vue      # 登入/註冊容器頁面 (動態載入 LoginForm/RegisterForm)
│   │   ├── employer/       # 雇主相關頁面
│   │   │   ├── JobCreateView.vue # 刊登案件頁面
│   │   │   └── MyJobListView.vue   # 查看自己刊登案件列表頁面
│   │   ├── freelancer/     # 自由工作者相關頁面
│   │   │   ├── FreelancerDetailView.vue # 查看工作者公開檔案詳情頁面
│   │   │   └── JobListView.vue   # 搜尋/篩選案件列表頁面
│   │   ├── profile/        # 個人/公司 Profile 頁面
│   │   │   └── ProfileView.vue # 建立/編輯/查看 Profile 頁面 (含技能管理)
│   │   └── projects/       # (修正) 案件相關頁面 (HomeView 位置錯誤)
│   │       └── ProjectDetailView.vue # 查看案件詳情頁面
│   │   └── HomeView.vue        # 登入後首頁/儀表板 (顯示推薦列表、快速操作)
│   ├── App.vue             # Vue 應用根元件 (設定全局 Header+Main 佈局)
│   └── main.js             # 應用程式入口 (初始化 Vue, Pinia, Router, Element Plus)
├── .gitignore              # Git 忽略配置
├── index.html              # Vite 專案入口 HTML
├── jsconfig.json           # JavaScript 配置 (主要用於 VS Code 路徑別名 '@' 提示)
├── package.json            # 專案依賴與腳本配置
├── pnpm-lock.yaml          # pnpm 鎖定依賴版本文件
├── README.md               # 專案說明文件
└── vite.config.js          # Vite 配置文件 (含路徑別名 '@' 設定)
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
