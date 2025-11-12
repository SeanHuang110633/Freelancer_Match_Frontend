<template>
  <div class="contract-view">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3">合約詳情</span>
      </template>
    </el-page-header>

    <el-card class="steps-card" shadow="never" v-if="!isLoading && contract">
      <el-steps
        :active="activeStep"
        :process-status="stepStatus"
        finish-status="success"
        align-center
      >
        <el-step title="協商中" />
        <el-step title="進行中" />
        <el-step title="驗收中" />
        <el-step title="已完成" />
      </el-steps>
      <div v-if="stepStatus === 'warning'" class="step-warning">
        <el-icon><WarningFilled /></el-icon>
        <span>
          狀態更新：目前為 <strong>{{ contract.status }}</strong
          >，等待{{ isEmployer ? "工作者" : "雇主" }}回應。
        </span>
      </div>
      <div v-if="stepStatus === 'error'" class="step-error">
        <el-icon><CircleCloseFilled /></el-icon>
        <span>合約已終止。</span>
      </div>
    </el-card>

    <div v-if="isLoading">
      <el-skeleton :rows="3" animated class="page-header-skeleton" />
      <el-row :gutter="30">
        <el-col :xs="24" :md="10" :lg="8">
          <el-skeleton :rows="6" animated />
        </el-col>
        <el-col :xs="24" :md="14" :lg="16">
          <el-skeleton :rows="10" animated />
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="30" class="content-wrapper" v-if="!isLoading && contract">
      <el-col :xs="24" :md="10" :lg="8" class="contract-details-col">
        <el-card class="contract-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>合約狀態</span>
              <el-tag :type="statusTagType(contract.status)" size="small">
                {{ contract.status }} (v{{ contract.version }})
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="1" border direction="vertical">
            <el-descriptions-item label="甲方 (雇主)">
              {{ contract.employer.email }}
            </el-descriptions-item>
            <el-descriptions-item label="乙方 (工作者)">
              {{ contract.freelancer.freelancer_profile?.full_name || "N/A" }}
              ({{ contract.freelancer.user_id }})
            </el-descriptions-item>
          </el-descriptions>

          <el-button
            type="primary"
            @click="handleGoToChat"
            :loading="isChatLoading"
            class="chat-button"
            :disabled="isSubmitting"
          >
            <el-icon class="el-icon--left"><ChatDotRound /></el-icon>
            前往聊天室
          </el-button>
          <h3 class="detail-subtitle">合約條款</h3>
          <div v-if="isEmployer && contract.status === '協商中'">
            <el-form :model="editableData" label-position="top">
              <el-form-item label="合約金額 (TWD)">
                <el-input-number
                  v-model="editableData.amount"
                  :min="0"
                  controls-position="right"
                />
              </el-form-item>
              <el-form-item label="履約期限 (End Date)">
                <el-date-picker
                  v-model="editableData.end_date"
                  type="datetime"
                  placeholder="選擇截止日期"
                />
              </el-form-item>
            </el-form>
          </div>
          <el-descriptions :column="1" border v-else>
            <el-descriptions-item label="合約金額">
              TWD {{ contract.amount.toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="履約期限">
              {{ formatTime(contract.end_date) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="14" :lg="16" class="contract-content-col">
        <el-card class="contract-card" shadow="never">
          <template #header>
            <span>合約內容</span>
          </template>

          <div v-if="isEmployer && contract.status === '協商中'">
            <el-input
              v-model="editableData.title"
              class="editable-title"
              placeholder="合約標題"
            />

            <el-radio-group
              v-model="editModeView"
              size="small"
              style="margin-bottom: 10px"
            >
              <el-radio-button label="edit">
                <el-icon style="margin-right: 5px"><Edit /></el-icon> 編輯
              </el-radio-button>
              <el-radio-button label="preview">
                <el-icon style="margin-right: 5px"><View /></el-icon> 預覽
              </el-radio-button>
            </el-radio-group>

            <el-input
              v-if="editModeView === 'edit'"
              v-model="editableData.content"
              :rows="20"
              type="textarea"
              placeholder="請填寫合約內容 (支援 Markdown)..."
              class="editable-content"
            />
            <div
              v-else
              class="contract-content-preview markdown-body"
              v-html="renderedEditPreview"
            ></div>
          </div>

          <div v-else>
            <h2 class="contract-title">{{ contract.title }}</h2>
            <div
              class="contract-content-readonly markdown-body"
              v-html="renderedReadOnlyContent"
            ></div>
          </div>
          <div class="action-bar">
            <div v-if="contract.status === '協商中'">
              <div v-if="isEmployer">
                <el-button
                  type="danger"
                  @click="handleDelete"
                  :loading="isSubmitting"
                  plain
                >
                  撤銷合約
                </el-button>
                <el-button
                  type="primary"
                  @click="handleSaveDetails"
                  :loading="isSubmitting"
                >
                  儲存修改 (v{{ contract.version }})
                </el-button>
              </div>
              <el-button
                v-if="isFreelancer"
                type="success"
                @click="handleUpdateStatus('進行中')"
                :loading="isSubmitting"
              >
                同意並開始
              </el-button>
            </div>
            <div v-if="contract.status === '進行中'">
              <div v-if="isEmployer">
                <el-button
                  @click="handleUpdateStatus('雇主請求修改')"
                  :loading="isSubmitting"
                  >請求修改</el-button
                >
                <el-button
                  type="danger"
                  @click="handleUpdateStatus('雇主請求終止')"
                  :loading="isSubmitting"
                  plain
                  >請求終止</el-button
                >
                <el-button
                  type="success"
                  @click="handleUpdateStatus('已完成')"
                  :loading="isSubmitting"
                  >標記為完成</el-button
                >
              </div>
              <div v-if="isFreelancer">
                <el-button
                  @click="handleUpdateStatus('工作者請求修改')"
                  :loading="isSubmitting"
                  >請求修改</el-button
                >
                <el-button
                  type="danger"
                  @click="handleUpdateStatus('工作者請求終止')"
                  :loading="isSubmitting"
                  plain
                  >請求終止</el-button
                >
                <el-button
                  type="primary"
                  @click="handleUpdateStatus('工作者要求驗收')"
                  :loading="isSubmitting"
                  >請求驗收</el-button
                >
              </div>
            </div>
            <div v-if="contract.status === '雇主請求修改'">
              <el-tag type="warning" v-if="isEmployer"
                >等待工作者回應...</el-tag
              >
              <div v-if="isFreelancer">
                <el-button
                  @click="handleUpdateStatus('進行中')"
                  :loading="isSubmitting"
                  plain
                  >拒絕修改</el-button
                >
                <el-button
                  type="primary"
                  @click="handleUpdateStatus('協商中')"
                  :loading="isSubmitting"
                  >同意修改 (回協商)</el-button
                >
              </div>
            </div>
            <div v-if="contract.status === '工作者請求修改'">
              <el-tag type="warning" v-if="isFreelancer"
                >等待雇主回應...</el-tag
              >
              <div v-if="isEmployer">
                <el-button
                  @click="handleUpdateStatus('進行中')"
                  :loading="isSubmitting"
                  plain
                  >拒絕修改</el-button
                >
                <el-button
                  type="primary"
                  @click="handleUpdateStatus('協商中')"
                  :loading="isSubmitting"
                  >同意修改 (回協商)</el-button
                >
              </div>
            </div>
            <div v-if="contract.status === '雇主請求終止'">
              <el-tag type="danger" v-if="isEmployer">等待工作者回應...</el-tag>
              <div v-if="isFreelancer">
                <el-button
                  @click="handleUpdateStatus('進行中')"
                  :loading="isSubmitting"
                  plain
                  >拒絕終止</el-button
                >
                <el-button
                  type="danger"
                  @click="handleUpdateStatus('終止')"
                  :loading="isSubmitting"
                  >同意終止</el-button
                >
              </div>
            </div>
            <div v-if="contract.status === '工作者請求終止'">
              <el-tag type="danger" v-if="isFreelancer">等待雇主回應...</el-tag>
              <div v-if="isEmployer">
                <el-button
                  @click="handleUpdateStatus('進行中')"
                  :loading="isSubmitting"
                  plain
                  >拒絕終止</el-button
                >
                <el-button
                  type="danger"
                  @click="handleUpdateStatus('終止')"
                  :loading="isSubmitting"
                  >同意終止</el-button
                >
              </div>
            </div>
            <div v-if="contract.status === '工作者要求驗收'">
              <el-tag type="warning" v-if="isFreelancer"
                >等待雇主驗收...</el-tag
              >
              <div v-if="isEmployer">
                <el-button
                  type="warning"
                  @click="handleUpdateStatus('進行中')"
                  :loading="isSubmitting"
                  plain
                  >退回修正</el-button
                >
                <el-button
                  type="success"
                  @click="handleUpdateStatus('已完成')"
                  :loading="isSubmitting"
                  >驗收通過</el-button
                >
              </div>
            </div>
            <div v-if="contract.status === '已完成'">
              <el-tag type="success" size="large">合約已完成</el-tag>
            </div>
            <div v-if="contract.status === '終止'">
              <el-tag type="info" size="large">合約已終止</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
// (修改) 匯入 需求一 Icon
import {
  ChatDotRound,
  Edit,
  View,
  WarningFilled,
  CircleCloseFilled,
} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { marked } from "marked";

import {
  getContractById,
  updateContractDetails,
  updateContractStatus,
  deleteContract,
} from "@/api/contract.js";
import { createChatRoom } from "@/api/message.js";
import { useAuthStore } from "@/store/authStore.js";
import { useChatStore } from "@/store/chatStore.js";

const props = defineProps({
  contractId: {
    type: String,
    required: true,
  },
});
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const isLoading = ref(true);
const isSubmitting = ref(false);
const isChatLoading = ref(false);
const contract = ref(null);
const editableData = ref({
  title: "",
  content: "",
  amount: 0,
  end_date: null,
});

const editModeView = ref("edit");

// (新增) 需求一：進度條邏輯
const activeStep = computed(() => {
  if (!contract.value) return 0;
  switch (contract.value.status) {
    case "協商中":
      return 0;
    case "進行中":
    case "雇主請求修改":
    case "工作者請求修改":
    case "雇主請求終止":
    case "工作者請求終止":
      return 1; // 停在 "進行中"
    case "工作者要求驗收":
      return 2; // 停在 "驗收中"
    case "已完成":
      return 4; // 完成 (注意：el-steps 總數為 4，active 4 會標記全部完成)
    case "終止":
      return 1; // 停在 "進行中" (但會顯示 error)
    default:
      return 0;
  }
});

const stepStatus = computed(() => {
  if (!contract.value) return "process";
  switch (contract.value.status) {
    case "終止":
      return "error";
    case "雇主請求修改":
    case "工作者請求修改":
    case "雇主請求終止":
    case "工作者請求終止":
      return "warning"; // 處理中 (黃色)
    case "已完成":
      return "success";
    default:
      return "process"; // 正常 (藍色)
  }
});
// (新增結束)

// ... (Markdown 渲染邏輯不變) ...
const renderedReadOnlyContent = computed(() => {
  if (contract.value && contract.value.content) {
    return marked(contract.value.content);
  }
  return "";
});
const renderedEditPreview = computed(() => {
  if (editableData.value && editableData.value.content) {
    return marked(editableData.value.content);
  }
  return "<p><i>(無內容可預覽)</i></p>";
});

// ... (currentUser, isEmployer, isFreelancer computed 不變) ...
const currentUser = computed(() => authStore.user);
const isEmployer = computed(() => {
  return (
    contract.value &&
    currentUser.value?.user_id === contract.value.employer.user_id
  );
});
const isFreelancer = computed(() => {
  return (
    contract.value &&
    currentUser.value?.user_id === contract.value.freelancer.user_id
  );
});

// ... (onMounted, handleGoToChat, handleSaveDetails, handleDelete, getActionText, handleUpdateStatus, goBack, formatTime, statusTagType 都不變) ...
onMounted(async () => {
  isLoading.value = true;
  try {
    const res = await getContractById(props.contractId);
    contract.value = res.data;
    editableData.value = {
      title: res.data.title,
      content: res.data.content,
      amount: res.data.amount,
      end_date: res.data.end_date,
    };
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入合約失敗");
    router.push("/my-contracts");
  }
  isLoading.value = false;
});

async function handleGoToChat() {
  if (!contract.value) return;

  isChatLoading.value = true;
  try {
    const res = await createChatRoom(
      contract.value.project.project_id,
      contract.value.freelancer.user_id
    );
    const room = res.data;
    await chatStore.fetchRooms();
    await chatStore.selectRoom(room.room_id);
    router.push("/chat");
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "進入聊天室失敗");
  } finally {
    isChatLoading.value = false;
  }
}

async function handleSaveDetails() {
  isSubmitting.value = true;
  try {
    const res = await updateContractDetails(
      props.contractId,
      editableData.value
    );
    contract.value = res.data;
    ElMessage.success("合約草案已更新");
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "更新失敗");
  }
  isSubmitting.value = false;
}
async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      "您確定要撤銷此合約草案嗎？此操作無法復原。",
      "確認撤銷",
      { type: "warning" }
    );
    isSubmitting.value = true;
    await deleteContract(props.contractId);
    ElMessage.success("合約已撤銷");
    router.push("/my-jobs");
  } catch (err) {
    if (err === "cancel") return;
    ElMessage.error(err.response?.data?.detail || "撤銷失敗");
  }
  isSubmitting.value = false;
}

const getActionText = (newStatus) => {
  const map = {
    進行中: "同意並開始合約",
    協商中: "同意修改",
    雇主請求修改: "請求修改",
    工作者請求修改: "請求修改",
    雇主請求終止: "請求終止",
    工作者請求終止: "請求終止",
    工作者要求驗收: "提交驗收",
    已完成: "驗收通過",
    終止: "同意終止",
  };
  if (
    newStatus === "進行中" &&
    (contract.value.status.includes("請求修改") ||
      contract.value.status.includes("請求終止"))
  ) {
    return "拒絕";
  }
  if (newStatus === "進行中" && contract.value.status === "工作者要求驗收") {
    return "退回修正";
  }
  return map[newStatus] || "更新狀態";
};

async function handleUpdateStatus(newStatus) {
  const actionText = getActionText(newStatus);
  try {
    await ElMessageBox.confirm(
      `您確定要執行「${actionText}」嗎？`,
      "確認操作",
      {
        type:
          newStatus.includes("終止") || newStatus === "終止"
            ? "warning"
            : "primary",
      }
    );
    isSubmitting.value = true;
    const res = await updateContractStatus(props.contractId, newStatus);
    contract.value = res.data;
    ElMessage.success(`狀態已更新為：${newStatus}`);
    if (newStatus === "協商中") {
      editableData.value = {
        title: res.data.title,
        content: res.data.content,
        amount: res.data.amount,
        end_date: res.data.end_date,
      };
    }
  } catch (err) {
    if (err === "cancel") return;
    ElMessage.error(err.response?.data?.detail || "狀態更新失敗");
  }
  isSubmitting.value = false;
}

const goBack = () => router.back();
const formatTime = (time) => {
  return time ? dayjs(time).format("YYYY-MM-DD HH:mm") : "N/A";
};

const statusTagType = (status) => {
  switch (status) {
    case "協商中":
      return "warning";
    case "進行中":
      return "primary";
    case "雇主請求修改":
    case "工作者請求修改":
    case "工作者要求驗收":
      return "warning";
    case "雇主請求終止":
    case "工作者請求終止":
      return "danger";
    case "已完成":
      return "success";
    case "終止":
      return "info";
    default:
      return "";
  }
};
</script>

<style lang="scss" scoped>
.contract-view {
  padding: 20px;
}
.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}
/* (新增) 需求一：進度條樣式 */
.steps-card {
  margin-bottom: 20px;
  border: 1px solid var(--el-border-color-light);
  :deep(.el-card__body) {
    padding-top: 25px;
    padding-bottom: 15px;
  }
}
.step-warning,
.step-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 15px;
  padding: 8px;
  border-radius: 4px;
}
.step-warning {
  color: var(--el-color-warning-dark-2);
  background-color: var(--el-color-warning-light-9);
}
.step-error {
  color: var(--el-color-error-dark-2);
  background-color: var(--el-color-error-light-9);
}
/* (新增結束) */

.page-header-skeleton {
  height: 40px;
  margin-bottom: 20px;
}
.contract-card {
  border: 1px solid var(--el-border-color-light);
  height: 100%;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
.detail-subtitle {
  /* (修改) 需求二：使用 CSS 變數 */
  font-size: 0.9rem;
  color: var(--el-text-color-secondary); /* 原本: #909399 */
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
}
.editable-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}
.editable-content {
  margin-bottom: 20px;
  white-space: pre-wrap;
  font-family: monospace;
}
.contract-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 20px;
}
.contract-content-readonly,
.contract-content-preview {
  /* (修改) 需求二：使用 CSS 變數 */
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary); /* 原本: #303133 */
  background-color: var(--el-fill-color-lighter); /* 原本: #fcfcfc */
  border: 1px solid var(--el-border-color-lighter); /* 原本: #f0f0f0 */
  padding: 15px;
  border-radius: 4px;
  min-height: 400px;
}
:deep(.markdown-body) {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.2em;
    margin-bottom: 0.6em;
    font-weight: 600;
  }
  h1 {
    font-size: 1.8em;
  }
  h2 {
    font-size: 1.5em;
    /* (修改) 需求二：使用 CSS 變數 */
    border-bottom: 1px solid var(--el-border-color-lighter); /* 原本: #eee */
    padding-bottom: 5px;
  }
  h3 {
    font-size: 1.25em;
  }
  p {
    margin-bottom: 1em;
  }
  ul,
  ol {
    padding-left: 2em;
    margin-bottom: 1em;
  }
  li {
    margin-bottom: 0.4em;
  }
  code {
    /* (修改) 需求二：使用 CSS 變數 */
    background-color: var(--el-fill-color-light); /* 原本: #f0f0f0 */
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }
  pre {
    background-color: var(--el-fill-color-lighter); /* 原本: #f5f5f5 */
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
  blockquote {
    /* (修改) 需求二：使用 CSS 變數 */
    border-left: 4px solid var(--el-border-color-light); /* 原本: #ddd */
    padding-left: 10px;
    color: var(--el-text-color-secondary); /* 原本: #777 */
    margin-left: 0;
  }
}
.action-bar {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.chat-button {
  width: 100%;
  margin-top: 15px;
}
</style>
