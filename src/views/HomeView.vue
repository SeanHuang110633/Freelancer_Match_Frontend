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
                  推薦指數: {{ reco.recommendation_score }}
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
                {{ reco.project.location || "未指定" }} /
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
        <!-- pagination for jobs -->
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
                :size="40"
                :src="reco.profile.avatar_url"
                :icon="UserFilled"
              />
              <div class="header-info">
                <strong>{{ reco.profile.full_name || "未命名" }}</strong>
                <p class="bio">{{ reco.profile.bio || "此工作者無自介" }}</p>
                <div>
                  <el-rate
                    :model-value="reco.profile.reputation_score"
                    disabled
                    size="small"
                    text-color="#ff9900"
                  />
                  <span>({{ reco.profile.reputation_score }} 分)</span>
                </div>
              </div>
              <el-tag type="warning" effect="light" round class="score-tag">
                推薦指數: {{ reco.recommendation_score }}
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
        <!-- pagination for freelancers -->
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

      <!-- quick section -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card shadow="hover" class="sidebar-card">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><InfoFilled /></el-icon> 重要提醒</span
              >
            </div>
          </template>
          <el-alert
            v-if="!profileLoaded && !isProfileLoading"
            title="完成 Profile 以獲得精準推薦"
            type="warning"
            description="請前往「我的 Profile」頁面建立您的個人檔案。"
            show-icon
            :closable="false"
          >
            <el-button size="small" type="warning" plain @click="goToProfile">
              立即前往
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
                <el-icon class="notification-icon" color="#E6A23C"
                  ><InfoFilled
                /></el-icon>
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
              <el-empty description="目前沒有新的重要提醒" :image-size="60" />
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="sidebar-card">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><Compass /></el-icon> 快速操作</span
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
import { ref, onMounted, computed } from "vue"; // (新增 computed)
import { ElMessage } from "element-plus"; // (新增)
import {
  getJobRecommendations,
  getFreelancerRecommendations,
} from "@/api/recommendation.js";
import { getMyProfile } from "@/api/profile.js"; // (新增)
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

const authStore = useAuthStore();
const router = useRouter();
// (M8.3 新增) 實例化 Notification Store
const notificationStore = useNotificationStore();

// 推薦狀態 (工作者)
const recommendedJobs = ref([]);
const isRecoLoading = ref(false);
const jobLimit = ref(10);
const jobOffset = ref(0);
const jobHasMore = ref(false);
const jobTotal = ref(0);

// 推薦狀態 (雇主)
const recommendedFreelancers = ref([]);
const isFreelancerRecoLoading = ref(false);
const freelancerLimit = ref(10);
const freelancerOffset = ref(0);
const freelancerHasMore = ref(false);
const freelancerTotal = ref(0);

// (新增) Profile 狀態
const profileLoaded = ref(false);
const isProfileLoading = ref(false);

// --- 導航函式 ---
const goToProfile = () => router.push("/profile");
const goToPostJob = () => router.push("/post-job");
const goToFindJobs = () => router.push("/find-jobs");
const goToProjectDetail = (projectId) => router.push(`/projects/${projectId}`);
const goToFreelancerDetail = (userId) => router.push(`/freelancers/${userId}`);
const goToMyJobs = () => router.push("/my-jobs");
const goToMyContracts = () => router.push("/my-contracts");

// 登出
const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

// 載入資料
onMounted(async () => {
  // 1. 檢查 Profile 狀態
  isProfileLoading.value = true;
  try {
    const profileRes = await getMyProfile();
    profileLoaded.value = !!profileRes.data; // 如果 data 不為 null，則為 true
  } catch (err) {
    // 忽略錯誤，可能只是 404
    profileLoaded.value = false;
  }
  isProfileLoading.value = false;

  // 2. 根據角色載入推薦
  if (authStore.userRole === "自由工作者") {
    isRecoLoading.value = true;
    try {
      const res = await getJobRecommendations(jobLimit.value, jobOffset.value);
      // backend returns { items: [...], total: N }
      recommendedJobs.value = res.data.items || [];
      jobTotal.value = res.data.total || 0;
      jobHasMore.value =
        jobOffset.value + (recommendedJobs.value.length || 0) < jobTotal.value;
    } catch (err) {
      ElMessage.error("無法載入推薦案件");
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
      ElMessage.error("無法載入推薦人才");
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
    ElMessage.error("無法載入推薦案件");
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
    ElMessage.error("無法載入推薦人才");
  }
  isFreelancerRecoLoading.value = false;
};
</script>

<style lang="scss" scoped>
.home-view {
  padding: 20px;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.recommendation-card {
  margin-bottom: 20px;
  cursor: pointer;

  /* (新增) 預設邊框與過渡效果 */
  border: 1px solid var(--el-card-border-color);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  .card-header {
    // For job card
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* (新增) Hover 效果 */
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
  }

  &.job-card {
    .meta-info {
      color: #606266;
      font-size: 13px;
      margin-bottom: 8px;
      .el-col {
        display: flex;
        align-items: center;
        .el-icon {
          margin-right: 4px;
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
      align-items: center;
      margin-bottom: 10px;
      position: relative; /* 為了分數 Tag 定位 */
      .header-info {
        margin-left: 10px;
        strong {
          display: block;
          margin-bottom: 2px;
        }
        div {
          display: flex;
          align-items: center;
        } /* 讓 Rate 和分數在同一行 */
        .el-rate {
          height: auto;
          margin-right: 5px;
        }
        span {
          font-size: 12px;
          color: #909399;
        }
      }
      /* (新增) 分數 Tag 樣式 */
      .score-tag {
        position: absolute;
        top: 0;
        right: 0;
      }
    }
    .skills-info {
      font-size: 12px;
    }
  }

  .skill-tag {
    margin: 2px 4px 2px 0;
  }
}

.sidebar-card {
  margin-bottom: 20px;
  .card-header {
    display: flex;
    align-items: center;
    font-weight: bold;
    .el-icon {
      margin-right: 6px;
    }
  }

  /* (M8.3 新增) 通知列表樣式 */
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
    border: 1px solid var(--el-border-color-lighter);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .notification-icon {
      font-size: 16px;
      margin-right: 10px;
    }

    .notification-content {
      display: flex;
      flex-direction: column;
      .notification-title {
        font-size: 14px;
        color: var(--el-text-color-primary);
        line-height: 1.4;
      }
      .notification-time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .notification-empty {
    /* el-empty 預設有 padding，
       我們可以用 :deep 調整或直接使用
       <el-empty :image-size="60" /> 
       通常已足夠
    */
    :deep(.el-empty__description p) {
      font-size: 13px;
    }
  }

  .quick-actions {
    .action-button {
      display: block;
      width: 100%;
      justify-content: flex-start; /* 文字靠左 */
      margin-bottom: 5px;
      padding: 10px 15px;
      .el-icon {
        margin-right: 8px;
      }
    }
    .logout-button {
      color: var(--el-color-danger);
    }
    .el-divider {
      margin: 10px 0;
    }
  }
}
</style>
