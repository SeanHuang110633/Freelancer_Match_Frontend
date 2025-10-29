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
            <el-avatar
              :size="60"
              :src="profile.avatar_url"
              :icon="UserFilled"
            />
            <div class="header-info">
              <h2>{{ profile.full_name || "未命名" }}</h2>
              <el-rate
                :model-value="profile.reputation_score"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value} 分"
              />
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
  </el-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getFreelancerProfileByUserId } from "@/api/profile.js";
import { UserFilled } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const profile = ref(null);
const userId = route.params.userId; // 從路由獲取 ID
const activeTab = ref("about");

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
  align-items: center;
  .header-info {
    margin-left: 15px;
    h2 {
      margin: 0 0 5px 0;
    }
  }
}
.skill-tag {
  margin: 5px;
}
.description-content {
  white-space: pre-wrap;
}
</style>
