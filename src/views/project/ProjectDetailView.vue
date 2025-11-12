<template>
  <el-row justify="center">
    <el-col :xs="24" :sm="20" :md="18" :lg="16">
      <el-page-header @back="goBack" class="page-header">
        <template #content>
          <span class="text-large font-600 mr-3"> 案件詳情 </span>
        </template>
        <template #extra>
          <div
            class="page-header-extra"
            v-if="isOwner && project && project.status === '招募中'"
          >
            <el-button type="primary" plain :icon="Edit" @click="goToEditPage">
              編輯案件
            </el-button>
          </div>
        </template>
      </el-page-header>

      <div v-if="isLoading">
        <el-row :gutter="20">
          <el-col :xs="24" :md="10" :lg="8">
            <el-card shadow="never">
              <el-skeleton :rows="5" animated />
            </el-card>
          </el-col>
          <el-col :xs="24" :md="14" :lg="16">
            <el-card shadow="never">
              <el-skeleton :rows="8" animated />
            </el-card>
          </el-col>
        </el-row>
      </div>

      <el-row :gutter="20" v-if="!isLoading && project">
        <el-col :xs="24" :md="10" :lg="8" class="detail-col">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span
                  ><el-icon><User /></el-icon> 雇主資訊</span
                >
              </div>
            </template>
            <div v-if="project.employer.employer_profile" class="employer-info">
              <el-avatar
                :size="60"
                :src="project.employer.employer_profile.company_logo_url"
              />
              <h3 class="employer-name">
                {{ project.employer.employer_profile.company_name }}
              </h3>
              <p class="employer-email">{{ project.employer.email }}</p>
              <el-divider />
              <p class="employer-bio">
                {{
                  project.employer.employer_profile.company_bio ||
                  "尚未提供公司簡介"
                }}
              </p>
            </div>
            <div v-else>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="雇主名稱">
                  {{ project.employer.email }}
                </el-descriptions-item>
                <el-descriptions-item label="公司簡介">
                  尚未建立 Profile
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="14" :lg="16" class="detail-col">
          <el-card shadow="hover">
            <!-- 修正: 將 header 移至 el-card 的直接子層，並加上 v-if -->
            <template #header v-if="!isEditing">
              <h2>{{ project.title }}</h2>
            </template>

            <!-- 修正: 這個 template v-if 只包裹 el-descriptions -->
            <template v-if="!isEditing">
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
                  <div class="description-content">
                    {{ project.description }}
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </template>

            <template v-else>
              <el-form :model="editForm" label-position="top" ref="editFormRef">
                <el-form-item label="案件標題" prop="title" required>
                  <el-input v-model="editForm.title" />
                </el-form-item>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="最低預算" prop="budget_min">
                      <el-input-number
                        v-model="editForm.budget_min"
                        :min="0"
                        controls-position="right"
                        class="w-100"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="最高預算" prop="budget_max">
                      <el-input-number
                        v-model="editForm.budget_max"
                        :min="editForm.budget_min || 0"
                        controls-position="right"
                        class="w-100"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="地區" prop="location">
                      <el-input v-model="editForm.location" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="工作型態" prop="work_type">
                      <el-select v-model="editForm.work_type" class="w-100">
                        <el-option label="遠端" value="遠端" />
                        <el-option label="實體" value="實體" />
                        <el-option label="混合" value="混合" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="詳細需求內容" prop="description" required>
                  <el-input
                    type="textarea"
                    v-model="editForm.description"
                    rows="10"
                  />
                </el-form-item>

                <el-form-item label="所需技能 (暫不可編輯)">
                  <el-tag
                    v-for="skill in project.skills"
                    :key="skill.tag.tag_id"
                    type="info"
                    size="small"
                    class="skill-tag"
                  >
                    {{ skill.tag.name }}
                  </el-tag>
                </el-form-item>
              </el-form>
            </template>

            <div
              class="action-buttons"
              v-if="authStore.userRole === '自由工作者'"
            >
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
        </el-col>
      </el-row>

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
import { ref, onMounted, computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/authStore.js";
import { ElMessage, ElUpload } from "element-plus";
import { getProjectById } from "@/api/project.js";
import { submitProposal, getMyProposals } from "@/api/proposal.js";
import dayjs from "dayjs";
// (修改) 匯入 Icon
import { Pointer, Select, User, Edit } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(true);
const project = ref(null);
const projectId = route.params.projectId;

// M6 提案相關狀態 (不變)
const hasProposed = ref(false);
const dialogVisible = ref(false);
const isSubmitting = ref(false);
const uploadRef = ref(null);
const proposalForm = reactive({
  briefDescription: "",
  attachmentFile: [],
});

// (新增) 需求二：計算是否為擁有者
const isOwner = computed(() => {
  return (
    project.value &&
    authStore.user &&
    project.value.employer.user_id === authStore.user.user_id
  );
});
// (新增結束)

onMounted(async () => {
  if (!projectId) {
    ElMessage.error("無效的案件 ID");
    isLoading.value = false;
    return;
  }
  try {
    const res = await getProjectById(projectId);
    project.value = res.data;

    if (authStore.userRole === "自由工作者") {
      await checkIfProposed();
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入案件詳情失敗");
  }
  isLoading.value = false;
});

// (新增) 需求二：跳轉到編輯頁面
const goToEditPage = () => {
  router.push(`/projects/${projectId}/edit`);
};

// M6 檢查是否已提案 (不變)
const checkIfProposed = async () => {
  try {
    const res = await getMyProposals();
    hasProposed.value = res.data.some((p) => p.project_id === projectId);
  } catch (err) {
    console.error("檢查提案狀態失敗:", err);
  }
};

// M6 判斷是否能提案 (不變)
const canPropose = computed(() => {
  if (!project.value) {
    return false;
  }
  return (
    authStore.userRole === "自由工作者" &&
    project.value.status === "招募中" &&
    !hasProposed.value
  );
});

// M6 提交提案 (不變)
const handleSubmitProposal = async () => {
  if (!proposalForm.briefDescription) {
    ElMessage.warning("請填寫提案簡述");
    return;
  }
  isSubmitting.value = true;
  try {
    const file = proposalForm.attachmentFile.length
      ? proposalForm.attachmentFile[0].raw
      : null;
    await submitProposal(projectId, proposalForm.briefDescription, file);
    ElMessage.success("提案提交成功！");
    dialogVisible.value = false;
    hasProposed.value = true;
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

// 返回上一頁 (不變)
const goBack = () => {
  router.back();
};

// 格式化日期 (不變)
const formatDate = (dateString) => {
  if (!dateString) return "未指定";
  return dayjs(dateString).format("YYYY-MM-DD HH:mm");
};

// 狀態標籤顏色 (不變)
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
/* (新增) 編輯按鈕樣式 */
:deep(.el-page-header__extra) {
  margin: 0;
}
.page-header-extra {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* (不變) 確保 Col 底部有間距 (在手機上) */
.detail-col {
  margin-bottom: 20px;
}

/* (不變) 雇主卡片樣式 */
.card-header {
  display: flex;
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
  .employer-bio {
    font-size: 14px;
    color: #606266;
    text-align: left;
    white-space: pre-wrap;
    min-height: 50px;
  }
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
</style>
