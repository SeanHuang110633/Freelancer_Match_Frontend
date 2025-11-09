<!-- MyJobListView -->
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
            <el-button
              v-if="project.status !== '已成案'"
              text
              type="primary"
              size="small"
              @click.stop="goToProposalManagement(project.project_id)"
            >
              管理提案
            </el-button>

            <el-button
              v-else-if="project.status === '已成案'"
              text
              type="success"
              size="small"
              :loading="project.isContractLoading"
              @click.stop="goToContractManagement(project)"
            >
              管理合約
            </el-button>
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
// (M7.2) 匯入 M7 API
import { getMyContracts } from "@/api/contract.js";
import { Money, Location } from "@element-plus/icons-vue";

const router = useRouter();
const isLoading = ref(true);
const myProjects = ref([]);
// (M7.2) 暫存合約列表，避免重複點擊時重複呼叫 API
const myContracts = ref(null);

onMounted(async () => {
  try {
    const res = await getMyProjects();
    // (修改) 為每個 project 物件添加一個本地 loading 狀態
    myProjects.value = res.data.map((p) => ({
      ...p,
      isContractLoading: false,
    }));
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入我的案件列表失敗");
  }
  isLoading.value = false;
});

const goBack = () => router.back();
const goToPostJob = () => router.push("/post-job");
// 卡片點擊，跳轉到「公開」的案件詳情頁
const goToProjectDetail = (projectId) => router.push(`/projects/${projectId}`);

// M6: 按鈕點擊，跳轉到「提案管理」頁
const goToProposalManagement = (projectId) => {
  router.push(`/projects/${projectId}/proposals`);
};

// (M7) 新增: 按鈕點擊，跳轉到「合約管理」頁
const goToContractManagement = async (project) => {
  project.isContractLoading = true;
  try {
    // 檢查是否已載入合約
    if (myContracts.value === null) {
      const res = await getMyContracts();
      myContracts.value = res.data;
    }

    // (M7) 從合約列表中，查找與此 project.project_id 匹配的合約
    const targetContract = myContracts.value.find(
      (c) => c.project.project_id === project.project_id
    );

    if (targetContract) {
      // (M7) 找到合約，跳轉到 ContractDetail 頁
      router.push(`/contracts/${targetContract.contract_id}`);
    } else {
      ElMessage.error("找不到此案件對應的合約資料");
      // (備註: 理論上 "已成案" 狀態必定有關聯合約)
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "查找合約失敗");
  } finally {
    project.isContractLoading = false;
  }
};

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
/* ... (所有 style 樣式保持不變) ... */
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
    flex-direction: column;
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
    display: -webkit-box;
    -webkit-line-clamp: 2; /* 為了舊的 WebKit 瀏覽器 */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;

    /* FIX: 加上 W3C 標準屬性，Linter 警告就會消失 */
    line-clamp: 2;
  }
  .project-skills {
    font-size: 12px;
    margin-bottom: 10px;
    .skill-tag {
      margin: 2px 4px 2px 0;
    }
  }
  .card-actions {
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-lighter);
    text-align: right;
  }
}
</style>
