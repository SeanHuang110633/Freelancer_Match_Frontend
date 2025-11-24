<template>
  <div class="home-view">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="16">
        <div v-if="authStore.userRole === '自由工作者'">
          <h2>Recommended Jobs</h2>
          <el-card
            v-for="reco in recommendedJobs"
            :key="reco.project.project_id"
            class="recommendation-card job-card"
            shadow="hover"
            @click="goToProjectDetail(reco.project.project_id)"
          >
            <template #header>
              <div class="card-header">
                <span>{{ reco.project.title }}</span>
                <el-tag type="warning" effect="light" round>
                  Score: {{ reco.recommendation_score }}
                </el-tag>
              </div>
            </template>
            <el-row :gutter="10" class="meta-info">
              <el-col :span="12">
                <el-icon><Money /></el-icon>
                {{ reco.project.budget_min || "N/A" }} ~
                {{ reco.project.budget_max || "N/A" }}
              </el-col>
              <el-col :span="12">
                <el-icon><Location /></el-icon>
                {{ reco.project.location || "Not specified" }} /
                {{ reco.project.work_type }}
              </el-col>
            </el-row>
            <div class="skills-info">
              <el-tag
                v-for="skill in reco.project.skills"
                :key="skill.tag.tag_id"
                type="info"
                size="small"
                class="skill-tag"
                >{{ skill.tag.name }}</el-tag
              >
            </div>
          </el-card>
        </div>
        <div
          v-if="authStore.userRole === '自由工作者'"
          style="
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 20px;
          "
        >
          <el-button
            size="small"
            @click="loadJobPage(Math.max(0, jobOffset - jobLimit))"
            :disabled="jobOffset === 0 || isRecoLoading"
            :loading="isRecoLoading"
            >Prev</el-button
          >
          <span
            >Page: {{ Math.floor(jobOffset / jobLimit) + 1 }} /
            {{ Math.max(1, Math.ceil(jobTotal / jobLimit)) }}</span
          >
          <el-button
            size="small"
            @click="loadJobPage(jobOffset + jobLimit)"
            :disabled="jobOffset + jobLimit >= jobTotal || isRecoLoading"
            :loading="isRecoLoading"
            >Next</el-button
          >
        </div>

        <div v-if="authStore.userRole === '雇主'">
          <h2>Recommended Freelancers</h2>
          <el-card
            v-for="reco in recommendedFreelancers"
            :key="reco.profile.profile_id"
            class="recommendation-card freelancer-card"
            shadow="hover"
            @click="goToFreelancerDetail(reco.profile.user_id)"
          >
            <div class="freelancer-header">
              <el-avatar
                :size="85"
                :src="getFullAvatarUrl(reco.profile.avatar_url)"
                :icon="UserFilled"
              />
              <div class="header-info">
                <strong>{{ reco.profile.full_name || "Untitled" }}</strong>
                <p class="bio">{{ reco.profile.bio || "No bio provided" }}</p>
                <div>
                  <el-rate
                    :model-value="reco.profile.reputation_score"
                    disabled
                    size="small"
                    text-color="#ff9900"
                  />
                  <span>({{ reco.profile.reputation_score }} points)</span>
                </div>
              </div>
              <el-tag type="warning" effect="light" round class="score-tag">
                Score: {{ reco.recommendation_score }}
              </el-tag>
            </div>
            <div class="skills-info">
              <el-tag
                v-for="skill in reco.profile.skills"
                :key="skill.tag.tag_id"
                type="info"
                size="small"
                class="skill-tag"
                >{{ skill.tag.name }}</el-tag
              >
            </div>
          </el-card>
        </div>
        <div
          v-if="authStore.userRole === '雇主'"
          style="
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 20px;
          "
        >
          <el-button
            size="small"
            @click="
              loadFreelancerPage(
                Math.max(0, freelancerOffset - freelancerLimit)
              )
            "
            :disabled="freelancerOffset === 0 || isFreelancerRecoLoading"
            :loading="isFreelancerRecoLoading"
            >Prev</el-button
          >
          <span
            >Page: {{ Math.floor(freelancerOffset / freelancerLimit) + 1 }} /
            {{
              Math.max(1, Math.ceil(freelancerTotal / freelancerLimit))
            }}</span
          >
          <el-button
            size="small"
            @click="loadFreelancerPage(freelancerOffset + freelancerLimit)"
            :disabled="
              freelancerOffset + freelancerLimit >= freelancerTotal ||
              isFreelancerRecoLoading
            "
            :loading="isFreelancerRecoLoading"
            >Next</el-button
          >
        </div>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8">
        <el-card shadow="hover" class="sidebar-card">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><InfoFilled /></el-icon> Important Reminders</span
              >
            </div>
          </template>
          <el-alert
            v-if="!profileLoaded && !isProfileLoading"
            title="Complete Your Profile for Accurate Recommendations"
            type="warning"
            description="Please go to the 'My Profile' page to create your profile."
            show-icon
            :closable="false"
          >
            <el-button size="small" type="warning" plain @click="goToProfile">
              Go Now
            </el-button>
          </el-alert>
          <div v-if="profileLoaded || isProfileLoading">
            <div
              v-if="notificationStore.unreadNotifications.length > 0"
              class="notification-list"
            >
              <div
                v-for="notification in notificationStore.unreadNotifications.slice(
                  0,
                  5
                )"
                :key="notification.notification_id"
                class="notification-item"
                @click="notificationStore.handleNotificationClick(notification)"
              >
                <el-icon class="notification-icon"><InfoFilled /></el-icon>
                <div class="notification-content">
                  <span class="notification-title">{{
                    notification.title
                  }}</span>
                </div>
              </div>
            </div>

            <div
              v-else-if="profileLoaded && !isProfileLoading"
              class="notification-empty"
            >
              <el-empty
                description="No new important reminders"
                :image-size="60"
              />
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="sidebar-card">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><Compass /></el-icon> Quick Actions</span
              >
            </div>
          </template>
          <div class="quick-actions">
            <el-button text @click="goToProfile" class="action-button">
              <el-icon><User /></el-icon> My Profile
            </el-button>
            <el-button text @click="goToMyContracts" class="action-button">
              <el-icon><Tickets /></el-icon> My Contracts
            </el-button>

            <template v-if="authStore.userRole === '雇主'">
              <el-button text @click="goToPostJob" class="action-button">
                <el-icon><DocumentAdd /></el-icon> Post a Job
              </el-button>
              <el-button text @click="goToMyJobs" class="action-button">
                <el-icon><Tickets /></el-icon> My Jobs
              </el-button>
            </template>

            <template v-if="authStore.userRole === '自由工作者'">
              <el-button text @click="goToFindJobs" class="action-button">
                <el-icon><Search /></el-icon> Search Jobs
              </el-button>
            </template>

            <el-divider />

            <el-button
              text
              @click="handleLogout"
              class="action-button logout-button"
            >
              <el-icon><SwitchButton /></el-icon> Logout
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/store/authStore.js";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus"; // (Updated)
import {
  getJobRecommendations,
  getFreelancerRecommendations,
} from "@/api/recommendation.js";
import { getMyProfile } from "@/api/profile.js";
import {
  UserFilled,
  Money,
  Location,
  User,
  SwitchButton,
  Search,
  DocumentAdd,
  Compass,
  InfoFilled,
  Tickets,
} from "@element-plus/icons-vue";
import { useNotificationStore } from "@/store/notificationStore.js";

// (!! 📍 PRODUCTION / GCP DEPLOYMENT NOTE 📍 !!)
// 這裡是匯入您本地的後端 URL (例如 "http://127.0.0.1:8000")。
// 當您部署到 GCP 時，您前端的 production build (例如 /config/env.production.js)
// 必須將此變數修改為您在 GCP App Engine 或 Cloud Run 上的 "後端 API 服務 URL"。
import { API_BASE_URL } from "@/config/env.js";

const authStore = useAuthStore();
const router = useRouter();
const notificationStore = useNotificationStore();

// Recommendation State (Freelancer)
const recommendedJobs = ref([]);
const isRecoLoading = ref(false);
const jobLimit = ref(10);
const jobOffset = ref(0);
const jobHasMore = ref(false);
const jobTotal = ref(0);

// Recommendation State (Employer)
const recommendedFreelancers = ref([]);
const isFreelancerRecoLoading = ref(false);
const freelancerLimit = ref(10);
const freelancerOffset = ref(0);
const freelancerHasMore = ref(false);
const freelancerTotal = ref(0);

// Profile State
const profileLoaded = ref(false);
const isProfileLoading = ref(false);

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

// --- Navigation ---
const goToProfile = () => router.push("/profile");
const goToPostJob = () => router.push("/post-job");
const goToFindJobs = () => router.push("/find-jobs");
const goToProjectDetail = (projectId) => router.push(`/projects/${projectId}`);
const goToFreelancerDetail = (userId) => router.push(`/freelancers/${userId}`);
const goToMyJobs = () => router.push("/my-jobs");
const goToMyContracts = () => router.push("/my-contracts");

// Logout
const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

// Load Data
onMounted(async () => {
  // 1. Check Profile Status
  isProfileLoading.value = true;
  try {
    const profileRes = await getMyProfile();
    profileLoaded.value = !!profileRes.data;
  } catch (err) {
    profileLoaded.value = false;
  }
  isProfileLoading.value = false;

  // 2. Load Recommendations based on Role
  if (authStore.userRole === "自由工作者") {
    isRecoLoading.value = true;
    try {
      const res = await getJobRecommendations(jobLimit.value, jobOffset.value);
      recommendedJobs.value = res.data.items || [];
      jobTotal.value = res.data.total || 0;
      jobHasMore.value =
        jobOffset.value + (recommendedJobs.value.length || 0) < jobTotal.value;
    } catch (err) {
      ElMessage.error("Failed to load recommended jobs"); // (Updated)
    }
    isRecoLoading.value = false;
  }

  if (authStore.userRole === "雇主") {
    isFreelancerRecoLoading.value = true;
    try {
      const res = await getFreelancerRecommendations(
        freelancerLimit.value,
        freelancerOffset.value
      );
      recommendedFreelancers.value = res.data.items || [];
      freelancerTotal.value = res.data.total || 0;
      freelancerHasMore.value =
        freelancerOffset.value + (recommendedFreelancers.value.length || 0) <
        freelancerTotal.value;
    } catch (err) {
      ElMessage.error("Failed to load recommended freelancers"); // (Updated)
    }
    isFreelancerRecoLoading.value = false;
  }
});

// --- Pagination controls ---
const loadJobPage = async (newOffset) => {
  jobOffset.value = newOffset;
  isRecoLoading.value = true;
  try {
    const res = await getJobRecommendations(jobLimit.value, jobOffset.value);
    recommendedJobs.value = res.data.items || [];
    jobTotal.value = res.data.total || 0;
    jobHasMore.value =
      jobOffset.value + (recommendedJobs.value.length || 0) < jobTotal.value;
  } catch (err) {
    ElMessage.error("Failed to load recommended jobs"); // (Updated)
  }
  isRecoLoading.value = false;
};

const loadFreelancerPage = async (newOffset) => {
  freelancerOffset.value = newOffset;
  isFreelancerRecoLoading.value = true;
  try {
    const res = await getFreelancerRecommendations(
      freelancerLimit.value,
      freelancerOffset.value
    );
    recommendedFreelancers.value = res.data.items || [];
    freelancerTotal.value = res.data.total || 0;
    freelancerHasMore.value =
      freelancerOffset.value + (recommendedFreelancers.value.length || 0) <
      freelancerTotal.value;
  } catch (err) {
    ElMessage.error("Failed to load recommended freelancers"); // (Updated)
  }
  isFreelancerRecoLoading.value = false;
};
</script>

<style lang="scss" scoped>
.home-view {
  // --- 1. Define New Palette ---
  --app-bg-color: rgba(250, 247, 239, 0.973); // Soft beige
  --app-text-color: #616130;
  --app-text-color-secondary: #8a8a69;
  --app-hover-border-color: #dcd8c8;
  --app-hover-bg-color: rgba(252, 250, 248, 1); // More opaque
  --app-accent-color: #817c5b; // Muted olive-brown
  --app-warning-color: #c6a870; // Muted gold
  --app-danger-color: #b56f6f; // Brownish-red
  --app-info-bg-color: rgba(220, 216, 200, 0.3); // Muted beige bg for tags

  // --- 2. Override Element Plus Vars ---
  // This is the cleanest way to override the palette
  // It will affect all children Element Plus components within this view
  --el-text-color-primary: var(--app-text-color);
  --el-text-color-regular: var(--app-text-color);
  --el-text-color-secondary: var(--app-text-color-secondary);
  --el-text-color-placeholder: #a2a287;

  --el-bg-color: var(--app-bg-color);
  --el-bg-color-overlay: var(--app-hover-bg-color);
  --el-fill-color-light: var(--app-hover-bg-color);
  --el-fill-color-blank: transparent; // Make backgrounds transparent

  --el-card-bg-color: var(--app-bg-color);
  --el-card-border-color: transparent; // No borders on cards by default

  --el-border-color: var(--app-hover-border-color);
  --el-border-color-lighter: rgba(220, 216, 200, 0.5);
  --el-border-color-light: var(--app-hover-border-color);

  --el-color-primary: var(--app-accent-color);
  --el-color-primary-light-9: var(--app-info-bg-color);

  --el-color-warning: var(--app-warning-color);
  --el-color-warning-light-9: var(--app-info-bg-color);

  --el-color-info: var(--app-text-color-secondary);
  --el-color-info-light-9: var(--app-info-bg-color);

  --el-color-danger: var(--app-danger-color);
  --el-color-danger-light-9: rgba(181, 111, 111, 0.1);

  // --- 3. Apply Base Styles ---
  padding: 20px;
  color: var(--app-text-color);
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--app-text-color); // Explicitly set heading
}

.recommendation-card {
  margin-bottom: 20px;
  cursor: pointer;

  /* (Updated) Use new palette */
  background-color: var(--app-bg-color);
  border: 1px solid var(--app-hover-border-color); // Use the lighter border
  transition: border-color 0.3s ease, box-shadow 0.3s ease,
    background-color 0.3s ease;

  .card-header {
    // For job card
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* (Updated) Hover 效果 */
  &:hover {
    border-color: var(--app-accent-color); // Use accent on hover
    background-color: var(--app-hover-bg-color); // Use opaque bg on hover
    box-shadow: var(--el-box-shadow-light);
  }

  &.job-card {
    .meta-info {
      color: var(--app-text-color-secondary); // Use secondary text
      font-size: 13px;
      margin-bottom: 8px;
      .el-col {
        display: flex;
        align-items: center;
        .el-icon {
          margin-right: 4px;
          color: var(--app-text-color-secondary); // Icon color
        }
      }
    }
    .skills-info {
      font-size: 12px;
    }
  }

  &.freelancer-card {
    .freelancer-header {
      display: flex;
      /* (!! 修正 !!)：改為 flex-start，讓文字從頂部對齊放大的頭貼 */
      align-items: flex-start;
      margin-bottom: 10px;
      position: relative; /* 為了分數 Tag 定位 */

      /* (!! 修正新增 !!)：為 el-avatar 添加樣式 */
      .el-avatar {
        border: 1px solid var(--app-hover-border-color);
        font-size: 30px; /* 備用 icon 的大小 */
        flex-shrink: 0; /* 防止頭像被壓縮 */

        /* 確保圖片填滿 */
        :deep(img) {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
      }

      .header-info {
        /* (!! 修正 !!)：增加左邊距以適應 60px 的頭貼 */
        margin-left: 15px;
        strong {
          display: block;
          margin-bottom: 2px;
          color: var(--app-text-color); // Ensure strong is base color
        }
        div {
          display: flex;
          align-items: center;
        } /* 讓 Rate 和分數在同一行 */
        .el-rate {
          height: auto;
          margin-right: 5px;
          // The CSS var override will handle the star color
        }
        span {
          font-size: 12px;
          color: var(--app-text-color-secondary); // Use secondary text
        }
      }
      /* (新增) 分數 Tag 樣式 */
      .score-tag {
        position: absolute;
        top: 0;
        right: 0;
        // CSS var override will handle tag colors
      }
    }
    .skills-info {
      font-size: 12px;
    }
  }

  .skill-tag {
    margin: 2px 4px 2px 0;
    // CSS var override will handle tag colors
  }
}

.sidebar-card {
  margin-bottom: 20px;
  background-color: var(--app-bg-color); // Apply new BG
  border: 1px solid var(--app-hover-border-color); // Use lighter border

  .card-header {
    display: flex;
    align-items: center;
    font-weight: bold;
    .el-icon {
      margin-right: 6px;
      color: var(--app-text-color); // Header icon is primary text
    }
  }

  .notification-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .notification-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border: 1px solid var(--app-hover-border-color);

    &:hover {
      background-color: var(--app-hover-bg-color);
    }

    .notification-icon {
      font-size: 16px;
      margin-right: 10px;
      color: var(--app-warning-color); // Use warning color
    }

    .notification-content {
      display: flex;
      flex-direction: column;
      .notification-title {
        font-size: 14px;
        color: var(--app-text-color);
        line-height: 1.4;
      }
      .notification-time {
        font-size: 12px;
        color: var(--app-text-color-secondary);
      }
    }
  }

  .notification-empty {
    :deep(.el-empty__description p) {
      font-size: 13px;
      color: var(--app-text-color-secondary); // Apply secondary text
    }
  }

  .quick-actions {
    .action-button {
      display: block;
      width: 100%;
      justify-content: flex-start; /* 文字靠左 */
      margin-bottom: 5px;
      padding: 10px 15px;
      // CSS var override will handle text button color
      .el-icon {
        margin-right: 8px;
      }
      // Apply hover explicitly for text buttons in this new theme
      &:hover {
        background-color: var(--app-info-bg-color);
        color: var(--app-accent-color);
      }
    }
    .logout-button {
      color: var(--app-danger-color); // Apply danger color

      // Override icon color as well
      :deep(.el-icon) {
        color: var(--app-danger-color);
      }

      &:hover {
        color: var(--app-danger-color);
        background-color: var(--el-color-danger-light-9); // Use light danger bg
      }
    }
    .el-divider {
      margin: 10px 0;
      border-color: var(--app-hover-border-color); // Use lighter border
    }
  }
}
</style>
