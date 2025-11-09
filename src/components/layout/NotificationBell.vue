<template>
  <el-popover
    placement="bottom-end"
    :width="450"
    popper-class="notification-popover"
    trigger="click"
  >
    <template #reference>
      <el-badge
        is-dot
        :hidden="notificationStore.unreadCount === 0"
        class="notification-badge"
      >
        <el-icon
          class="bell-icon"
          :class="{ 'has-unread': notificationStore.unreadCount > 0 }"
        >
          <Bell />
        </el-icon>
      </el-badge>
    </template>

    <div class="notification-content">
      <div class="notification-header">
        <span>系統通知 (未讀: {{ notificationStore.unreadCount }})</span>
      </div>

      <el-scrollbar max-height="400px">
        <div
          v-if="notificationStore.notifications.length > 0"
          class="notification-list"
        >
          <div
            v-for="notification in notificationStore.notifications"
            :key="notification.notification_id"
            :class="['notification-item', { 'is-read': notification.is_read }]"
            @click="notificationStore.handleNotificationClick(notification)"
          >
            <el-icon class="notification-icon"><InfoFilled /></el-icon>
            <div class="notification-body">
              <span class="notification-title">{{ notification.title }}</span>
              <span class="notification-time">{{
                formatTimeAgo(notification.created_at)
              }}</span>
            </div>
          </div>
        </div>

        <el-empty
          v-else
          description="目前沒有任何通知"
          :image-size="60"
          class="notification-empty"
        />
      </el-scrollbar>
    </div>
  </el-popover>
</template>

<script setup>
import { computed } from "vue";
import { useNotificationStore } from "@/store/notificationStore.js";
import { Bell, InfoFilled } from "@element-plus/icons-vue";

const notificationStore = useNotificationStore();

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " 年前";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " 個月前";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " 天前";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " 小時前";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " 分鐘前";
  return "剛剛";
};
</script>

<style lang="scss" scoped>
/* 鈴鐺圖示的樣式 */
.notification-badge {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  cursor: pointer;
  outline: none;

  // 【優化 3】修正紅點位置，讓它更靠近鈴鐺中心
  // 注意：這裡使用 :deep 是因為 el-badge__content 是 el-badge 的子元素
  &:deep(.el-badge__content.is-dot) {
    top: 10px !important;
    right: 15px !important;
    height: 8px; /* 確保紅點大小合適 */
    width: 8px;
  }
}

.bell-icon {
  font-size: 20px;
  color: var(--el-text-color-primary);
  transition: color 0.3s ease;
}

// 【優化 2】Bell 圖示變色
.bell-icon.has-unread {
  color: var(--el-color-danger); /* 或使用 el-badge 預設的紅 */
}

.notification-badge:hover {
  background-color: var(--el-menu-hover-bg-color);
}

/* 彈出框的整體樣式 (其餘保持不變) */
.notification-content {
  // ... (所有 notification-content 相關樣式保持不變) ...
  display: flex;
  flex-direction: column;

  .notification-header {
    font-weight: bold;
    padding: 10px 15px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .notification-list {
    padding: 5px;
  }

  .notification-item {
    display: flex;
    align-items: flex-start; /* 確保內容自動換行時圖示不會跑到中間 */
    padding: 12px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    /* 未讀 (is-read: false) 的樣式 */
    &:not(.is-read) {
      .notification-title {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }

    /* 已讀 (is-read: true) 的樣式 */
    &.is-read {
      .notification-title,
      .notification-time,
      .notification-icon {
        color: var(--el-text-color-secondary) !important;
      }
    }

    .notification-icon {
      margin-right: 12px;
      margin-top: 2px; /* 微調圖示位置 */
      font-size: 16px;
      color: var(--el-color-primary);
    }

    .notification-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow-x: hidden;
      min-width: 0;

      .notification-title {
        font-size: 14px;
        line-height: 1.4;
        color: var(--el-text-color-regular);
        white-space: normal !important;
        word-break: break-word;
        overflow: visible;
        text-overflow: clip;
      }
      .notification-time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 2px;
      }
    }
  }

  .notification-empty {
    padding: 10px 0;
    :deep(.el-empty__description p) {
      font-size: 13px;
    }
  }
}
</style>

<style lang="scss">
.notification-popover.el-popover {
  padding: 0 !important;
}
</style>
