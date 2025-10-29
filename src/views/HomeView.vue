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
            <p>(todo : 系統通知資訊會放這裡)</p>
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

const authStore = useAuthStore();
const router = useRouter();

// 推薦狀態 (工作者)
const recommendedJobs = ref([]);
const isRecoLoading = ref(false);

// 推薦狀態 (雇主)
const recommendedFreelancers = ref([]);
const isFreelancerRecoLoading = ref(false);

// (新增) Profile 狀態
const profileLoaded = ref(false);
const isProfileLoading = ref(false);

// --- 導航函式 ---
const goToProfile = () => router.push("/profile");
const goToPostJob = () => router.push("/post-job");
const goToFindJobs = () => router.push("/find-jobs");
const goToProjectDetail = (projectId) => router.push(`/projects/${projectId}`);
const goToFreelancerDetail = (userId) => router.push(`/freelancers/${userId}`);
const goToMyJobs = () => router.push("/my-jobs"); // (新增)

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
      const res = await getJobRecommendations();
      recommendedJobs.value = res.data;
      console.log(res.data);
    } catch (err) {
      ElMessage.error("無法載入推薦案件");
    }
    isRecoLoading.value = false;
  }

  if (authStore.userRole === "雇主") {
    isFreelancerRecoLoading.value = true;
    try {
      const res = await getFreelancerRecommendations();
      recommendedFreelancers.value = res.data;
    } catch (err) {
      ElMessage.error("無法載入推薦人才");
    }
    isFreelancerRecoLoading.value = false;
  }
});
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
