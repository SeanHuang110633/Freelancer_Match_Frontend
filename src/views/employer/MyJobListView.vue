<template>
  <div class="my-job-list-view">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3"> My Posted Jobs </span>
      </template>
    </el-page-header>

    <div v-if="isLoading">
      <el-skeleton :rows="5" animated />
    </div>

    <el-empty
      description="You haven't posted any jobs yet"
      v-if="!isLoading && myProjects.length === 0"
    >
      <el-button type="primary" @click="goToPostJob">Post a Job Now</el-button>
    </el-empty>

    <el-row :gutter="20" v-if="!isLoading && myProjects.length > 0">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="(project, index) in myProjects"
        :key="project.project_id"
        class="project-col"
      >
        <router-link
          :to="`/projects/${project.project_id}`"
          class="project-link"
        >
          <el-card class="project-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">{{ project.title }}</span>
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
                {{ project.location || "N/A" }} / {{ project.work_type }}
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
                v-if="project.status === '招募中'"
                text
                type="danger"
                size="small"
                :loading="project.isClosing"
                @click.stop.prevent="handleCloseProject(project, index)"
              >
                <el-icon><Close /></el-icon>
                Close Job
              </el-button>

              <el-button
                v-if="project.status === '招募中'"
                text
                type="warning"
                size="small"
                @click.stop.prevent="goToProposalManagement(project.project_id)"
              >
                Manage Proposals
              </el-button>

              <el-button
                v-else-if="project.status === '已成案'"
                text
                type="success"
                size="small"
                :loading="project.isContractLoading"
                @click.stop.prevent="goToContractManagement(project)"
              >
                Manage Contract
              </el-button>
            </div>
          </el-card>
        </router-link>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { getMyProjects, updateProjectStatus } from "@/api/project.js";
import { getMyContracts } from "@/api/contract.js";
import { Money, Location, Close } from "@element-plus/icons-vue";

const router = useRouter();
const isLoading = ref(true);
const myProjects = ref([]);
const myContracts = ref(null);

onMounted(async () => {
  try {
    const res = await getMyProjects();
    myProjects.value = res.data.map((p) => ({
      ...p,
      isContractLoading: false,
      isClosing: false,
    }));
  } catch (err) {
    // (修改) i18n
    ElMessage.error(err.response?.data?.detail || "Failed to load my jobs");
  }
  isLoading.value = false;
});

const goBack = () => router.back();
const goToPostJob = () => router.push("/post-job");

const goToProposalManagement = (projectId) => {
  router.push(`/projects/${projectId}/proposals`);
};

const handleCloseProject = async (project, index) => {
  try {
    // (修改) i18n
    await ElMessageBox.confirm(
      `Are you sure you want to close the job "${project.title}"? 
       All freelancers who submitted proposals will be notified.`,
      "Confirm Close",
      {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    project.isClosing = true;
    const res = await updateProjectStatus(project.project_id, "已關閉");

    myProjects.value[index] = {
      ...res.data,
      isContractLoading: false,
      isClosing: false,
    };

    // (修改) i18n
    ElMessage.success("Job has been closed");
  } catch (err) {
    if (err !== "cancel") {
      // (修改) i18n
      ElMessage.error(err.response?.data?.detail || "Failed to close job");
    }
  } finally {
    if (project) {
      project.isClosing = false;
    }
  }
};

const goToContractManagement = async (project) => {
  project.isContractLoading = true;
  try {
    if (myContracts.value === null) {
      const res = await getMyContracts();
      myContracts.value = res.data;
    }
    const targetContract = myContracts.value.find(
      (c) => c.project.project_id === project.project_id
    );
    if (targetContract) {
      router.push(`/contracts/${targetContract.contract_id}`);
    } else {
      // (修改) i18n
      ElMessage.error("Could not find the contract for this job");
    }
  } catch (err) {
    // (修改) i18n
    ElMessage.error(err.response?.data?.detail || "Failed to find contract");
  } finally {
    project.isContractLoading = false;
  }
};

const statusTagType = (status) => {
  switch (status) {
    case "招募中":
      return "success";
    case "已關閉":
      return "info";
    case "已成案":
      return "warning";
    default:
      return "primary"; // (修改) 預設使用主色
  }
};
</script>

<style lang="scss" scoped>
/* (新增) 需求二：全域背景色 */
.my-job-list-view {
  padding: 20px;
  background-color: rgba(252, 250, 248, 0.8);
  min-height: calc(100vh - 60px); // 假設 Navbar 高 60px
}

/* (新增) 需求二：顏色主題注入 */
:deep() {
  /* 1. 定義主色調 (來自 ProfileView) */
  --el-color-primary: #a79c7f;
  --el-color-primary-dark-2: #7d7561; /* Hover */
  --el-color-primary-light-3: #c3bba9;
  --el-color-primary-light-5: #d4cec0;
  --el-color-primary-light-7: #e5e2d8;
  --el-color-primary-light-8: #eceae3;
  --el-color-primary-light-9: #f6f5f1; /* Lightest Hover BG */

  /* 2. 定義功能色 (柔和色系) */
  --el-color-success: #678d58; /* 柔和的綠色 */
  --el-color-warning: #c87c43; /* 柔和的橘色 */
  --el-color-danger: #b85c5c; /* 柔和的紅色 */
  --el-color-info: #8c8880; /* 柔和的灰色 */

  /* 3. 定義文字顏色 */
  --el-text-color-primary: #616130; /* 標題/主要內文 */
  --el-text-color-regular: #616130; /* 一般內文 */
  --el-text-color-secondary: #7d7561; /* 次要文字/Icon */
  --el-text-color-placeholder: #a79c7f;

  /* 4. 定義背景/邊框 */
  --el-bg-color-page: rgba(252, 250, 248, 0.8); /* 頁面背景 */
  --el-bg-color: #ffffff; /* 卡片背景 */
  --el-bg-color-overlay: #ffffff; /* 下拉選單背景 */
  --el-border-color: #e5e2d8; /* 邊框 (light-7) */
  --el-border-color-lighter: #eceae3; /* 邊框 (light-8) */
  --el-fill-color-lighter: #f6f5f1; /* 技能標籤背景 (light-9) */
}

/* (新增) router-link 樣式重置 */
.project-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

/* (修改) 頁首樣式 */
.page-header {
  margin-bottom: 20px;
  background-color: transparent; /* (修改) 移除白色背景 */
  padding: 10px 0; /* (修改) 調整 padding */
  border-radius: 4px;

  /* (修改) 頁首文字顏色 */
  :deep(.el-page-header__content) {
    color: var(--el-text-color-primary);
  }
}

.project-col {
  margin-bottom: 20px;
}

.project-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  /* (修改) 使用 CSS 變數 */
  border: 1px solid var(--el-border-color);
  background-color: rgba(244, 241, 235, 0.9);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  .project-link:hover & {
    border-width: 2.5px;
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
    background-color: rgba(244, 241, 235, 0.45);
  }

  :deep(.el-card__header) {
    padding: 10px 15px;
    /* (修改) 確保標題顏色正確 */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      color: var(--el-text-color-primary);
    }
  }
  :deep(.el-card__body) {
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .project-meta {
    /* (修改) 使用 CSS 變數 */
    color: var(--el-text-color-secondary);
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
    /* (修改) 使用 CSS 變數 */
    color: var(--el-text-color-regular);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
    line-clamp: 2;
  }
  .project-skills {
    font-size: 12px;
    margin-bottom: 10px;
    .skill-tag {
      margin: 2px 4px 2px 0;
      /* (修改) 讓技能標籤也使用新色系 */
      background-color: var(--el-fill-color-lighter);
      border-color: var(--el-border-color-lighter);
      color: var(--el-text-color-secondary);
    }
  }
  .card-actions {
    margin-top: auto;
    padding-top: 10px;
    /* (修改) 使用 CSS 變數 */
    border-top: 1px solid var(--el-border-color-lighter);
    text-align: right;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
