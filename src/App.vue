<template>
  <el-container class="app-container">
    <el-header height="60px">
      <Navbar />
    </el-header>

    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from "vue"; // (M8.3 新增)
import Navbar from "@/components/layout/Navbar.vue";

// (M8.3 新增) 匯入 auth 和 notification stores
import { useAuthStore } from "@/store/authStore.js";
import { useNotificationStore } from "@/store/notificationStore.js";

const authStore = useAuthStore();
const notificationStore = useNotificationStore(); // (M8.3 新增)

// (M8.3 新增) 用於儲存輪詢計時器的 ID
let notificationIntervalId = null;

// (M8.3 新增) 啟動通知服務的函式
const startNotificationService = () => {
  // 1. 立即獲取一次
  notificationStore.fetchNotifications();

  // 2. 停止舊的輪詢 (如果存在)
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
  }

  // 3. 啟動新的輪詢 (例如每 60 秒)
  notificationIntervalId = setInterval(() => {
    notificationStore.fetchNotifications();
  }, 60000); // 60 秒
};

// (M8.3 新增) 停止通知服務的函式
const stopNotificationService = () => {
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
    notificationIntervalId = null;
  }
};

// --- (M8.3 新增) Vue 生命週期掛鉤 ---

onMounted(() => {
  // 應用程式載入時，如果已登入，立即啟動服務
  if (authStore.isAuthenticated) {
    startNotificationService();
  }
});

onUnmounted(() => {
  // 卸載時清除計時器
  stopNotificationService();
});

// 監控登入狀態的變化
watch(
  () => authStore.isAuthenticated, // 監控的來源
  (isLoggedIn, wasLoggedIn) => {
    if (isLoggedIn) {
      // 狀態：剛登入 (false -> true)
      startNotificationService();
    } else if (!isLoggedIn && wasLoggedIn) {
      // 狀態：剛登出 (true -> false)
      stopNotificationService();
      // (可選) 清空 store 中的通知
      notificationStore.notifications = [];
    }
  }
);
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%;
}

.el-header {
  padding: 0; /* 移除 ElHeader 預設 padding */
}

.el-main {
  /* ElMain 繼承自 main.scss 的 100% 高度和灰色背景
    我們需要加上 padding 來容納 fixed 的 Navbar
  */
  padding-top: 15px; /* Navbar 的高度 */
  padding-left: 20px; /* 給內容區一點 breathing room */
  padding-right: 20px;
  padding-bottom: 20px;

  /* 確保 main 區域高度計算正確 
    (100% 高度 - 60px Navbar)
  */
  height: calc(100% - 60px);
}
</style>
