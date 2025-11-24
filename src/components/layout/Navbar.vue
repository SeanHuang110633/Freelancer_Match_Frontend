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
      <el-menu-item index="my-proposals" class="nav-item">
        <el-icon><DocumentAdd /></el-icon>
        <span class="nav-text">My Proposals</span>
      </el-menu-item>
      <el-menu-item index="my-contracts" class="nav-item">
        <el-icon><Document /></el-icon>
        <span class="nav-text">My Contracts</span>
      </el-menu-item>
      <el-menu-item index="chat-rooms" class="nav-item">
        <el-icon><ChatDotRound /></el-icon>
        <span class="nav-text">Chat Rooms</span>
      </el-menu-item>
    </template>
    <template v-if="authStore.userRole === '雇主'">
      <el-menu-item index="find-freelancers" class="nav-item">
        <el-icon><Search /></el-icon>
        <span class="nav-text">Find Freelancers</span>
      </el-menu-item>
      <el-menu-item index="post-job" class="nav-item">
        <el-icon><DocumentAdd /></el-icon>
        <span class="nav-text">Post Jobs</span>
      </el-menu-item>
      <el-menu-item index="my-jobs" class="nav-item">
        <el-icon><Folder /></el-icon>
        <span class="nav-text">My Jobs</span>
      </el-menu-item>
      <el-menu-item index="my-contracts" class="nav-item">
        <el-icon><Document /></el-icon>
        <span class="nav-text">My Contracts</span>
      </el-menu-item>
      <el-menu-item index="chat-rooms" class="nav-item">
        <el-icon><ChatDotRound /></el-icon>
        <span class="nav-text">Chat Rooms</span>
      </el-menu-item>
    </template>

    <div class="flex-grow" />

    <NotificationBell />

    <el-dropdown trigger="click">
      <span class="avatar-dropdown">
        <el-avatar
          :src="displayedAvatarUrl"
          :icon="UserFilled"
          size="default"
        />

        <span class="username">{{ displayedName }}</span>

        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="navigateTo('/profile')">
            <el-icon><User /></el-icon>
            My Profile
          </el-dropdown-item>
          <el-dropdown-item divided @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            Logout
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
</template>

<script setup>
// (!! 1. 新增 imports !!)
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/store/authStore.js";
import { useRouter } from "vue-router";
// (!! 2. 新增 API import !!)
import { getMyProfile } from "@/api/profile.js";
import { API_BASE_URL } from "@/config/env.js"; // 匯入後端 URL

import {
  UserFilled,
  ArrowDown,
  User,
  SwitchButton,
  Platform,
  Search,
  DocumentAdd,
  ChatDotRound,
  Folder,
  Document,
} from "@element-plus/icons-vue";
import NotificationBell from "@/components/layout/NotificationBell.vue";

const authStore = useAuthStore();
const router = useRouter();

// (!! 3. 新增 state !!)
const profile = ref(null); // 用於儲存 Profile 資料

// (!! 4. 新增 onMounted 邏輯 !!)
// 當 Navbar 元件掛載時，去抓取 Profile
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      const res = await getMyProfile();
      profile.value = res.data;
    } catch (err) {
      console.error("Navbar failed to load profile:", err);
      profile.value = null; // 確保在 404 (未建立) 時為 null
    }
  }
});

// (!! 5. 新增 computed 屬性 (複製自 ProfileView.vue) !!)
// 自動組合出完整的頭貼 URL
const displayedAvatarUrl = computed(() => {
  if (!profile.value) return null;

  // 根據角色決定要讀取哪個 URL 欄位
  let imageUrl = null;
  if (authStore.userRole === "雇主") {
    imageUrl = profile.value.company_logo_url;
  } else if (authStore.userRole === "自由工作者") {
    imageUrl = profile.value.avatar_url;
  }

  // 組合 URL
  if (imageUrl) {
    if (imageUrl.startsWith("http")) {
      return imageUrl; // 已經是 GCS 完整 URL
    }
    return `${API_BASE_URL}${imageUrl}`; // 本地 /static/... URL
  }
  return null;
});

// (!! 6. 新增 computed 屬性 (用於顯示姓名) !!)
const displayedName = computed(() => {
  if (profile.value) {
    // 優先顯示 Profile 中的姓名
    return profile.value.full_name || profile.value.company_name;
  }
  // 如果 Profile 還沒載入或不存在，退回顯示 email
  return authStore.user?.email;
});

// --- (以下函式保持不變) ---
const handleMenuSelect = (index) => {
  if (index === "home") router.push("/");
  if (index === "find-jobs") router.push("/find-jobs");
  if (index === "find-freelancers") router.push("/find-freelancers");
  if (index === "post-job") router.push("/post-job");
  if (index === "my-jobs") router.push("/my-jobs");
  if (index === "my-proposals") router.push("/my-proposals");
  if (index === "my-contracts") router.push("/my-contracts");
  if (index === "chat-rooms") router.push("/chat");
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
  /* (修改) 移除硬編碼的背景色，讓 :deep() 中的變數生效 */
  /* background-color: rgba(255, 255, 255, 0.8); */

  /* (新增) 需求二：覆蓋顏色 */
  /*
    我們使用 :deep() 來覆蓋 Element Plus 的 CSS 變數
    僅限於 .navbar 範圍內
  */
  :deep() {
    /* 1. 設定背景色 (使用 ProfileView 的背景色) */
    --el-menu-bg-color: rgba(252, 250, 248, 0.9);
    --el-menu-hover-bg-color: #f6f5f1; /* 使用 a79c7f 的 light-9 色階 */

    /* 2. 設定字體顏色 */
    --el-menu-text-color: #616130;

    /* 3. 設定高亮 (Active) 顏色 */
    --el-menu-active-color: #a79c7f; /* 使用 ProfileView 的主色 */

    /* 4. 移除 Active 狀態的底線 (border-bottom) */
    .el-menu-item.is-active {
      border-bottom: none;
    }

    /* 5. (可選) 右側 Dropdown 的 hover 顏色 */
    .avatar-dropdown:hover {
      background-color: var(--el-menu-hover-bg-color);
    }
  }
}
/* (新增結束) */

.flex-grow {
  flex-grow: 1;
}

.logo-title {
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-right: 20px;
  .el-icon {
    margin-right: 8px;
  }
  &.el-menu-item {
    border-bottom: none !important;
    &:hover {
      /* (修改) 允許 Logo hover 時有 hover 效果 */
      background-color: var(--el-menu-hover-bg-color) !important;
    }
  }
  /* (新增) Logo 啟用 Active 顏色 */
  &.is-active {
    color: var(--el-menu-active-color) !important;
  }
}

.nav-item {
  font-size: 1rem;
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

.avatar-dropdown {
  display: flex;
  align-items: center;
  padding: 0 12px; /* (修改) 增加 padding */
  height: 100%;
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s; /* (新增) */

  /* (!! 新增 !!) 確保頭貼圖片正確縮放 */
  .el-avatar {
    background-color: #ccc; /* 備用背景色 */
    border: 1px solid var(--el-border-color-lighter, #eee);

    :deep(img) {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
  /* (!! 新增結束 !!) */

  .username {
    margin-left: 8px;
    margin-right: 4px;
    font-size: 14px;
    /* (新增) 確保 username 也吃到 navbar 顏色 */
    color: var(--el-menu-text-color);
    @media (max-width: 768px) {
      display: none;
    }
  }

  /* (新增) 確保 icon 吃到 navbar 顏色 */
  .el-icon {
    color: var(--el-menu-text-color);
  }
}
</style>
