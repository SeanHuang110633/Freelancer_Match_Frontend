// src/router/guards.js
import { useAuthStore } from "../store/authStore.js";

export const setupRouterGuards = (router) => {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // (重要) 應用程式啟動時，檢查 localStorage 是否有 token
    // (我們在 main.js 呼叫)
    // await authStore.checkAuth();

    const isAuthenticated = authStore.isAuthenticated;

    // 1. 目標是登入頁
    if (to.name === "Login") {
      if (isAuthenticated) {
        // 如果已登入，去登入頁 -> 導向首頁
        next({ name: "Home" });
      } else {
        // 未登入，放行
        next();
      }
    }
    // 2. 目標是其他頁面 (假設都需要登入)
    else {
      if (isAuthenticated) {
        // 已登入，放行
        next();
      } else {
        // 未登入，導向登入頁
        next({ name: "Login" });
      }
    }
  });
};
