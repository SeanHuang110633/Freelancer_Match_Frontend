<!-- ProposalManagementView -->
<template>
  <div class="proposal-management-view">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3">管理提案</span>
      </template>
    </el-page-header>

    <div v-if="isLoading">
      <el-skeleton :rows="1" animated class="page-header-skeleton" />
      <el-row :gutter="30">
        <el-col :xs="24" :md="10" :lg="8">
          <el-skeleton :rows="6" animated />
        </el-col>
        <el-col :xs="24" :md="14" :lg="16">
          <el-skeleton :rows="8" animated />
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="30" class="content-wrapper" v-if="!isLoading && project">
      <el-col :xs="24" :md="10" :lg="8" class="project-details-col">
        <el-card class="project-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>案件資訊</span>
              <el-tag :type="statusTagType(project.status)" size="small">
                {{ project.status }}
              </el-tag>
            </div>
          </template>

          <h2 class="project-title">{{ project.title }}</h2>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="預算">
              {{ project.budget_min }} ~ {{ project.budget_max }}
            </el-descriptions-item>
            <el-descriptions-item label="類型">
              {{ project.location || "N/A" }} / {{ project.work_type }}
            </el-descriptions-item>
            <el-descriptions-item label="提案截止">
              {{ formatTime(project.proposals_deadline) }}
            </el-descriptions-item>
            <el-descriptions-item label="需求人數">
              {{ project.required_people }} 人
            </el-descriptions-item>
          </el-descriptions>

          <h3 class="detail-subtitle">案件描述</h3>
          <p class="project-description-full">{{ project.description }}</p>

          <h3 class="detail-subtitle">所需技能</h3>
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

      <el-col :xs="24" :md="14" :lg="16" class="proposals-list-col">
        <h2 class="proposals-title">收到的提案 ({{ proposals.length }})</h2>

        <el-empty
          description="目前尚無任何人提案"
          v-if="!isLoading && proposals.length === 0"
        />

        <div class="proposal-list-container" v-if="proposals.length > 0">
          <el-card
            class="proposal-card"
            shadow="hover"
            v-for="proposal in proposals"
            :key="proposal.proposal_id"
          >
            <div class="proposal-header">
              <el-avatar
                :src="proposal.freelancer.freelancer_profile?.avatar_url"
                class="freelancer-avatar"
              >
                {{
                  // 顯示名字首字母作為預設頭像
                  proposal.freelancer.freelancer_profile?.full_name?.charAt(0)
                }}
              </el-avatar>
              <div class="freelancer-info">
                <span class="freelancer-name">{{
                  proposal.freelancer.freelancer_profile?.full_name || "N/A"
                }}</span>
              </div>
              <el-tag
                size="small"
                :type="proposalStatusTagType(proposal.status)"
                class="proposal-status"
                >{{ proposal.status }}</el-tag
              >
            </div>

            <div class="proposal-body">
              <p class="proposal-description">
                {{ proposal.brief_description || "(未填寫說明)" }}
              </p>
            </div>

            <div class="proposal-footer">
              <el-link
                type="primary"
                :href="proposal.attachment_url"
                target="_blank"
                :disabled="!proposal.attachment_url"
                :underline="false"
              >
                <el-icon><Download /></el-icon>
                下載提案檔案
              </el-link>

              <div class="action-buttons" v-if="proposal.status === '已提交'">
                <el-button
                  type="danger"
                  @click="handleUpdateStatus(proposal, '已拒絕')"
                  plain
                  :loading="proposal.isLoading"
                >
                  拒絕
                </el-button>
                <el-button
                  type="success"
                  @click="handleUpdateStatus(proposal, '已接受')"
                  plain
                  :loading="proposal.isLoading"
                >
                  接受提案
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Download } from "@element-plus/icons-vue";
import dayjs from "dayjs";

// (修改) 根據優化的後端，我們不再需要 getProjectById
import {
  getProposalsForProject, // (此函式 呼叫 GET /projects/{id}/proposals)
  updateProposalStatus, // (此函式 呼叫 PATCH /proposals/{id}/status)
} from "@/api/proposal.js";

// --- (M7) Step 1 建立的 API ---
import { createContract } from "@/api/contract.js";
// --- (M7 結束) ---

// 接收路由傳來的 projectId
const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const isLoading = ref(true);
const project = ref(null); // 存放案件詳情
const proposals = ref([]); // 存放提案列表

// (修改) onMounted 中執行「單一 API 呼叫」
onMounted(async () => {
  isLoading.value = true;
  try {
    // 1. (關鍵) 僅呼叫一次 API
    // (後端 已優化，`getProposalsForProject` 會回傳 ProjectWithProposalsOut)
    const res = await getProposalsForProject(props.projectId); // 2. 設置資料

    project.value = res.data; // res.data 是 project 物件 // 3. (為 loading 狀態) 替每個 proposal 物件添加 isLoading 屬性

    proposals.value = res.data.proposals.map((p) => ({
      ...p,
      isLoading: false,
    }));
    console.log("Loaded proposals:", proposals.value);
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入提案資料失敗");
    router.push("/my-jobs"); // 失敗則退回
  }
  isLoading.value = false;
});

// --- 格式化函式 ---
// (goBack, formatTime, statusTagType, proposalStatusTagType ... 保持不變)
const goBack = () => router.back();

const formatTime = (time) => {
  return time ? dayjs(time).format("YYYY-MM-DD") : "N/A";
};

// 案件狀態
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

// 提案狀態
const proposalStatusTagType = (status) => {
  switch (status) {
    case "已提交":
      return "";
    case "已接受":
      return "success";
    case "已拒絕":
      return "danger";
    default:
      return "info";
  }
};

// --- 核心邏輯 (M6/M7) ---

const handleUpdateStatus = async (proposal, newStatus) => {
  const actionText = newStatus === "已接受" ? "接受" : "拒絕";

  try {
    console.log(
      `Attempting to ${actionText} proposal ID:`,
      proposal.proposal_id
    );
    // 彈出確認視窗
    await ElMessageBox.confirm(
      `您確定要「${actionText}」 ${proposal.freelancer.freelancer_profile?.full_name} 的提案嗎？`,
      "確認操作",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    ); // 執行操作

    proposal.isLoading = true;

    // (M6) 呼叫 M6 API 更新提案狀態
    const res = await updateProposalStatus(proposal.proposal_id, newStatus);

    // --- (M7) 接入點修改 ---
    if (newStatus === "已接受") {
      // (M7.1) 提案接受成功，立即嘗試建立合約
      ElMessage.success("提案已接受！正在產生合約草案...");

      try {
        // (M7.1) 呼叫 Step 1 建立的 API
        const contractRes = await createContract(proposal.proposal_id);

        // (M7.1) 導向到 Step 2 建立的路由
        router.push(`/contracts/${contractRes.data.contract_id}`);
      } catch (contractErr) {
        // M6 成功，但 M7 失敗 (例如合約已存在)
        console.error("建立合約失敗:", contractErr);
        ElMessage.error(contractErr.response?.data?.detail || "建立合約失敗");
      }
    } else {
      // (M6) 拒絕提案
      ElMessage.success("提案已拒絕");
    } // 更新前端列表中的狀態
    // --- (M7 修改結束) ---

    proposal.status = res.data.status;
  } catch (err) {
    // 捕捉 ElMessageBox 的 'cancel'
    if (err === "cancel") {
      ElMessage.info("操作已取消");
      return;
    }
    // (M6) 捕捉 M6 (updateProposalStatus) 的錯誤
    ElMessage.error(err.response?.data?.detail || `更新提案狀態失敗`);
  } finally {
    proposal.isLoading = false;
  }
};
</script>

<style lang="scss" scoped>
/* 複製我們上次討論的 CSS 樣式 */
.proposal-management-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}

.page-header-skeleton {
  height: 40px;
  margin-bottom: 20px;
}

/* 左側：案件詳情 */
.project-details-col {
  .project-card {
    border: 1px solid var(--el-border-color-light);
    height: 100%; // 確保卡片等高（如果需要）
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .project-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 20px;
  }
  .detail-subtitle {
    font-size: 0.9rem;
    color: #909399;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
  }
  .project-description-full {
    font-size: 14px;
    line-height: 1.6;
    color: #303133;
    white-space: pre-wrap; // 保留換行
  }
  .project-skills {
    .skill-tag {
      margin: 4px;
    }
  }
}

/* 右側：提案列表 */
.proposals-list-col {
  .proposals-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--el-color-primary-light-8);
  }

  .proposal-card {
    margin-bottom: 20px;

    .proposal-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      .freelancer-avatar {
        margin-right: 12px;
        background-color: var(--el-color-primary-light-7);
        color: var(--el-color-primary);
        font-weight: bold;
      }
      .freelancer-info {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .freelancer-name {
        font-weight: bold;
        font-size: 1.1rem;
        color: #303133;
      }
      .freelancer-email {
        font-size: 0.9rem;
        color: #909399;
      }
      .proposal-status {
        margin-left: auto;
      }
    }

    .proposal-body {
      .proposal-description {
        font-size: 14px;
        color: #303133;
        line-height: 1.6;
        min-height: 50px;
        background-color: #fcfcfc;
        border: 1px solid #f0f0f0;
        padding: 10px;
        border-radius: 4px;
      }
    }

    .proposal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px dashed var(--el-border-color-lighter);

      .el-link {
        font-size: 13px;
        .el-icon {
          margin-right: 4px;
        }
      }

      .action-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }
}
</style>
