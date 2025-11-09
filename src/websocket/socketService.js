// src/websocket/socketService.js

import { WS_BASE_URL } from "@/config/env.js"; //
import { useAuthStore } from "@/store/authStore.js"; //

// WebSocket 實例
let socket = null;

// 回調 (Callbacks) - 允許 Store 訂閱事件
let onMessageCallback = null;
let onErrorCallback = null;
let onCloseCallback = null;
let onOpenCallback = null;

/**
 * (M8.1) 連接到 WebSocket 伺服器
 * @param {string} roomId - 要加入的聊天室 ID
 */
function connect(roomId) {
  // 1. 檢查是否已有連線，如果更換房間則先斷開
  if (socket && socket.readyState === WebSocket.OPEN) {
    disconnect();
  } // 2. 獲取 Auth Token

  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) {
    console.error("WebSocket Error: No auth token found.");
    if (onErrorCallback) {
      onErrorCallback(new Error("No auth token"));
    }
    return;
  } // --- (必要修正) --- // 3. 構造後端 WebSocket URL // 後端路由: @router.websocket("/ws/{room_id}") // 路由前綴: prefix="/messages" // 基礎 URL: "ws://127.0.0.1:8000" // // 正確 URL 應為: ws://127.0.0.1:8000/messages/ws/{room_id}?token=... // // (移除錯誤的 "/api/v1" 前綴)

  const url = `${WS_BASE_URL}/messages/ws/${roomId}?token=${token}`; // --- (修正結束) --- // 4. 建立 WebSocket 實例
  try {
    socket = new WebSocket(url); //
  } catch (error) {
    console.error("WebSocket connection failed to initialize:", error);
    if (onErrorCallback) {
      onErrorCallback(error);
    }
    return;
  } // 5. 綁定事件監聽器 (保持不變)

  socket.onopen = (event) => {
    console.log("WebSocket connected to room:", roomId);
    if (onOpenCallback) {
      onOpenCallback(event);
    }
  };

  socket.onmessage = (event) => {
    // 後端廣播的是 MessageOut 的 JSON 字串
    try {
      const message = JSON.parse(event.data);
      if (onMessageCallback) {
        onMessageCallback(message);
      }
    } catch (e) {
      console.error("WebSocket Error: Failed to parse message JSON", e);
    }
  };

  socket.onerror = (event) => {
    console.error("WebSocket error:", event);
    if (onErrorCallback) {
      onErrorCallback(event);
    }
  };

  socket.onclose = (event) => {
    console.log("WebSocket disconnected:", event.reason, event.code);
    if (onCloseCallback) {
      onCloseCallback(event);
    }
    socket = null; // 清理實例
  };
}

/**
 * (M8.1) 斷開 WebSocket 連線 (保持不變)
 */
function disconnect() {
  if (socket) {
    socket.close(1000, "User disconnected");
    socket = null;
  }
}

/**
 * (M8.2) 發送訊息 (保持不變)
 * @param {object} messageObject - 符合後端 MessageIn 格式的物件
 * (例如: { content: "...", content_type: "text" })
 */
function sendMessage(messageObject) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      const messageString = JSON.stringify(messageObject);
      socket.send(messageString);
    } catch (e) {
      console.error("WebSocket Error: Failed to stringify message", e);
    }
  } else {
    console.error("WebSocket Error: Not connected.");
    if (onErrorCallback) {
      onErrorCallback(new Error("WebSocket not connected"));
    }
  }
}

// --- 事件訂閱 (保持不變) ---

function onMessage(callback) {
  onMessageCallback = callback;
}

function onError(callback) {
  onErrorCallback = callback;
}

function onClose(callback) {
  onCloseCallback = callback;
}

function onOpen(callback) {
  onOpenCallback = callback;
}

// 導出 Socket 服務 (保持不變)
export const socketService = {
  connect,
  disconnect,
  sendMessage,
  onMessage,
  onError,
  onClose,
  onOpen,
};
