<template>
  <el-row justify="center">
    <el-col :xs="24" :sm="20" :md="16" :lg="12">
      <el-page-header @back="goBack" class="page-header">
        <template #content>
          <span class="text-large font-600 mr-3"> 雇主檔案 </span>
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
                :src="resolveLogoUrl(profile.company_logo_url)"
                :icon="OfficeBuilding"
              />
              <div class="header-info">
                <h2 class="profile-name">
                  {{ profile.company_name || "未命名公司" }}
                </h2>

                <div class="rating-title">雇主信譽指標</div>

                <div class="ratings-breakdown">
                  <div class="rating-item">
                    <span class="rating-label">溝通協調</span>
                    <el-rate
                      :model-value="profile.avg_communication || 0"
                      disabled
                      text-color="#ff9900"
                      size="small"
                    />
                  </div>
                  <div class="rating-item">
                    <span class="rating-label">需求明確</span>
                    <el-rate
                      :model-value="profile.avg_quality || 0"
                      disabled
                      text-color="#ff9900"
                      size="small"
                    />
                  </div>
                  <div class="rating-item">
                    <span class="rating-label">福利報酬</span>
                    <el-rate
                      :model-value="profile.avg_compensation || 0"
                      disabled
                      text-color="#ff9900"
                      size="small"
                    />
                  </div>
                  <div class="rating-item">
                    <span class="rating-label">合作流程</span>
                    <el-rate
                      :model-value="profile.avg_process || 0"
                      disabled
                      text-color="#ff9900"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="公司介紹" name="about">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="簡介">
                <div class="description-content">
                  {{ profile.company_bio || "尚未提供公司簡介" }}
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="聯絡資訊" name="contact">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="聯絡 Email">
                {{ profile.contact_email || "尚未提供" }}
              </el-descriptions-item>
              <el-descriptions-item label="聯絡電話">
                {{ profile.contact_phone || "尚未提供" }}
              </el-descriptions-item>
              <el-descriptions-item label="網站/社群">
                <div
                  v-if="
                    profile.social_links &&
                    Object.keys(profile.social_links).length
                  "
                >
                  <div v-for="(link, key) in profile.social_links" :key="key">
                    <strong>{{ key }}: </strong>
                    <el-link :href="link" target="_blank">{{ link }}</el-link>
                  </div>
                </div>
                <span v-else>尚未提供</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <el-empty
        description="雇主檔案不存在或載入失敗"
        v-if="!isLoading && !profile"
      />
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getEmployerProfileByUserId } from "@/api/profile.js";
import { OfficeBuilding } from "@element-plus/icons-vue";
// (新增) 匯入 Base URL
import { API_BASE_URL } from "@/config/env.js";

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const profile = ref(null);
const userId = route.params.userId;
const activeTab = ref("about");

// (新增) 解析圖片 URL
const resolveLogoUrl = (url) => {
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
    const res = await getEmployerProfileByUserId(userId);
    profile.value = res.data;
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入雇主檔案失敗");
  }
  isLoading.value = false;
});

const goBack = () => {
  router.back();
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
    .rating-title {
      font-size: 12px;
      color: #909399;
      margin-bottom: 5px;
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

.description-content {
  white-space: pre-wrap;
}
</style>
