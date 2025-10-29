<template>
  <div class="my-job-list-view">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3"> 我刊登的案件 </span>
      </template>
    </el-page-header>

    <div v-if="isLoading">
      <el-skeleton :rows="5" animated />
    </div>

    <el-empty
      description="您尚未刊登任何案件"
      v-if="!isLoading && myProjects.length === 0"
    >
      <el-button type="primary" @click="goToPostJob">立即刊登</el-button>
    </el-empty>

    <el-row :gutter="20" v-if="!isLoading && myProjects.length > 0">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="project in myProjects"
        :key="project.project_id"
        class="project-col"
      >
        <el-card
          class="project-card"
          shadow="hover"
          @click="goToProjectDetail(project.project_id)"
        >
          <template #header>
            <div class="card-header">
              <span>{{ project.title }}</span>
              <el-tag :type="statusTagType(project.status)" size="small">
                {{ project.status }}
              </el-tag>
            </div>
          </template>

          <el-row :gutter="10" class="project-meta">
            <el-col :span="12">
              <el-icon><Money /></el-icon>
              {{ project.budget_min || "N/A" }} ~
              {{ project.budget_max || "N/A" }}
            </el-col>
            <el-col :span="12">
              <el-icon><Location /></el-icon>
              {{ project.location || "未指定" }} / {{ project.work_type }}
            </el-col>
          </el-row>

          <p class="project-description">
            {{ project.description.substring(0, 80)
            }}{{ project.description.length > 80 ? "..." : "" }}
          </p>

          <div class="project-skills">
            <el-tag
              v-for="skill in project.skills"
              :key="skill.tag.tag_id"
              type="info"
              size="small"
              class="skill-tag"
            >
              {{ skill.tag.name }}
            </el-tag>
          </div>
          <div class="card-actions">
            <el-button text type="primary" size="small"
              >管理提案 (TODO)</el-button
            >
            <el-button text type="primary" size="small"
              >編輯案件 (TODO)</el-button
            >
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getMyProjects } from "@/api/project.js";
import { Money, Location } from "@element-plus/icons-vue";

const router = useRouter();
const isLoading = ref(true);
const myProjects = ref([]);

onMounted(async () => {
  try {
    const res = await getMyProjects();
    myProjects.value = res.data;
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入我的案件列表失敗");
  }
  isLoading.value = false;
});

const goBack = () => router.back();
const goToPostJob = () => router.push("/post-job");
const goToProjectDetail = (projectId) => router.push(`/projects/${projectId}`);

// 複用 JobListView 的狀態標籤顏色邏輯
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
.my-job-list-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}

.project-col {
  margin-bottom: 20px;
}

/* 複用 JobListView 的卡片樣式 */
.project-card {
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-card-border-color);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
  }

  :deep(.el-card__header) {
    padding: 10px 15px;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
    }
  }
  :deep(.el-card__body) {
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column; /* 讓 actions 能推到底部 */
  }

  .project-meta {
    /* ... (同 JobListView) ... */
    color: #606266;
    font-size: 13px;
    margin-bottom: 8px;
    .el-col {
      display: flex;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      .el-icon {
        margin-right: 4px;
      }
    }
  }
  .project-description {
    /* ... (同 JobListView) ... */
    color: #303133;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1; /* 佔據中間剩餘空間 */
  }
  .project-skills {
    /* ... (同 JobListView) ... */
    font-size: 12px;
    margin-bottom: 10px; /* 增加底部間距 */
    .skill-tag {
      margin: 2px 4px 2px 0;
    }
  }
  .card-actions {
    margin-top: auto; /* 將按鈕推到底部 */
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-lighter);
    text-align: right;
  }
}
</style>
