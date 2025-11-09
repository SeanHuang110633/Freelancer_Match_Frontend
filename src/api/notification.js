// src/api/notification.js

// 匯入我們配置好的 Axios 實例
import http from "./http.js";

/**
 * (M8.3) 獲取我的通知列表
 *
 * 呼叫: GET /notifications/my
 * (後端 router: notification_router.py)
 *
 * @returns {Promise<List[NotificationOut]>}
 */
export const getMyNotifications = () => {
  return http.get("/notifications/my");
};

/**
 * (M8.3) 將通知設為已讀
 *
 * 呼叫: PATCH /notifications/{notificationId}/read
 * (後端 router: notification_router.py)
 *
 * @param {string} notificationId
 * @returns {Promise<NotificationOut>}
 */
export const markNotificationAsRead = (notificationId) => {
  // 根據我們的後端規劃，此 API 不需要 body，
  // 僅需在 URL 中傳遞 ID
  return http.patch(`/notifications/${notificationId}/read`);
};
