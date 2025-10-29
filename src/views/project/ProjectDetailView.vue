<template>
  <el-row justify="center">
    <el-col :xs="24" :sm="20" :md="16" :lg="12">
      <el-page-header @back="goBack" class="page-header">
        <template #content>
          <span class="text-large font-600 mr-3"> 案件詳情 </span>
        </template>
      </el-page-header>

      <el-card v-if="isLoading" shadow="never">
        <el-skeleton :rows="5" animated />
      </el-card>

      <el-card v-if="!isLoading && project" shadow="hover">
        <template #header>
          <h2>{{ project.title }}</h2>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="預算">
            {{ project.budget_min || "N/A" }} ~
            {{ project.budget_max || "N/A" }}
          </el-descriptions-item>
          <el-descriptions-item label="案件狀態">
            <el-tag :type="statusTagType(project.status)">
              {{ project.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="地區">
            {{ project.location || "未指定" }}
          </el-descriptions-item>
          <el-descriptions-item label="工作型態">
            {{ project.work_type }}
          </el-descriptions-item>
          <el-descriptions-item label="需求人數">
            {{ project.required_people }} 人
          </el-descriptions-item>
          <el-descriptions-item label="提案截止">
            {{ formatDate(project.proposals_deadline) }}
          </el-descriptions-item>
          <el-descriptions-item label="案件完成日">
            {{ formatDate(project.completion_deadline) }}
          </el-descriptions-item>
          <el-descriptions-item label="所需技能" :span="2">
            <el-tag
              v-for="skill in project.skills"
              :key="skill.tag.tag_id"
              type="info"
              size="small"
              class="skill-tag"
            >
              {{ skill.tag.name }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="詳細需求內容" :span="2">
            <div class="description-content">{{ project.description }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-buttons" v-if="authStore.userRole === '自由工作者'">
          <el-divider />
          <el-button type="primary">
            <el-icon><Pointer /></el-icon> 提交提案 (TODO)
          </el-button>
        </div>
      </el-card>

      <el-empty
        description="案件不存在或載入失敗"
        v-if="!isLoading && !project"
      />
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore.js";
import { ElMessage } from "element-plus";
import { getProjectById } from "@/api/project.js";
import dayjs from "dayjs"; // (新增) 用於格式化日期
import { Pointer } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(true);
const project = ref(null);
const projectId = route.params.projectId; // 從路由獲取 ID

onMounted(async () => {
  if (!projectId) {
    ElMessage.error("無效的案件 ID");
    isLoading.value = false;
    return;
  }
  try {
    const res = await getProjectById(projectId);
    project.value = res.data;
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入案件詳情失敗");
  }
  isLoading.value = false;
});

// 返回上一頁
const goBack = () => {
  router.back();
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "未指定";
  return dayjs(dateString).format("YYYY-MM-DD HH:mm");
};

// 狀態標籤顏色
const statusTagType = (status) => {
  switch (status) {
    case "招募中":
      return "success";
    case "已關閉":
      return "info";
    case "已成案":
      return "warning";
    default:
      return "";
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
.skill-tag {
  margin: 2px 4px 2px 0;
}
.description-content {
  white-space: pre-wrap; /* 保留換行 */
}
.action-buttons {
  margin-top: 20px;
  text-align: right;
}
</style>
