<template>
  <div class="proposal-detail-view">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3"> 提案詳情 </span>
      </template>
      <template #extra>
        <div
          class="page-header-extra"
          v-if="!isLoading && proposal && proposal.status === '已提交'"
        >
          <el-button
            v-if="!isEditing"
            type="primary"
            plain
            :icon="Edit"
            @click="isEditing = true"
          >
            修改提案
          </el-button>
          <el-button v-if="isEditing" @click="handleCancel"> 取消 </el-button>
          <el-button
            v-if="isEditing"
            type="primary"
            @click="handleSave"
            :loading="isSubmitting"
          >
            儲存變更
          </el-button>
        </div>
      </template>
    </el-page-header>

    <div v-if="isLoading">
      <el-row :gutter="20">
        <el-col :span="8"><el-skeleton :rows="5" animated /></el-col>
        <el-col :span="8"><el-skeleton :rows="8" animated /></el-col>
        <el-col :span="8"><el-skeleton :rows="6" animated /></el-col>
      </el-row>
    </div>

    <el-row :gutter="20" v-if="!isLoading && proposal && proposal.project">
      <el-col :xs="24" :sm="12" :md="8" class="detail-col">
        <el-card shadow="hover" class="h-100">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><User /></el-icon> 雇主資訊</span
              >
            </div>
          </template>
          <div
            v-if="proposal.project.employer.employer_profile"
            class="employer-info"
          >
            <el-avatar
              :size="60"
              :src="proposal.project.employer.employer_profile.company_logo_url"
            />
            <h3 class="employer-name">
              {{ proposal.project.employer.employer_profile.company_name }}
            </h3>
            <p class="employer-email">
              {{ proposal.project.employer.email }}
            </p>
          </div>
          <div v-else>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="雇主">
                {{ proposal.project.employer.email }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8" class="detail-col">
        <el-card shadow="hover" class="h-100">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><Collection /></el-icon> 案件資訊</span
              >
            </div>
          </template>
          <el-descriptions :column="1" border direction="vertical">
            <el-descriptions-item label="案件標題">
              {{ proposal.project.title }}
            </el-descriptions-item>
            <el-descriptions-item label="預算">
              {{ proposal.project.budget_min || "N/A" }} ~
              {{ proposal.project.budget_max || "N/A" }}
            </el-descriptions-item>
            <el-descriptions-item label="狀態">
              <el-tag :type="statusTagType(proposal.project.status)">
                {{ proposal.project.status }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <el-button
            type="primary"
            plain
            @click="goToProjectDetail"
            class="w-100"
            style="margin-top: 20px"
          >
            查看完整案件
          </el-button>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="8" class="detail-col">
        <el-card shadow="hover" class="h-100">
          <template #header>
            <div class="card-header">
              <span
                ><el-icon><Pointer /></el-icon> 我的提案</span
              >
              <el-tag :type="statusTagType(proposal.status, true)">
                {{ proposal.status }}
              </el-tag>
            </div>
          </template>

          <div v-if="!isEditing" class="proposal-content">
            <el-descriptions :column="1" border direction="vertical">
              <el-descriptions-item label="提案簡述">
                <div class="brief-description">
                  {{ proposal.brief_description || "N/A" }}
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="附件 (PDF)">
                <el-link
                  v-if="proposal.attachment_url"
                  :href="getFullUrl(proposal.attachment_url)"
                  type="primary"
                  target="_blank"
                  :icon="Download"
                  >下載附件</el-link
                >
                <span v-else>未上傳</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-else>
            <el-form :model="editForm" label-position="top">
              <el-form-item label="提案簡述" required>
                <el-input
                  type="textarea"
                  v-model="editForm.briefDescription"
                  rows="5"
                />
              </el-form-item>
              <el-form-item label="重新上傳附件 (僅限 PDF)">
                <el-upload
                  ref="uploadRef"
                  v-model:file-list="editForm.attachmentFile"
                  :limit="1"
                  :auto-upload="false"
                  accept="application/pdf"
                >
                  <el-button type="default">選擇新檔案</el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                      (不選則保留舊檔案：
                      <span v-if="proposal.attachment_url">有</span>
                      <span v-else>無</span>
                      )
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  User,
  Collection,
  Pointer,
  Edit,
  Download,
} from "@element-plus/icons-vue";
import { getProposalDetails, updateProposal } from "@/api/proposal.js";
import { API_BASE_URL } from "@/config/env.js"; // 匯入 BASE_URL

const props = defineProps({
  proposalId: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const isLoading = ref(true);
const isSubmitting = ref(false);
const isEditing = ref(false);
const proposal = ref(null);
const uploadRef = ref(null);

// 編輯表單
const editForm = reactive({
  briefDescription: "",
  attachmentFile: [], // ElUpload 綁定
});

// 載入資料
onMounted(async () => {
  isLoading.value = true;
  try {
    const res = await getProposalDetails(props.proposalId);
    proposal.value = res.data;
    // 設定表單初始值
    editForm.briefDescription = res.data.brief_description;
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入提案失敗");
    router.push("/my-proposals");
  } finally {
    isLoading.value = false;
  }
});

// 取消
const handleCancel = () => {
  isEditing.value = false;
  // 重置表單
  editForm.briefDescription = proposal.value.brief_description;
  editForm.attachmentFile = [];
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 儲存
const handleSave = async () => {
  if (!editForm.briefDescription) {
    ElMessage.warning("請填寫提案簡述");
    return;
  }

  isSubmitting.value = true;
  try {
    const file = editForm.attachmentFile.length
      ? editForm.attachmentFile[0].raw
      : null;

    const res = await updateProposal(
      props.proposalId,
      editForm.briefDescription,
      file
    );

    // 更新成功
    proposal.value = res.data; // 更新本地資料
    handleCancel(); // 關閉編輯模式並重置表單
    ElMessage.success("提案更新成功！");
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "更新失敗");
  } finally {
    isSubmitting.value = false;
  }
};

// 輔助函式
const goBack = () => router.back();
const goToProjectDetail = () => {
  if (proposal.value?.project) {
    router.push(`/projects/${proposal.value.project.project_id}`);
  }
};

// 輔助函式：處理相對 URL
const getFullUrl = (url) => {
  if (!url) return "";
  // 假設 API_BASE_URL 是 http://localhost:8000
  // 而 url 是 /static/uploads/...
  return `${API_BASE_URL}${url}`;
};

// 輔助函式：狀態標籤
const statusTagType = (status, isProposal = false) => {
  // 提案狀態
  if (isProposal) {
    switch (status) {
      case "已提交":
        return "success";
      case "已接受":
        return "warning";
      case "已拒絕":
        return "danger";
      case "雇主已撤銷案件":
        return "info";
      default:
        return "primary";
    }
  }
  // 案件狀態
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
.proposal-detail-view {
  // --- 1. Define New Palette ---
  --app-bg-color: rgba(250, 247, 239, 0.973); // Soft beige
  --app-text-color: #616130;
  --app-text-color-secondary: #8a8a69;
  --app-hover-border-color: #dcd8c8;
  --app-hover-bg-color: rgba(252, 250, 248, 1); // More opaque
  --app-accent-color: #817c5b; // Muted olive-brown
  --app-warning-color: #c6a870; // Muted gold
  --app-danger-color: #b56f6f; // Brownish-red
  --app-info-bg-color: rgba(220, 216, 200, 0.3); // Muted beige bg for tags

  // --- 2. Override Element Plus Vars ---
  // This is the cleanest way to override the palette
  // It will affect all children Element Plus components within this view
  --el-text-color-primary: var(--app-text-color);
  --el-text-color-regular: var(--app-text-color);
  --el-text-color-secondary: var(--app-text-color-secondary);
  --el-text-color-placeholder: #a2a287;

  --el-bg-color: var(--app-bg-color);
  --el-bg-color-overlay: var(--app-hover-bg-color);
  --el-fill-color-light: var(--app-hover-bg-color);
  --el-fill-color-blank: transparent; // Make backgrounds transparent

  --el-card-bg-color: var(--app-bg-color);
  --el-card-border-color: transparent; // No borders on cards by default

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

  // --- 3. Apply Base Styles ---
  padding: 20px;
  color: var(--app-text-color);
}
.page-header {
  margin-bottom: 20px;
  background: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}
:deep(.el-page-header__extra) {
  margin: 0;
}
.page-header-extra {
  display: flex;
  align-items: center;
  gap: 10px;
}
.detail-col {
  margin-bottom: 20px;
}
.h-100 {
  height: 100%;
}
.w-100 {
  width: 100%;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  .el-icon {
    margin-right: 6px;
  }
}
.employer-info {
  text-align: center;
  .employer-name {
    margin: 10px 0 5px 0;
  }
  .employer-email {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
}
.brief-description {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
}
</style>
