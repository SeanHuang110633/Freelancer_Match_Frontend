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
  padding: 20px;
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
