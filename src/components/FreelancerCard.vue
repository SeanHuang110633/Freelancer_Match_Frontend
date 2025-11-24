<template>
  <router-link :to="`/freelancers/${profile.user_id}`" class="freelancer-link">
    <el-card class="freelancer-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-avatar :size="40" :src="getFullAvatarUrl(profile.avatar_url)" />
          <div class="header-info">
            <span class="freelancer-name">{{ profile.full_name }}</span>
          </div>
          <el-tag effect="light" round>
            score : {{ profile.reputation_score.toFixed(1) }}
          </el-tag>
        </div>
      </template>

      <p class="freelancer-bio">
        {{
          profile.bio
            ? profile.bio.substring(0, 100) +
              (profile.bio.length > 100 ? "..." : "")
            : "No bio provided."
        }}
      </p>

      <div class="freelancer-skills">
        <el-tag
          v-for="skill in profile.skills.slice(0, 5)"
          :key="skill.tag.tag_id"
          type="info"
          size="small"
          class="skill-tag"
        >
          {{ skill.tag.name }}
        </el-tag>
        <el-tag
          v-if="profile.skills.length > 5"
          size="small"
          type="info"
          class="skill-tag"
        >
          +{{ profile.skills.length - 5 }} more
        </el-tag>
      </div>
    </el-card>
  </router-link>
</template>

<script setup>
import { User } from "@element-plus/icons-vue";
// (!! 📍 PRODUCTION / GCP DEPLOYMENT NOTE 📍 !!)
// 這裡是匯入您本地的後端 URL (例如 "http://127.0.0.1:8000")。
// 當您部署到 GCP 時，您前端的 production build (例如 /config/env.production.js)
// 必須將此變數修改為您在 GCP App Engine 或 Cloud Run 上的 "後端 API 服務 URL"。
import { API_BASE_URL } from "@/config/env.js";

// (!! 修正新增 !!)
/**
 * 組合完整的頭貼 URL
 * @param {string | null} relativeUrl - 資料庫中儲存的 URL (可能是相對路徑)
 * @returns {string | null} - 完整的、可顯示的 URL
 */
const getFullAvatarUrl = (relativeUrl) => {
  if (!relativeUrl) {
    console.log("No avatar URL provided.");
    return null; // 回傳 null，el-avatar 會顯示 icon
  }
  console.log("Original avatar URL from DB:", relativeUrl);

  // (!! 📍 PRODUCTION / GCP DEPLOYMENT NOTE 📍 !!)
  // 這裡的邏輯是關鍵。
  //
  // 情況 1 (推薦的上線方式):
  // 您的資料庫儲存完整的 GCP Cloud Storage URL (例如 "https://storage.googleapis.com/...")。
  // 這個 startsWith('http') 檢查 會捕捉到它，並直接使用該 URL。
  //
  // 情況 2 (本地開發方式):
  // 您的資料庫儲存相對路徑 (例如 "/static/avatar/avatar_1.webp")。
  // 這段 'else' 邏輯會將它與 API_BASE_URL (http://127.0.0.1:8000) 組合。
  //
  if (relativeUrl.startsWith("http")) {
    return relativeUrl;
  }

  // 組合後端 Base URL 和我們存的相對路徑
  return `${API_BASE_URL}${relativeUrl}`;
};

defineProps({
  profile: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
/* (新增) 連結樣式 */
.freelancer-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.freelancer-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* (套用) 柔和風格 */
  border: 1px solid var(--el-border-color);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  .freelancer-link:hover & {
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
  }

  /* (套用) 顏色 */
  :deep() {
    --el-text-color-primary: #616130;
    --el-text-color-regular: #616130;
    --el-text-color-secondary: #7d7561;
    --el-fill-color-lighter: #f6f5f1;
    --el-border-color-lighter: #eceae3;
  }

  :deep(.el-card__header) {
    padding: 10px 15px;
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow: hidden;
    }
    .freelancer-name {
      font-weight: bold;
      color: var(--el-text-color-primary);
    }
    .freelancer-email {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.el-card__body) {
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .freelancer-bio {
    color: var(--el-text-color-regular);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
  }
  .freelancer-skills {
    font-size: 12px;
    .skill-tag {
      margin: 2px 4px 2px 0;
      background-color: var(--el-fill-color-lighter);
      border-color: var(--el-border-color-lighter);
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
