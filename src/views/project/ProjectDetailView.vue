<template>
  <el-row justify="center">
    <el-col :xs="24" :sm="20" :md="16" :lg="12">
      <el-page-header @back="goBack" class="page-header">
        <template #content>
          <span class="text-large font-600 mr-3"> 案件詳情 </span>
        </template>
      </el-page-header>

      <el-card v-if="isLoading" shadow="never">
        <el-skeleton :rows="5" animated />
      </el-card>

      <el-card v-if="!isLoading && project" shadow="hover">
        <template #header>
          <h2>{{ project.title }}</h2>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="預算">
            {{ project.budget_min || "N/A" }} ~
            {{ project.budget_max || "N/A" }}
          </el-descriptions-item>
          <el-descriptions-item label="案件狀態">
            <el-tag :type="statusTagType(project.status)">
              {{ project.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="地區">
            {{ project.location || "未指定" }}
          </el-descriptions-item>
          <el-descriptions-item label="工作型態">
            {{ project.work_type }}
          </el-descriptions-item>
          <el-descriptions-item label="需求人數">
            {{ project.required_people }} 人
          </el-descriptions-item>
          <el-descriptions-item label="提案截止">
            {{ formatDate(project.proposals_deadline) }}
          </el-descriptions-item>
          <el-descriptions-item label="案件完成日">
            {{ formatDate(project.completion_deadline) }}
          </el-descriptions-item>
          <el-descriptions-item label="所需技能" :span="2">
            <el-tag
              v-for="skill in project.skills"
              :key="skill.tag.tag_id"
              type="info"
              size="small"
              class="skill-tag"
            >
              {{ skill.tag.name }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="詳細需求內容" :span="2">
            <div class="description-content">{{ project.description }}</div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-buttons" v-if="authStore.userRole === '自由工作者'">
          <el-divider />

          <el-button
            v-if="canPropose"
            type="primary"
            @click="dialogVisible = true"
          >
            <el-icon><Pointer /></el-icon> 我要提案
          </el-button>

          <el-tag v-if="hasProposed" type="success" size="large">
            <el-icon><Select /></el-icon> 你已提案
          </el-tag>
        </div>
      </el-card>

      <el-empty
        description="案件不存在或載入失敗"
        v-if="!isLoading && !project"
      />

      <el-dialog
        v-model="dialogVisible"
        title="提交提案"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form :model="proposalForm">
          <el-form-item label="提案簡述" required>
            <el-input
              type="textarea"
              v-model="proposalForm.briefDescription"
              rows="5"
              placeholder="請輸入您的提案簡述..."
            />
          </el-form-item>

          <el-form-item label="附件 (僅限 PDF)">
            <el-upload
              ref="uploadRef"
              v-model:file-list="proposalForm.attachmentFile"
              :limit="1"
              :auto-upload="false"
              accept="application/pdf"
            >
              <el-button type="default">選擇檔案</el-button>
              <template #tip>
                <div class="el-upload__tip">僅支援 PDF 檔案。</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="handleSubmitProposal"
              :loading="isSubmitting"
            >
              確認提交
            </el-button>
          </span>
        </template>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue"; // M6 新增: computed, reactive
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore.js";
import { ElMessage, ElUpload } from "element-plus"; // M6 新增: ElUpload
import { getProjectById } from "@/api/project.js";
import { submitProposal, getMyProposals } from "@/api/proposal.js"; // M6 新增
import dayjs from "dayjs";
import { Pointer, Select } from "@element-plus/icons-vue"; // M6 新增: Select

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(true); // 頁面載入
const project = ref(null);
const projectId = route.params.projectId;

console.log(authStore.userRole);

// M6 新增: 提案相關狀態
const hasProposed = ref(false); // 是否已提案
const dialogVisible = ref(false); // 提案視窗
const isSubmitting = ref(false); // 提交中
const uploadRef = ref(null); // 上傳元件的 ref
const proposalForm = reactive({
  briefDescription: "",
  attachmentFile: [], // ElUpload 綁定的是 file-list
});
// M6 新增結束

onMounted(async () => {
  if (!projectId) {
    ElMessage.error("無效的案件 ID");
    isLoading.value = false;
    return;
  }
  try {
    const res = await getProjectById(projectId);
    project.value = res.data;

    // M6 新增: 載入案件後，檢查是否已提案
    if (authStore.userRole === "自由工作者") {
      await checkIfProposed();
    }
    // M6 新增結束
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入案件詳情失敗");
  }
  isLoading.value = false;
});

// M6 新增: 檢查是否已提案
const checkIfProposed = async () => {
  try {
    const res = await getMyProposals();
    hasProposed.value = res.data.some((p) => p.project_id === projectId);
  } catch (err) {
    console.error("檢查提案狀態失敗:", err);
  }
};

// M6 新增: 判斷是否能提案
const canPropose = computed(() => {
  if (!project.value) {
    console.log("無法提案: ", {
      project: project.value,
    });
    return false;
  }
  return (
    authStore.userRole === "自由工作者" &&
    project.value.status === "招募中" &&
    !hasProposed.value
  );
});

// M6 新增: 提交提案
const handleSubmitProposal = async () => {
  if (!proposalForm.briefDescription) {
    ElMessage.warning("請填寫提案簡述");
    return;
  }

  isSubmitting.value = true;
  try {
    // 從 file-list 中獲取原始檔案
    const file = proposalForm.attachmentFile.length
      ? proposalForm.attachmentFile[0].raw
      : null;

    // 呼叫 Step 4 建立的 API
    await submitProposal(projectId, proposalForm.briefDescription, file);

    ElMessage.success("提案提交成功！");
    dialogVisible.value = false; // 關閉視窗
    hasProposed.value = true; // 更新狀態

    // 清空表單
    proposalForm.briefDescription = "";
    proposalForm.attachmentFile = [];
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "提案提交失敗");
  }
  isSubmitting.value = false;
};
// M6 新增結束

// 返回上一頁
const goBack = () => {
  router.back();
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "未指定";
  return dayjs(dateString).format("YYYY-MM-DD HH:mm");
};

// 狀態標籤顏色
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
.page-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}
.skill-tag {
  margin: 2px 4px 2px 0;
}
.description-content {
  white-space: pre-wrap; /* 保留換行 */
}
.action-buttons {
  margin-top: 20px;
  text-align: right;
}
/* M6 新增 */
.el-upload__tip {
  font-size: 12px;
  color: #999;
}
.el-tag {
  display: inline-flex;
  align-items: center;
  .el-icon {
    margin-right: 4px;
  }
}
/* M6 新增結束 */
</style>
