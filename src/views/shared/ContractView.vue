<template>
  <div class="contract-view">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3">合約詳情</span>
      </template>
    </el-page-header>

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
            <el-input
              v-model="editableData.content"
              :rows="20"
              type="textarea"
              placeholder="請填寫合約內容..."
              class="editable-content"
            />
          </div>
          <div v-else>
            <h2 class="contract-title">{{ contract.title }}</h2>
            <div class="contract-content-readonly">
              {{ contract.content }}
            </div>
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
import { ChatDotRound } from "@element-plus/icons-vue"; // (新增) 匯入圖示
import dayjs from "dayjs";
import {
  getContractById,
  updateContractDetails,
  updateContractStatus,
  deleteContract,
} from "@/api/contract.js";
import { createChatRoom } from "@/api/message.js"; // (新增) 匯入
import { useAuthStore } from "@/store/authStore.js";
import { useChatStore } from "@/store/chatStore.js"; // (新增) 匯入

const props = defineProps({
  contractId: {
    type: String,
    required: true,
  },
});
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore(); // (新增) 取得 chat store 實例

const isLoading = ref(true);
const isSubmitting = ref(false);
const isChatLoading = ref(false); // (新增) 聊天室按鈕 loading 狀態
const contract = ref(null);
const editableData = ref({
  title: "",
  content: "",
  amount: 0,
  end_date: null,
});

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

// --- (新增) M8.1 聊天室邏輯 ---
async function handleGoToChat() {
  if (!contract.value) return;

  isChatLoading.value = true;
  try {
    // 1. 呼叫 API 建立聊天室 (後端會處理冪等性)
    //
    const res = await createChatRoom(
      contract.value.project.project_id,
      // 修正點 2: 移除了這裡多餘的 "A" 字元
      contract.value.freelancer.user_id
    );
    const room = res.data; // 這是 RoomOut 物件

    // 2. (可選) 更新 store 中的房間列表
    await chatStore.fetchRooms();

    // 3. (重要) 讓 chatStore 選中這個房間 (這會觸發 WS 連線)
    //
    await chatStore.selectRoom(room.room_id);

    // 4. 導航到聊天頁面
    router.push("/chat");
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "進入聊天室失敗");
  } finally {
    isChatLoading.value = false;
  }
}
// --- (新增結束) ---

// --- (M7.3) 雇主動作 (保持不變) ---
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

// --- ( M7 狀態機重構 ) ---
// (修改) 更新 actionText Map 和 handleUpdateStatus
const getActionText = (newStatus) => {
  const map = {
    進行中: "同意並開始合約", // (來自 協商中) 或 (來自 拒絕修改/終止)
    協商中: "同意修改", // (來自 請求修改)
    雇主請求修改: "請求修改",
    工作者請求修改: "請求修改",
    雇主請求終止: "請求終止",
    工作者請求終止: "請求終止",
    工作者要求驗收: "提交驗收",
    已完成: "驗收通過",
    終止: "同意終止",
  };
  // (處理 "拒絕" 情況，它們的目標狀態都是 '進行中')
  if (
    newStatus === "進行中" &&
    (contract.value.status.includes("請求修改") ||
      contract.value.status.includes("請求終止"))
  ) {
    return "拒絕";
  }
  // (處理 "退回修正" 情況)
  if (newStatus === "進行中" && contract.value.status === "工作者要求驗收") {
    return "退回修正";
  }
  return map[newStatus] || "更新狀態";
};

// (修改) 更新合約狀態函式
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

    // (M7.3) 如果狀態退回協商中，雇主可能需要重新編輯
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
// --- ( M7 修正結束 ) ---

// --- 格式化函式 ---
const goBack = () => router.back();
const formatTime = (time) => {
  return time ? dayjs(time).format("YYYY-MM-DD HH:mm") : "N/A";
};

// --- ( M7 狀態機重構 ) ---
// (修改) 更新狀態標籤
const statusTagType = (status) => {
  switch (status) {
    case "協商中":
      return "warning";
    case "進行中":
      return "primary";
    case "雇主請求修改":
    case "工作者請求修改":
    case "工作者要求驗U+6536":
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
// --- ( M7 修正結束 ) ---
</script>

<style lang="scss" scoped>
/* (Style 保持不變) */
.contract-view {
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
  font-size: 0.9rem;
  color: #909399;
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
.contract-content-readonly {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  background-color: #fcfcfc;
  border: 1px solid #f0f0f0;
  padding: 15px;
  border-radius: 4px;
  min-height: 400px;
}
.action-bar {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
/* (新增) Chat 按鈕樣式 */
.chat-button {
  width: 100%;
  margin-top: 15px;
}
</style>
