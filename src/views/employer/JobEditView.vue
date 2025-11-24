<template>
  <div class="job-edit-view">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="14">
        <el-card shadow="hover">
          <template #header>
            <h2>編輯案件資料</h2>
          </template>

          <el-form
            v-if="!isLoading"
            ref="formRef"
            :model="form"
            label-position="top"
            @submit.prevent="handleUpdateProject"
          >
            <el-form-item label="案件標題 (必填)" prop="title">
              <el-input
                v-model="form.title"
                placeholder="請輸入案件標題"
                required
              />
            </el-form-item>

            <el-form-item label="需求內容 (必填)" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="詳細說明案件需求、背景、交付標準等..."
                required
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="地區" prop="location">
                  <el-input
                    v-model="form.location"
                    placeholder="e.g., 台北市 / 全區"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工作型態" prop="work_type">
                  <el-select
                    v-model="form.work_type"
                    placeholder="請選擇"
                    style="width: 100%"
                  >
                    <el-option label="遠端" value="遠端" />
                    <el-option label="實體" value="實體" />
                    <el-option label="混合" value="混合" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="預算 (Min)" prop="budget_min">
                  <el-input-number
                    v-model="form.budget_min"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="預算 (Max)" prop="budget_max">
                  <el-input-number
                    v-model="form.budget_max"
                    :min="form.budget_min || 0"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="需求人數" prop="required_people">
                  <el-input-number
                    v-model="form.required_people"
                    :min="1"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="提案截止日" prop="proposals_deadline">
                  <el-date-picker
                    v-model="form.proposals_deadline"
                    type="datetime"
                    placeholder="選擇日期時間"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="案件完成日" prop="completion_deadline">
                  <el-date-picker
                    v-model="form.completion_deadline"
                    type="datetime"
                    placeholder="選擇日期時間"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider />

            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="isSubmitting"
              >
                {{ isSubmitting ? "儲存中..." : "儲存變更" }}
              </el-button>
              <el-button @click="goBack">取消</el-button>
            </el-form-item>
          </el-form>

          <el-skeleton v-if="isLoading" :rows="10" animated />
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="10">
        <el-card shadow="hover">
          <template #header>
            <h2>所需技能</h2>
          </template>
          <el-form-item
            v-if="!isLoading"
            label="請勾選案件所需的技能 (可多選)"
            label-position="top"
          >
            <el-checkbox-group
              v-model="form.skill_tag_ids"
              class="skills-checkbox-group"
            >
              <el-checkbox
                v-for="tag in allTags"
                :key="tag.tag_id"
                :label="tag.tag_id"
                border
                class="skill-checkbox"
              >
                {{ tag.name }} ({{ tag.category }})
              </el-checkbox>
            </el-checkbox-group>
            <div v-if="allTags.length === 0">技能列表載入中...</div>
          </el-form-item>

          <el-skeleton v-if="isLoading" :rows="5" animated />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// (修改) 匯入
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { getAllTags } from "@/api/tags.js";
// (修改) 匯入 getProjectById 和 updateProject
import { getProjectById, updateProject } from "@/api/project.js";

const router = useRouter();
const route = useRoute(); // (新增) 獲取路由參數
const projectId = route.params.projectId; // (新增) 拿到 projectId

const allTags = ref([]);
const isLoading = ref(true); // (修改) 預設為 true，因為要載入資料
const isSubmitting = ref(false); // (新增) 提交狀態
const formRef = ref(null);

// (不變) 表單結構
const form = reactive({
  title: "",
  description: "",
  location: "",
  work_type: "遠端",
  budget_min: null,
  budget_max: null,
  proposals_deadline: null,
  completion_deadline: null,
  required_people: 1,
  skill_tag_ids: [],
});

// (修改) 載入邏輯
onMounted(async () => {
  if (!projectId) {
    ElMessage.error("無效的案件 ID");
    router.push("/my-jobs");
    return;
  }

  isLoading.value = true;
  try {
    // 併發請求
    const [tagsRes, projectRes] = await Promise.all([
      getAllTags(),
      getProjectById(projectId),
    ]);

    // 1. 填入標籤
    allTags.value = tagsRes.data;

    // 2. 填入表單
    const project = projectRes.data;
    form.title = project.title;
    form.description = project.description;
    form.location = project.location;
    form.work_type = project.work_type;
    form.budget_min = project.budget_min;
    form.budget_max = project.budget_max;
    form.proposals_deadline = project.proposals_deadline;
    form.completion_deadline = project.completion_deadline;
    form.required_people = project.required_people;
    // (重要) 轉換 skills 結構
    form.skill_tag_ids = project.skills.map((skill) => skill.tag.tag_id);
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入案件資料失敗");
    router.push("/my-jobs");
  }
  isLoading.value = false;
});

// (修改) 提交邏輯
const handleUpdateProject = async () => {
  isSubmitting.value = true;
  try {
    const projectData = {
      ...form,
      proposals_deadline: form.proposals_deadline
        ? new Date(form.proposals_deadline).toISOString()
        : null,
      completion_deadline: form.completion_deadline
        ? new Date(form.completion_deadline).toISOString()
        : null,
    };

    // (重要) 呼叫 updateProject
    const res = await updateProject(projectId, projectData);

    ElMessage.success(`案件 "${res.data.title}" 更新成功！`);
    // (修改) 成功後返回詳情頁
    router.push(`/projects/${projectId}`);
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "案件更新失敗");
  }
  isSubmitting.value = false;
};

// (新增) 取消按鈕
const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.job-edit-view {
  /* --- 1. 注入 HomeView 調色盤 --- */
  --app-bg-color: rgba(250, 247, 239, 0.973);
  --app-text-color: #616130;
  --app-text-color-secondary: #8a8a69;
  --app-hover-border-color: #dcd8c8;
  --app-hover-bg-color: rgba(252, 250, 248, 1);
  --app-accent-color: #817c5b;
  --app-warning-color: #c6a870;
  --app-danger-color: #b56f6f;
  --app-info-bg-color: rgba(220, 216, 200, 0.3);

  /* --- 2. 注入 Element Plus 覆蓋 --- */
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

  /* --- 3. 基礎樣式 --- */
  padding: 20px;
  color: var(--app-text-color);
  min-height: calc(100vh - 60px);
}

h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--app-text-color); /* 確保 h2 顏色正確 */
}

.el-card {
  height: 100%;
  border: 1px solid var(--app-hover-border-color); /* 增加邊框 */
}

.skills-checkbox-group {
  width: 100%;
}

.skill-checkbox {
  margin: 5px !important;
}
</style>
