// src/store/chatStore.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { socketService } from "@/websocket/socketService.js"; // 步驟三
import { getChatRooms, getRoomMessages } from "@/api/message.js"; // 步驟二

export const useChatStore = defineStore("chat", () => {
  // --- State ---
  const rooms = ref([]); // 聊天室列表 (RoomOut[])
  const activeRoomId = ref(null); // 當前選中的聊天室 ID
  const messages = ref([]); // 當前聊天室的訊息 (MessageOut[])

  const isLoadingRooms = ref(false);
  const isLoadingMessages = ref(false);
  const isConnecting = ref(false); // WebSocket 正在連線
  const isConnected = ref(false); // WebSocket 已連線

  // --- Getters ---
  const activeRoom = computed(() => {
    return rooms.value.find((room) => room.room_id === activeRoomId.value);
  });

  // --- 內部動作 (Internal Setup) ---

  /**
   * (M8.2) 訂閱 WebSocket 服務 (步驟三) 的事件
   */
  function _subscribeToSocketEvents() {
    socketService.onOpen(() => {
      isConnected.value = true;
      isConnecting.value = false;
      console.log("ChatStore: WebSocket Connected.");
    });

    socketService.onMessage((newMessage) => {
      // 伺服器廣播的是 MessageOut 的 JSON
      // socketService (步驟三) 已經幫我們 parse

      // 確保只將訊息添加到當前活躍的聊天室
      if (newMessage.room_id === activeRoomId.value) {
        messages.value.push(newMessage);
        // (TODO: 未來可在此處觸發 '標記已讀' API)
      }

      // (TODO: 未來可在此處觸發 M8.3 通知，如果聊天室非當前活躍)
    });

    socketService.onClose(() => {
      isConnected.value = false;
      isConnecting.value = false;
      console.log("ChatStore: WebSocket Disconnected.");
    });

    socketService.onError((error) => {
      isConnected.value = false;
      isConnecting.value = false;
      console.error("ChatStore: WebSocket Error:", error);
    });
  }

  // --- Actions ---

  /**
   * (M8.1) 獲取使用者的所有聊天室列表
   */
  async function fetchRooms() {
    isLoadingRooms.value = true;
    try {
      const response = await getChatRooms(); // 步驟二 API
      rooms.value = response.data; // 儲存 RoomOut[]
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
    } finally {
      isLoadingRooms.value = false;
    }
  }

  /**
   * (M8.1) 選擇一個聊天室 (載入歷史訊息並連線 WS)
   * @param {string} roomId
   */
  async function selectRoom(roomId) {
    if (!roomId || isConnecting.value) return;
    if (roomId === activeRoomId.value) return; // 已經在該房間

    // 1. 斷開舊連線
    if (isConnected.value) {
      socketService.disconnect(); // 步驟三
    }

    // 2. 重置狀態
    activeRoomId.value = roomId;
    messages.value = [];
    isLoadingMessages.value = true;
    isConnecting.value = true;

    try {
      // 3. 獲取歷史訊息
      const response = await getRoomMessages(roomId); // 步驟二 API
      messages.value = response.data; // 儲存 MessageOut[]
    } catch (error) {
      console.error("Failed to fetch room messages:", error);
    } finally {
      isLoadingMessages.value = false;
    }

    // 4. 連線到 WebSocket
    socketService.connect(roomId); // 步驟三
  }

  /**
   * (M8.2) 發送聊天訊息
   * @param {string} content - 訊息文字
   */
  function sendChatMessage(content) {
    if (!isConnected.value || !activeRoomId.value) {
      console.error("Cannot send message: WebSocket not connected.");
      return;
    }

    // 構造符合後端 MessageIn 格式的 payload
    // (後端 Service 會從 path 獲取 room_id，payload 只需 content)
    //
    const payload = {
      content: content,
      content_type: "text",
    };

    socketService.sendMessage(payload); // 步驟三
  }

  /**
   * (M8.1) 離開聊天 (斷開連線並清理)
   */
  function leaveChat() {
    socketService.disconnect(); // 步驟三
    activeRoomId.value = null;
    messages.value = [];
    isConnected.value = false;
    isConnecting.value = false;
  }

  // --- 初始化 ---
  _subscribeToSocketEvents(); // 立即訂閱事件

  return {
    // State
    rooms,
    activeRoomId,
    messages,
    isLoadingRooms,
    isLoadingMessages,
    isConnecting,
    isConnected,
    // Getters
    activeRoom,
    // Actions
    fetchRooms,
    selectRoom,
    sendChatMessage,
    leaveChat,
  };
});
