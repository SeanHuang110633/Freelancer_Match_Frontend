<template>
  <el-menu
    v-if="authStore.isAuthenticated"
    class="navbar"
    mode="horizontal"
    :ellipsis="false"
    @select="handleMenuSelect"
  >
    <el-menu-item index="home" class="logo-title">
      <el-icon :size="22"><Platform /></el-icon>
      <span>Freelancer Match</span>
    </el-menu-item>

    <template v-if="authStore.userRole === '自由工作者'">
      <el-menu-item index="find-jobs" class="nav-item">
        <el-icon><Search /></el-icon>
        <span class="nav-text">Search Jobs</span>
      </el-menu-item>
    </template>
    <template v-if="authStore.userRole === '雇主'">
      <el-menu-item index="post-job" class="nav-item">
        <el-icon><DocumentAdd /></el-icon>
        <span class="nav-text">Post Jobs</span>
      </el-menu-item>
    </template>

    <div class="flex-grow" />

    <NotificationBell />

    <el-dropdown trigger="click">
      <span class="avatar-dropdown">
        <el-avatar :icon="UserFilled" size="default" />
        <span class="username">{{ authStore.user?.email }}</span>
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="navigateTo('/profile')">
            <el-icon><User /></el-icon>
            我的 Profile
          </el-dropdown-item>
          <el-dropdown-item divided @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            登出
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
</template>

<script setup>
// ... (script setup 內容保持不變, 記得匯入 Icon) ...
import { useAuthStore } from "@/store/authStore.js";
import { useRouter } from "vue-router";
import {
  UserFilled,
  ArrowDown,
  User,
  SwitchButton,
  Platform,
  Search,
  DocumentAdd, // HomeFilled 不再需要
} from "@element-plus/icons-vue";
import NotificationBell from "@/components/layout/NotificationBell.vue";

const authStore = useAuthStore();
const router = useRouter();

const handleMenuSelect = (index) => {
  if (index === "home") router.push("/");
  if (index === "find-jobs") router.push("/find-jobs");
  if (index === "post-job") router.push("/post-job");
};
const navigateTo = (path) => {
  router.push(path);
};
const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.flex-grow {
  flex-grow: 1;
}

/* (修改) Logo 和標題樣式 */
.logo-title {
  font-size: 1.3rem; /* 再放大一點 */
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-right: 20px; /* 與右側導航拉開距離 */
  .el-icon {
    margin-right: 8px;
  }
  /* 讓 Logo 標題不顯示底線 */
  &.el-menu-item {
    border-bottom: none !important;
    &:hover {
      background-color: transparent !important; /* 移除 hover 效果 */
    }
  }
}

/* (修改) 左側導航項目樣式 */
.nav-item {
  font-size: 1rem; /* 恢復或調整大小 */
  display: flex;
  align-items: center;
  .el-icon {
    margin-right: 5px;
  }
  @media (max-width: 768px) {
    .nav-text {
      display: none;
    }
  }
}

/* (移除) 中間標題樣式 */
/* .center-title { ... } */

.avatar-dropdown {
  /* ... (保持不變) ... */
  display: flex;
  align-items: center;
  padding: 0;
  height: 100%;
  cursor: pointer;
  outline: none;

  .username {
    margin-left: 8px;
    margin-right: 4px;
    font-size: 14px;
    @media (max-width: 768px) {
      display: none;
    }
  }
}
</style>
