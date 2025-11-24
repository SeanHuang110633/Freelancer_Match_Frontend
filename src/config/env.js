// src/config/env.js

// 優先讀取環境變數，如果讀不到（例如本地沒設定），才使用預設的 localhost
// 注意：在 Vite 中，環境變數必須以 VITE_ 開頭才能暴露給前端程式碼

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// WebSocket URL 通常需要將 http 換成 ws，https 換成 wss
// 這裡做一個簡單的處理，如果 API_BASE_URL 是 https 開頭，WS 就用 wss，否則用 ws
const getWsUrl = () => {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL;
  }
  const url = new URL(API_BASE_URL);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}`;
};

export const WS_BASE_URL = getWsUrl();
