// src/store/notificationStore.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// 匯入 (步驟一) 建立的 API 函式
import {
  getMyNotifications,
  markNotificationAsRead,
} from "@/api/notification.js";

export const useNotificationStore = defineStore("notification", () => {
  // === State ===
  /**
   * @type {import('vue').Ref<Array<import('@/schemas/notification_schema').NotificationOut>>}
   */
  const notifications = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const router = useRouter();

  // === Getters (Computed) ===

  /**
   * (M8.3) 計算未讀通知的總數
   */
  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.is_read).length;
  });

  /**
   * (M8.3) (可選) 僅回傳未讀的通知列表
   * (供 HomeView.vue 的「重要提醒」使用)
   */
  const unreadNotifications = computed(() => {
    return notifications.value.filter((n) => !n.is_read);
  });

  // === Actions ===

  /**
   * (M8.3) 從後端獲取最新通知列表
   */
  async function fetchNotifications() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await getMyNotifications();
      notifications.value = response.data;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      error.value = "無法載入通知";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * (M8.3) 處理使用者點擊通知的行為
   * (標記已讀 + 導航)
   *
   * @param {object} notification - 被點擊的通知物件
   */
  async function handleNotificationClick(notification) {
    if (!notification) return;

    // 1. (後端更新) 如果通知尚未被讀取，才呼叫 API
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.notification_id);

        // 2. (前端即時更新)
        // 找到該通知在陣列中的索引
        const index = notifications.value.findIndex(
          (n) => n.notification_id === notification.notification_id
        );
        if (index !== -1) {
          notifications.value[index].is_read = true;
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        // 即使 API 失敗，也嘗試導航
      }
    }

    // 3. (導航) 如果有 link_url，則導航
    if (notification.link_url) {
      router.push(notification.link_url);
    }
  }

  return {
    // State
    notifications,
    isLoading,
    error,

    // Getters
    unreadCount,
    unreadNotifications,

    // Actions
    fetchNotifications,
    handleNotificationClick,
  };
});
