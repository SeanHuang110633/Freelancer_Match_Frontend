<template>
  <div class="job-list-view">
    <el-card shadow="never" class="filter-card">
      <template #header>
        <h2>搜尋案件</h2>
      </template>
      <el-form :model="filters" :inline="true" class="filter-form">
        <el-form-item label="地區">
          <el-input
            v-model="filters.location"
            placeholder="e.g., 台北"
            clearable
          />
        </el-form-item>

        <el-form-item label="工作型態">
          <el-select
            v-model="filters.work_type"
            placeholder="全部"
            clearable
            style="width: 100px"
          >
            <el-option label="全部" value="" />
            <el-option label="遠端" value="遠端" />
            <el-option label="實體" value="實體" />
            <el-option label="混合" value="混合" />
          </el-select>
        </el-form-item>

        <el-form-item label="技能">
          <el-select
            v-model="filters.tag_id"
            multiple
            filterable
            placeholder="選擇技能 (可多選)"
            style="width: 360px"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.tag_id"
              :label="tag.name"
              :value="tag.tag_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="isLoading">
            <el-icon><Search /></el-icon> Search
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="results-area">
      <h3>案件列表 ({{ projects.length }} 筆)</h3>

      <el-skeleton :rows="5" animated v-if="isLoading" />
      <el-empty
        description="找不到符合條件的案件"
        v-if="!isLoading && projects.length === 0"
      />

      <el-row :gutter="20" v-if="!isLoading && projects.length > 0">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          v-for="project in projects"
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
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router"; // (新增)
import { ElMessage } from "element-plus";
import { getAllTags } from "@/api/tags.js";
import { getProjects } from "@/api/project.js";
import { Search, Money, Location, Briefcase } from "@element-plus/icons-vue";

const allTags = ref([]);
const projects = ref([]);
const isLoading = ref(false);
const router = useRouter(); // (新增)

const filters = reactive({
  tag_id: [],
  location: "",
  work_type: "",
});

onMounted(async () => {
  // ... (保持不變) ...
  isLoading.value = true;
  try {
    const tagsRes = await getAllTags();
    allTags.value = tagsRes.data;
  } catch (err) {
    ElMessage.error("無法載入技能標籤");
  }
  await handleSearch();
  isLoading.value = false;
});

const handleSearch = async () => {
  // ... (保持不變) ...
  isLoading.value = true;
  try {
    const res = await getProjects(filters);
    projects.value = res.data;
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "搜尋案件失敗");
  }
  isLoading.value = false;
};

// (新增) 跳轉到詳情頁
const goToProjectDetail = (projectId) => {
  router.push(`/projects/${projectId}`);
};
</script>

<style lang="scss" scoped>
.job-list-view {
  // --- 1. Define New Palette (From HomeView) ---
  --app-bg-color: rgba(250, 247, 239, 0.973); // Soft beige
  --app-text-color: #616130;
  --app-text-color-secondary: #8a8a69;
  --app-hover-border-color: #dcd8c8;
  --app-hover-bg-color: rgba(252, 250, 248, 1); // More opaque
  --app-accent-color: #817c5b; // Muted olive-brown
  --app-warning-color: #c6a870; // Muted gold
  --app-danger-color: #b56f6f; // Brownish-red
  --app-info-bg-color: rgba(220, 216, 200, 0.3); // Muted beige bg for tags

  // --- 2. Override Element Plus Vars (From HomeView) ---
  --el-text-color-primary: var(--app-text-color);
  --el-text-color-regular: var(--app-text-color);
  --el-text-color-secondary: var(--app-text-color-secondary);
  --el-text-color-placeholder: #a2a287;

  --el-bg-color: var(--app-bg-color);
  --el-bg-color-overlay: var(--app-hover-bg-color);
  --el-fill-color-light: var(--app-hover-bg-color);
  --el-fill-color-blank: transparent; // Make backgrounds transparent

  --el-card-bg-color: var(--app-bg-color);
  --el-card-border-color: transparent;

  --el-border-color: var(--app-hover-border-color);
  --el-border-color-lighter: rgba(220, 216, 200, 0.5);
  --el-border-color-light: var(--app-hover-border-color);

  // (!! 📍 Button 顏色將來自這裡 !!)
  --el-color-primary: var(--app-accent-color);
  --el-color-primary-light-9: var(--app-info-bg-color);

  --el-color-warning: var(--app-warning-color);
  --el-color-warning-light-9: var(--app-info-bg-color);

  --el-color-info: var(--app-text-color-secondary);
  --el-color-info-light-9: var(--app-info-bg-color);

  --el-color-danger: var(--app-danger-color);
  --el-color-danger-light-9: rgba(181, 111, 111, 0.1);

  // --- 3. Apply Base Styles (From HomeView) ---
  padding: 20px;
  color: var(--app-text-color);

  // (!! 📍 額外調整 📍 !!)
  // 確保最小高度以顯示背景色
  min-height: calc(100vh - 60px);
}

.filter-card {
  margin-bottom: 20px;
  .filter-form {
    display: flex;
    flex-wrap: wrap; /* 允許換行 */
    gap: 15px; /* 增加間距 */
  }
}

.results-area {
  margin-top: 20px;
  h3 {
    margin-bottom: 20px;
  }
}

.project-col {
  margin-bottom: 20px;
}

.project-card {
  cursor: pointer; /* 表示可點擊 */
  height: 100%; /* 讓卡片等高 */
  display: flex;
  flex-direction: column;

  /* (新增) 預設邊框與過渡效果 */
  border: 1px solid var(--el-card-border-color); /* 使用 Element 變數 */
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* 加入陰影過渡 */

  /* (新增) Hover 效果 */
  &:hover {
    border-color: var(--el-color-primary); /* 變為主題藍色 */
    border-width: 2px;
    /* 可以選擇性地加強陰影 */
    box-shadow: var(--el-box-shadow-light);
  }

  :deep(.el-card__header) {
    padding: 10px 15px;
    font-weight: bold;
  }
  :deep(.el-card__body) {
    padding: 15px;
    flex-grow: 1; /* 讓 body 區域填滿剩餘空間 */
  }

  .card-header {
    /* (樣式可移除或調整) */
  }
  .project-meta {
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
    color: #303133;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 10px;
    /* 限制顯示兩行 */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .project-skills {
    font-size: 12px;
    .skill-tag {
      margin: 2px 4px 2px 0;
    }
  }
}
</style>
