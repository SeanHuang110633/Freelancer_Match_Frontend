// src/store/authStore.js
// 使用 Pinia 建立認證相關的 Store
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { login as apiLogin } from "../api/auth.js";
import { getMe as apiGetMe } from "../api/user.js";

/**
 * 認證 Store
 */
export const useAuthStore = defineStore("auth", () => {
  // State: 從 localStorage 讀取初始 token，保持登入狀態
  const token = ref(localStorage.getItem("access_token") || null);
  // user 初始值改為 null，或從 localStorage 讀取
  const user = ref(JSON.parse(localStorage.getItem("user_data")) || null);
  // Getters
  const isAuthenticated = computed(() => !!token.value);
  // user 角色
  const userRole = computed(() => user.value?.role || null);

  // Actions
  // 獲取使用者資料並儲存
  async function fetchUser() {
    if (!token.value) return false;
    try {
      const response = await apiGetMe();
      user.value = response.data;
      localStorage.setItem("user_data", JSON.stringify(response.data));
      return true;
    } catch (error) {
      console.error("獲取使用者資料失敗:", error);
      // (重要) Token 可能過期，觸發登出
      logout();
      return false;
    }
  }

  // 登入動作
  async function login(email, password) {
    try {
      const response = await apiLogin(email, password);
      const accessToken = response.data.access_token;
      token.value = accessToken;
      localStorage.setItem("access_token", accessToken); // (修正) <--- 登入成功後，立刻獲取使用者資料

      const fetchSuccess = await fetchUser();
      if (!fetchSuccess) {
        // 如果 fetchUser 失敗 (e.g., 帳號被鎖)，登入也算失敗
        return false;
      }
      console.log("登入成功 (已獲取 User)");
      return true;
    } catch (error) {
      console.error("登入失敗:", error.response?.data?.detail || error.message); // 登入失敗時清除 token
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data"); // (保持)
      token.value = null;
      user.value = null;
      return false;
    }
  }

  // 登出動作
  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    console.log("已登出");
  }

  // 應用程式啟動時檢查
  async function checkAuth() {
    if (token.value && !user.value) {
      await fetchUser();
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    login,
    logout,
    fetchUser,
    checkAuth,
  };
});
