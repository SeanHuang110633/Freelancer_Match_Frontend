<template>
  <div class="job-create-view">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="14">
        <el-card shadow="hover">
          <template #header>
            <h2>案件基本資料</h2>
          </template>
          <el-form
            ref="formRef"
            :model="form"
            label-position="top"
            @submit.prevent="handleCreateProject"
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
                :loading="isLoading"
              >
                {{ isLoading ? "刊登中..." : "確認刊登" }}
              </el-button>
              <el-button @click="resetForm">重設表單</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="10">
        <el-card shadow="hover">
          <template #header>
            <h2>所需技能</h2>
          </template>
          <el-form-item
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
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// ... (script setup 內容保持不變) ...
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getAllTags } from "@/api/tags.js";
import { createProject } from "@/api/project.js";

const router = useRouter();
const allTags = ref([]);
const isLoading = ref(false);
const formRef = ref(null);

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

const resetForm = () => {
  Object.assign(form, {
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
};

onMounted(async () => {
  try {
    const tagsRes = await getAllTags();
    allTags.value = tagsRes.data;
  } catch (err) {
    ElMessage.error("無法載入技能標籤");
  }
});

const handleCreateProject = async () => {
  isLoading.value = true;
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
    const res = await createProject(projectData);
    ElMessage.success(`案件 "${res.data.title}" 建立成功！`);
    resetForm();
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "案件建立失敗");
  }
  isLoading.value = false;
};
</script>

<style lang="scss" scoped>
.job-create-view {
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
  /* (Checkbox 將自動繼承 --el-color-primary) */
}
</style>
