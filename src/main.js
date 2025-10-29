import { createApp } from "vue";
import { createPinia } from "pinia"; // 匯入 Pinia
import App from "./App.vue";
import router from "./router"; // 匯入 Router
import { setupRouterGuards } from "./router/guards.js"; // (新增)
import { useAuthStore } from "./store/authStore.js"; // (新增)

// (新增) 匯入 Element Plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css"; // 匯入樣式
import * as ElementPlusIconsVue from "@element-plus/icons-vue"; // 匯入所有圖示

// (新增) 匯入我們的新全域樣式
import "./styles/main.scss";

const app = createApp(App);
const pinia = createPinia(); // 建立 Pinia 實例

app.use(pinia); // 掛載 Pinia
app.use(router); // 掛載 Router
app.use(ElementPlus); // (新增) 啟用 Element Plus

// (新增) 註冊所有 Element 圖示
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 設定路由守衛 : 在掛載路由守衛 *之前*，先檢查一次登入狀態
const authStore = useAuthStore(pinia);
authStore.checkAuth().then(() => {
  // (重要) 掛載路由守衛
  setupRouterGuards(router);

  app.mount("#app");
});
