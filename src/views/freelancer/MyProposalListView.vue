<template>
  <div class="my-proposal-list-view">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3"> 我的提案 </span>
      </template>
    </el-page-header>

    <div v-if="isLoading">
      <el-skeleton :rows="5" animated />
    </div>

    <el-empty
      description="您尚未提交任何提案"
      v-if="!isLoading && proposals.length === 0"
    >
      <el-button type="primary" @click="goToFindJobs">去找案子</el-button>
    </el-empty>

    <el-row :gutter="20" v-if="!isLoading && proposals.length > 0">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="(p, index) in proposals"
        :key="p.proposal_id"
        class="proposal-col"
      >
        <router-link
          :to="`/my-proposals/${p.proposal_id}`"
          class="proposal-link"
        >
          <el-card class="proposal-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">{{
                  p.project?.title || "(已刪除的案件)"
                }}</span>
                <el-tag :type="statusTagType(p.status)" size="small">{{
                  p.status
                }}</el-tag>
              </div>
            </template>

            <div class="proposal-description">
              {{ p.brief_description || "(無說明)" }}
            </div>

            <div class="proposal-meta">
              <div class="meta-row">
                <el-icon><Document /></el-icon>
                <span class="meta-label">Submitted at : </span>
                <span>{{ formatDate(p.created_at) }}</span>
              </div>
            </div>

            <div class="card-actions">
              <el-button
                text
                size="small"
                type="primary"
                @click.stop.prevent="goToProjectDetail(p.project?.project_id)"
                >查看案件</el-button
              >
              <el-button
                v-if="p.status === '已提交'"
                text
                size="small"
                type="danger"
                @click.stop.prevent="withdraw(p.proposal_id, index)"
                >撤回提案</el-button
              >
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
import { getMyProposals, withdrawProposal } from "@/api/proposal.js";
import { Document } from "@element-plus/icons-vue";

const router = useRouter();
const isLoading = ref(true);
const proposals = ref([]);

const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
};

onMounted(async () => {
  try {
    const res = await getMyProposals();
    // (修改) 依據 M6.2，提案狀態不符 (雇主已撤銷案件)
    // 我們需要從 proposal_schema.py 獲取 ProposalOutWithProject
    // 假設它已正確返回
    proposals.value = res.data;
    console.log("res.data : ", res.data);
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入提案失敗");
  } finally {
    isLoading.value = false;
  }
});

const goBack = () => router.back();
const goToFindJobs = () => router.push("/find-jobs");
const goToProjectDetail = (projectId) => {
  if (!projectId) {
    ElMessage.error("案件不存在或已被刪除");
    return;
  }
  router.push(`/projects/${projectId}`);
};

// (修改) 3. 撤回邏輯優化
const withdraw = async (proposalId, index) => {
  try {
    await ElMessageBox.confirm("確定要撤回此提案嗎？", "確認");
    await withdrawProposal(proposalId);
    ElMessage.success("已撤回");

    // (優化) 不重新-fetch，直接從本地陣列移除
    proposals.value.splice(index, 1);
  } catch (err) {
    if (err === "cancel") return;
    ElMessage.error(err.response?.data?.detail || "撤回失敗");
  }
};

const statusTagType = (status) => {
  switch (status) {
    case "已提交":
      return "success";
    case "已接受":
      return "warning";
    case "已拒絕":
      return "danger";
    // (新增) 增加 M6.2 的狀態
    case "雇主已撤銷案件":
      return "info";
    default:
      return "primary";
  }
};
</script>

<style lang="scss" scoped>
.my-proposal-list-view {
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
.proposal-col {
  margin-bottom: 20px;
}
/* (新增) 連結樣式 */
.proposal-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}
.proposal-card {
  /* (修改) 讓 router-link 的點擊生效 */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.proposal-meta {
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
  /* (新增) 確保 icon 對齊 */
  .meta-row {
    display: flex;
    align-items: center;
  }
  .meta-label {
    margin: 0 4px;
  }
  .el-icon {
    font-size: 14px;
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}
/* (新增) 標題溢出處理 */
.card-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}
.card-actions {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: right;
  /* (新增) 按鈕間距 */
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.proposal-description {
  color: #303133;
  font-size: 14px;
  margin-bottom: 10px;
  /* (新增) 溢出處理 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 42px; /* 2 行的高度 */
}
</style>
