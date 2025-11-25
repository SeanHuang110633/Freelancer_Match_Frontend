<template>
  <el-row justify="center">
    <el-col :xs="24" :sm="20" :md="16" :lg="12">
      <el-page-header @back="goBack" class="page-header">
        <template #content>
          <span class="text-large font-600 mr-3"> 工作者檔案 </span>
        </template>
      </el-page-header>

      <el-card v-if="isLoading" shadow="never">
        <el-skeleton :rows="5" animated />
      </el-card>

      <el-card v-if="!isLoading && profile" shadow="hover">
        <template #header>
          <div class="profile-header">
            <div class="header-left">
              <el-avatar
                :size="80"
                :src="resolveAvatarUrl(profile.avatar_url)"
                :icon="UserFilled"
              />
              <div class="header-info">
                <h2 class="profile-name">
                  {{ profile.full_name || "未命名" }}
                </h2>

                <div class="total-rating">
                  <el-rate
                    :model-value="profile.reputation_score"
                    disabled
                    show-score
                    text-color="#a79c7fb0"
                    void-color="#C6D1DE"
                    score-template="{value} 分"
                  />
                </div>

                <div class="ratings-breakdown">
                  <div class="rating-item">
                    <span class="rating-label">溝通協調</span>
                    <el-rate
                      :model-value="profile.avg_communication || 0"
                      disabled
                      text-color="#a79c7fb0"
                      void-color="#C6D1DE"
                      size="small"
                    />
                  </div>
                  <div class="rating-item">
                    <span class="rating-label">專業技術</span>
                    <el-rate
                      :model-value="profile.avg_professionalism || 0"
                      disabled
                      text-color="#a79c7fb0"
                      void-color="#C6D1DE"
                      size="small"
                    />
                  </div>
                  <div class="rating-item">
                    <span class="rating-label">準時交付</span>
                    <el-rate
                      :model-value="profile.avg_punctuality || 0"
                      disabled
                      text-color="#a79c7fb0"
                      void-color="#C6D1DE"
                      size="small"
                    />
                  </div>
                  <div class="rating-item">
                    <span class="rating-label">成果品質</span>
                    <el-rate
                      :model-value="profile.avg_quality || 0"
                      disabled
                      text-color="#a79c7fb0"
                      void-color="#C6D1DE"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="header-action" v-if="canSayHi">
              <el-button
                type="primary"
                :icon="ChatDotRound"
                @click="handleSayHi"
              >
                Say Hi
              </el-button>
            </div>
          </div>
        </template>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="關於我" name="about">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="個人簡介">
                <div class="description-content">
                  {{ profile.bio || "尚未提供" }}
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="聯絡電話">
                {{ profile.phone || "尚未提供" }}
              </el-descriptions-item>
              <el-descriptions-item label="GitHub">
                <el-link
                  v-if="profile.social_links?.github"
                  :href="profile.social_links.github"
                  target="_blank"
                >
                  {{ profile.social_links.github }}
                </el-link>
                <span v-else>尚未提供</span>
              </el-descriptions-item>
              <el-descriptions-item label="檔案可見度">
                {{ profile.visibility }}
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="技能" name="skills">
            <div v-if="profile.skills.length > 0">
              <el-tag
                v-for="skill in profile.skills"
                :key="skill.tag.tag_id"
                size="large"
                class="skill-tag"
                effect="plain"
              >
                {{ skill.tag.name }}
              </el-tag>
            </div>
            <el-empty description="尚未設定技能" v-else />
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <el-empty
        description="工作者檔案不存在或載入失敗"
        v-if="!isLoading && !profile"
      />
    </el-col>

    <el-dialog
      v-model="dialogVisible"
      title="發起對話邀請"
      width="400px"
      align-center
    >
      <p>請選擇您要洽談的案件 (僅列出招募中)：</p>
      <el-select
        v-model="selectedProjectId"
        placeholder="請選擇案件"
        style="width: 100%; margin-top: 10px"
      >
        <el-option
          v-for="job in myActiveJobs"
          :key="job.project_id"
          :label="job.title"
          :value="job.project_id"
        />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmSayHi"
            :loading="isProcessing"
            :disabled="!selectedProjectId"
          >
            開始聊天
          </el-button>
        </span>
      </template>
    </el-dialog>
  </el-row>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getFreelancerProfileByUserId } from "@/api/profile.js";
import { UserFilled, ChatDotRound } from "@element-plus/icons-vue";

import { useAuthStore } from "@/store/authStore.js";
import { getMyProjects } from "@/api/project.js";
import { createChatRoom } from "@/api/message.js";
import { API_BASE_URL } from "@/config/env.js";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const profile = ref(null);
const userId = route.params.userId;
const activeTab = ref("about");

const dialogVisible = ref(false);
const myActiveJobs = ref([]);
const selectedProjectId = ref("");
const isProcessing = ref(false);

const canSayHi = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user) return false;
  if (authStore.user.role !== "雇主") return false;
  if (authStore.user.user_id === userId) return false;
  return true;
});

const resolveAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

onMounted(async () => {
  if (!userId) {
    ElMessage.error("無效的使用者 ID");
    isLoading.value = false;
    return;
  }
  try {
    const res = await getFreelancerProfileByUserId(userId);
    profile.value = res.data;
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入工作者檔案失敗");
  }
  isLoading.value = false;
});

const goBack = () => {
  router.back();
};

const handleSayHi = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning("請先登入");
    router.push("/login");
    return;
  }

  try {
    const res = await getMyProjects();
    const allJobs = res.data;
    myActiveJobs.value = allJobs.filter((job) => job.status === "招募中");

    if (myActiveJobs.value.length === 0) {
      ElMessage.warning("您目前沒有招募中的案件，請先刊登需求才能發起對話。");
      return;
    }

    selectedProjectId.value = "";
    dialogVisible.value = true;
  } catch (error) {
    console.error(error);
    ElMessage.error("無法讀取您的案件列表");
  }
};

const confirmSayHi = async () => {
  if (!selectedProjectId.value) return;

  isProcessing.value = true;
  try {
    await createChatRoom(selectedProjectId.value, userId);
    ElMessage.success("聊天室建立成功！");
    dialogVisible.value = false;
    router.push("/chat");
  } catch (error) {
    const errorMsg = error.response?.data?.detail || "建立聊天室失敗";
    ElMessage.error(errorMsg);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  .header-left {
    display: flex;
    align-items: flex-start;
  }

  .header-info {
    margin-left: 20px;
    .profile-name {
      margin: 0 0 5px 0;
      font-size: 24px;
    }
    .total-rating {
      margin-bottom: 15px;
    }
  }
}

.ratings-breakdown {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 20px;
  margin-top: 10px;
  background-color: var(--el-fill-color-lighter);
  padding: 10px;
  border-radius: 4px;
}

.rating-item {
  display: flex;
  align-items: center;
  font-size: 13px;

  .rating-label {
    color: var(--el-text-color-secondary);
    margin-right: 8px;
    min-width: 60px;
  }
}

.skill-tag {
  margin: 5px;
}
.description-content {
  white-space: pre-wrap;
}

/* --- 主題樣式覆蓋 (Theme Overrides) --- */

/* Button */
:deep(.el-button--primary) {
  background-color: #a79c7fb0;
  border-color: #a79c7fb0;

  &:hover,
  &:focus {
    background-color: #7d7561b0;
    border-color: #7d7561b0;
  }
}

/* Rate (星星顏色) */
:deep(.el-rate__icon.is-active) {
  color: #a79c7fb0 !important;
}

/* Link */
:deep(.el-link.el-link--default:hover) {
  color: #a79c7fb0;
}

/* Tag */
:deep(.el-tag) {
  color: #616130;
  border-color: #a79c7fb0;
  background-color: rgba(167, 156, 127, 0.15);
}

/* Tabs */
:deep(.el-tabs__item.is-active) {
  color: #616130;
  font-weight: bold;
}

:deep(.el-tabs__item:hover) {
  color: #a79c7fb0;
}
</style>
