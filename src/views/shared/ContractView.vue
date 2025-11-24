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
              <span>合約概況</span>
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

          <div class="section-divider"></div>
          <h3 class="detail-subtitle">合約條款</h3>

          <div v-if="isEmployer && contract.status === '協商中'">
            <el-form :model="editableData" label-position="top">
              <el-form-item label="合約金額 (TWD)">
                <el-input-number
                  v-model="editableData.amount"
                  :min="0"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="履約期限 (End Date)">
                <el-date-picker
                  v-model="editableData.end_date"
                  type="datetime"
                  placeholder="選擇截止日期"
                  style="width: 100%"
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

          <div class="section-divider"></div>
          <div class="section-block">
            <div class="section-header-row">
              <h3 class="detail-subtitle no-margin">交付物</h3>
              <el-button
                v-if="isFreelancer && canUpload"
                type="primary"
                link
                size="small"
                @click="openUploadDialog"
              >
                <el-icon><Upload /></el-icon> 上傳
              </el-button>
            </div>

            <div v-if="deliverables.length === 0" class="empty-placeholder">
              <el-empty :image-size="60" description="尚無交付物" />
            </div>

            <div v-else class="deliverables-list">
              <div
                v-for="item in deliverables"
                :key="item.deliverable_id"
                class="deliverable-item"
              >
                <div class="d-header">
                  <span class="d-date">{{ formatTime(item.created_at) }}</span>
                  <el-tag
                    size="small"
                    :type="
                      item.acceptance_status === '待驗收'
                        ? 'info'
                        : item.acceptance_status === '通過'
                        ? 'success'
                        : 'danger'
                    "
                  >
                    {{ item.acceptance_status }}
                  </el-tag>
                </div>
                <div class="d-desc">{{ item.description }}</div>
                <div class="d-actions">
                  <el-link
                    v-if="item.file_url"
                    :href="getFileUrl(item.file_url)"
                    target="_blank"
                    type="primary"
                    :underline="false"
                  >
                    <el-icon><Document /></el-icon> 下載
                  </el-link>
                  <div
                    v-if="
                      isFreelancer &&
                      canUpload &&
                      item.acceptance_status === '待驗收'
                    "
                  >
                    <el-button
                      link
                      type="primary"
                      size="small"
                      @click="openEditDialog(item)"
                    >
                      編輯
                    </el-button>
                    <el-button
                      link
                      type="danger"
                      size="small"
                      @click="handleDeleteDeliverable(item)"
                    >
                      撤回
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="contract.status === '已完成'">
            <div class="section-divider"></div>
            <div class="section-block">
              <div class="section-header-row">
                <h3 class="detail-subtitle no-margin">雙向評價</h3>
                <el-button
                  v-if="!myReview"
                  type="primary"
                  size="small"
                  @click="openReviewModal"
                  link
                >
                  <el-icon><Star /></el-icon> 撰寫評價
                </el-button>
              </div>

              <div v-if="reviews.length === 0" class="empty-placeholder">
                <el-empty :image-size="60" description="尚無評價" />
              </div>

              <div v-else class="reviews-list">
                <div v-if="myReview" class="review-item my-review">
                  <div class="review-header">
                    <span class="reviewer-label">您給予的評價</span>
                    <span class="review-date">{{
                      formatTime(myReview.created_at)
                    }}</span>
                  </div>
                  <div class="review-rating-summary">
                    <el-rate
                      v-model="myReviewAverage"
                      disabled
                      show-score
                      text-color="#ff9900"
                      score-template="{value} 分"
                    />
                  </div>
                  <div class="review-comment">
                    {{ myReview.comment || "(無文字評語)" }}
                  </div>
                </div>

                <div v-if="partnerReview" class="review-item partner-review">
                  <div class="review-header">
                    <span class="reviewer-label">
                      {{ isEmployer ? "工作者" : "雇主" }}給予的評價
                    </span>
                    <span class="review-date">{{
                      formatTime(partnerReview.created_at)
                    }}</span>
                  </div>
                  <div class="review-rating-summary">
                    <el-rate
                      v-model="partnerReviewAverage"
                      disabled
                      show-score
                      text-color="#ff9900"
                      score-template="{value} 分"
                    />
                  </div>
                  <div class="review-comment">
                    {{ partnerReview.comment || "(無文字評語)" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  :disabled="deliverables.length === 0"
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

    <el-dialog
      v-model="uploadDialogVisible"
      :title="isEditingDeliverable ? '編輯交付物' : '上傳交付物'"
      width="500px"
      align-center
    >
      <el-form :model="uploadForm" label-position="top">
        <el-form-item label="說明 (必填)">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            placeholder="請描述此交付物內容..."
          />
        </el-form-item>
        <el-form-item label="檔案 (選填)">
          <input
            type="file"
            @change="handleFileChange"
            accept=".pdf,.zip,.doc,.docx"
          />
          <div class="file-hint" v-if="isEditingDeliverable">
            若不更新檔案，請勿選擇。
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitUpload"
            :loading="isUploading"
            :disabled="
              !uploadForm.description ||
              (!uploadForm.file && !isEditingDeliverable)
            "
          >
            {{ isEditingDeliverable ? "更新" : "上傳" }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <ReviewModal
      v-if="contract"
      v-model:visible="showReviewModal"
      :contract-id="contract.contract_id"
      :is-employer="isEmployer"
      @review-submitted="handleReviewSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ChatDotRound,
  Edit,
  View,
  WarningFilled,
  CircleCloseFilled,
  Upload,
  Document,
  Star, // (新增 Icon)
} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { marked } from "marked";
import { API_BASE_URL } from "@/config/env.js";

import {
  getContractById,
  updateContractDetails,
  updateContractStatus,
  deleteContract,
} from "@/api/contract.js";
import {
  getDeliverables,
  uploadDeliverable,
  updateDeliverable,
  deleteDeliverable,
} from "@/api/deliverable.js";
// (新增) Review API
import { getContractReviews } from "@/api/review.js";

import { createChatRoom } from "@/api/message.js";
import { useAuthStore } from "@/store/authStore.js";
import { useChatStore } from "@/store/chatStore.js";

// (新增) Review Modal 元件
import ReviewModal from "@/components/ReviewModal.vue";

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

const deliverables = ref([]);
const uploadDialogVisible = ref(false);
const isUploading = ref(false);
const isEditingDeliverable = ref(false);
const currentEditingId = ref(null);
const uploadForm = ref({
  description: "",
  file: null,
});

// (新增) Review State
const reviews = ref([]);
const showReviewModal = ref(false);

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
      return 1;
    case "工作者要求驗收":
      return 2;
    case "已完成":
      return 4;
    case "終止":
      return 1;
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
      return "warning";
    case "已完成":
      return "success";
    default:
      return "process";
  }
});

const canUpload = computed(() => {
  return contract.value && contract.value.status === "進行中";
});

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

// (新增) Review Computed Properties
const myReview = computed(() => {
  if (!currentUser.value) return null;
  return reviews.value.find((r) => r.reviewer_id === currentUser.value.user_id);
});

const partnerReview = computed(() => {
  if (!currentUser.value) return null;
  return reviews.value.find((r) => r.reviewer_id !== currentUser.value.user_id);
});

// 簡易計算平均分 (UI 顯示用)
const calculateAvg = (review) => {
  if (!review) return 0;
  let sum = 0;
  // 判斷該 review 的 reviewer 是否為雇主
  const reviewerIsEmployer =
    review.reviewer_id === contract.value.employer.user_id;

  if (reviewerIsEmployer) {
    // 雇主評的 -> 讀取 fw 欄位
    sum =
      (review.rating_communication_fw || 0) +
      (review.rating_professionalism_fw || 0) +
      (review.rating_punctuality_fw || 0) +
      (review.rating_quality_fw || 0);
  } else {
    // 工作者評的 -> 讀取 we 欄位
    sum =
      (review.rating_communication_we || 0) +
      (review.rating_quality_we || 0) +
      (review.rating_compensation_we || 0) +
      (review.rating_process_we || 0);
  }
  return sum / 4;
};

const myReviewAverage = computed(() => calculateAvg(myReview.value));
const partnerReviewAverage = computed(() => calculateAvg(partnerReview.value));

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

    await fetchDeliverables();

    // (新增) 若已完成，載入評價
    if (contract.value.status === "已完成") {
      await fetchReviews();
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入合約失敗");
    router.push("/my-contracts");
  }
  isLoading.value = false;
});

async function fetchDeliverables() {
  try {
    const res = await getDeliverables(props.contractId);
    deliverables.value = res.data;
  } catch (error) {
    console.error("載入交付物失敗", error);
  }
}

const getFileUrl = (relativePath) => {
  if (!relativePath) return "";
  return `${API_BASE_URL}${relativePath}`;
};

const openUploadDialog = () => {
  isEditingDeliverable.value = false;
  currentEditingId.value = null;
  uploadForm.value = { description: "", file: null };
  uploadDialogVisible.value = true;
};

const openEditDialog = (item) => {
  isEditingDeliverable.value = true;
  currentEditingId.value = item.deliverable_id;
  uploadForm.value = {
    description: item.description,
    file: null,
  };
  uploadDialogVisible.value = true;
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploadForm.value.file = file;
  }
};

const submitUpload = async () => {
  isUploading.value = true;
  try {
    if (isEditingDeliverable.value) {
      await updateDeliverable(
        currentEditingId.value,
        uploadForm.value.file,
        uploadForm.value.description
      );
      ElMessage.success("交付物已更新");
    } else {
      await uploadDeliverable(
        props.contractId,
        uploadForm.value.file,
        uploadForm.value.description
      );
      ElMessage.success("交付物已上傳");
    }
    uploadDialogVisible.value = false;
    await fetchDeliverables();
  } catch (error) {
    const msg = error.response?.data?.detail || "操作失敗";
    ElMessage.error(msg);
  } finally {
    isUploading.value = false;
  }
};

const handleDeleteDeliverable = async (item) => {
  try {
    await ElMessageBox.confirm(
      "確定要撤回此交付物嗎？此操作將永久刪除檔案。",
      "確認撤回",
      { type: "warning" }
    );
    await deleteDeliverable(item.deliverable_id);
    ElMessage.success("已撤回交付物");
    await fetchDeliverables();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.response?.data?.detail || "撤回失敗");
    }
  }
};

// (新增) Review Functions
async function fetchReviews() {
  try {
    const res = await getContractReviews(props.contractId);
    reviews.value = res.data;
  } catch (error) {
    console.error("Fetch reviews failed", error);
  }
}

const openReviewModal = () => {
  showReviewModal.value = true;
};

const handleReviewSubmitted = async () => {
  await fetchReviews();
};

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
    // (新增) 狀態變更為已完成時，重新載入評價區塊
    if (newStatus === "已完成") {
      await fetchReviews();
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
  // --- Variables ---
  --app-bg-color: rgba(250, 247, 239, 0.973);
  --app-text-color: #616130;
  --app-text-color-secondary: #8a8a69;
  --app-hover-border-color: #dcd8c8;
  --app-hover-bg-color: rgba(252, 250, 248, 1);
  --app-accent-color: #817c5b;
  --app-warning-color: #c6a870;
  --app-danger-color: #b56f6f;
  --app-info-bg-color: rgba(220, 216, 200, 0.3);

  --el-text-color-primary: var(--app-text-color);
  --el-text-color-regular: var(--app-text-color);
  --el-text-color-secondary: var(--app-text-color-secondary);
  --el-text-color-placeholder: #a2a287;

  --el-bg-color: var(--app-bg-color);
  --el-bg-color-overlay: var(--app-hover-bg-color);
  --el-fill-color-light: var(--app-hover-bg-color);
  --el-fill-color-blank: transparent;

  --el-card-bg-color: var(--app-bg-color);
  --el-card-border-color: transparent;

  --el-border-color: var(--app-hover-border-color);
  --el-border-color-lighter: rgba(220, 216, 200, 0.5);
  --el-border-color-light: var(--app-hover-border-color);

  --el-color-primary: var(--app-accent-color);
  --el-color-primary-light-9: var(--app-info-bg-color);

  --el-color-warning: var(--app-warning-color);
  --el-color-warning-light-9: var(--app-info-bg-color);

  --el-color-info: var(--app-text-color-secondary);
  --el-color-info-light-9: var(--app-info-bg-color);

  --el-color-danger: var(--app-danger-color);
  --el-color-danger-light-9: rgba(181, 111, 111, 0.1);

  padding: 20px;
  color: var(--app-text-color);
}
.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}
.steps-card {
  margin-bottom: 20px;
  background-color: rgba(250, 247, 239, 0.973);
  border: 1px solid var(--el-border-color-light);
  :deep(.el-card__body) {
    padding-top: 10px;
    padding-bottom: 10px;
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
  color: var(--el-text-color-secondary);
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
}
.detail-subtitle.no-margin {
  margin-top: 0;
  margin-bottom: 0;
}
.section-divider {
  height: 1px;
  background-color: var(--el-border-color-lighter);
  margin: 20px 0;
  border: none;
}
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.section-block {
  /* 可選：給區塊一點間距 */
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
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
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
    border-bottom: 1px solid var(--el-border-color-lighter);
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
    background-color: var(--el-fill-color-light);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }
  pre {
    background-color: var(--el-fill-color-lighter);
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
  blockquote {
    border-left: 4px solid var(--el-border-color-light);
    padding-left: 10px;
    color: var(--el-text-color-secondary);
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

/* Deliverables Styles */
.deliverables-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.deliverable-item {
  background-color: var(--el-fill-color-light);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}
.d-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.d-desc {
  font-size: 14px;
  margin-bottom: 8px;
  white-space: pre-wrap;
}
.d-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}
.file-hint {
  font-size: 12px;
  color: var(--el-color-info);
  margin-top: 5px;
}
.empty-placeholder {
  padding: 10px 0;
}

/* Review Styles */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.review-item {
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
  background-color: #fff; /* 與 deliverables 區分 */
}
.my-review {
  border-left: 4px solid var(--el-color-primary);
}
.partner-review {
  border-left: 4px solid var(--el-color-info);
}
.review-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.reviewer-label {
  font-weight: bold;
  color: var(--el-text-color-primary);
}
.review-comment {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--el-text-color-regular);
}
</style>
