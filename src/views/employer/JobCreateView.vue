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
  padding: 20px; /* 給整個 view 一點 padding */
}

h2 {
  margin: 0; /* 移除 Card header 的預設 margin */
  font-size: 1.2rem;
  font-weight: 600;
}

.el-card {
  height: 100%; /* 讓左右卡片等高 */
}

.skills-checkbox-group {
  width: 100%;
}

.skill-checkbox {
  margin: 5px !important; /* !important 覆蓋 Element Plus 預設 */
}
</style>
