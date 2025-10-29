import axios from "axios";
import { API_BASE_URL } from "../config/env.js";

const http = axios.create({
  baseURL: API_BASE_URL,
});

// (重要) 新增 Request 攔截器
http.interceptors.request.use(
  async (config) => {
    // 動態 import store
    const { useAuthStore } = await import("../store/authStore.js");
    const authStore = useAuthStore();

    const token = authStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// (可選，但建議) 新增 Response 攔截器 (處理 401 Token 過期)
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("偵測到 401 (Unauthorized)，自動登出");
      const { useAuthStore } = await import("../store/authStore.js");
      const authStore = useAuthStore();
      authStore.logout();
      // 導向到登入頁
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
