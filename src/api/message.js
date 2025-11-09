// src/api/message.js

import http from "./http.js"; // 匯入我們在 http.js 中配置好的 Axios 實例

/**
 * (M8.1) 獲取當前使用者的所有聊天室列表
 *
 * 呼叫: GET /messages/rooms
 * (後端 router: message_router.py)
 *
 * @returns {Promise<List[RoomOut]>}
 */
export const getChatRooms = () => {
  return http.get("/messages/rooms");
};

/**
 * (M8.2) 獲取特定聊天室的歷史訊息
 * (後端 API 會自動將訊息標記為已讀)
 *
 * 呼叫: GET /messages/{roomId}/messages
 * (後端 router: message_router.py)
 *
 * @param {string} roomId
 * @returns {Promise<List[MessageOut]>}
 */
export const getRoomMessages = (roomId) => {
  return http.get(`/messages/${roomId}/messages`);
};

/**
 * (M8.1) 根據 M8.1 業務規則建立聊天室
 * (例如：提案被接受後，前端呼叫此 API)
 *
 * 呼叫: POST /messages/rooms
 * (後端 router: message_router.py)
 *
 * @param {string} projectId 關聯的案件 ID
 * @param {string} invitedUserId 另一方參與者的 User ID
 * @returns {Promise<RoomOut>}
 */
export const createChatRoom = (projectId, invitedUserId) => {
  // 後端 RoomCreate Schema 期望的 Body
  const roomData = {
    project_id: projectId,
    invited_user_id: invitedUserId,
  };
  return http.post("/messages/rooms", roomData);
};
