<template>
  <div class="freelancer-search-view">
    <el-card shadow="never" class="filter-card">
      <template #header>
        <h2>Search Freelancers</h2>
      </template>
      <el-form :model="filters" :inline="true" class="filter-form">
        <el-form-item label="Skills">
          <el-select
            v-model="filters.tag_id"
            multiple
            filterable
            placeholder="Select skills (multiple)"
            style="width: 360px"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.tag_id"
              :label="tag.name"
              :value="tag.tag_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="isLoading">
            <el-icon><Search /></el-icon> Search
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="results-area">
      <h3>Freelancer Results ({{ profiles.length }})</h3>

      <el-skeleton :rows="5" animated v-if="isLoading" />
      <el-empty
        description="No freelancers found matching your criteria"
        v-if="!isLoading && profiles.length === 0"
      />

      <el-row :gutter="20" v-if="!isLoading && profiles.length > 0">
        <el-col
          :xs="24"
          :sm="12"
          :md="8"
          v-for="profile in profiles"
          :key="profile.profile_id"
          class="freelancer-col"
        >
          <FreelancerCard :profile="profile" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import { getAllTags } from "@/api/tags.js";
// (修改) 匯入 profile API
import { searchFreelancers } from "@/api/profile.js";
import { Search } from "@element-plus/icons-vue";
// (修改) 匯入新卡片
import FreelancerCard from "@/components/FreelancerCard.vue";

const allTags = ref([]);
const profiles = ref([]); // (修改) projects -> profiles
const isLoading = ref(false);

const filters = reactive({
  tag_id: [],
  // (移除) location, work_type
});

onMounted(async () => {
  isLoading.value = true;
  try {
    const tagsRes = await getAllTags();
    allTags.value = tagsRes.data;
  } catch (err) {
    // (修改) i18n
    ElMessage.error("Failed to load skills list");
  }
  // (修改) 預設載入所有
  await handleSearch();
  isLoading.value = false;
});

const handleSearch = async () => {
  isLoading.value = true;
  try {
    // (修改) 呼叫新 API，只傳遞 tag_id
    const res = await searchFreelancers(filters.tag_id);
    profiles.value = res.data; // (修改)
  } catch (err) {
    // (修改) i18n
    ElMessage.error(err.response?.data?.detail || "Search failed");
  }
  isLoading.value = false;
};

// (移除) goToProjectDetail
</script>

<style lang="scss" scoped>
/* (套用) 柔和風格 */
.freelancer-search-view {
  padding: 20px;
  background-color: rgba(252, 250, 248, 0.8);
  min-height: calc(100vh - 60px);

  /* (套用) 顏色 */
  :deep() {
    --el-color-primary: #a79c7f;
    --el-color-primary-dark-2: #7d7561;
    --el-text-color-primary: #616130;
    --el-text-color-regular: #616130;
    --el-text-color-secondary: #7d7561;
    --el-text-color-placeholder: #a79c7f;
    --el-bg-color: #ffffff;
    --el-border-color: #e5e2d8;
    --el-border-color-lighter: #eceae3;
    --el-fill-color-lighter: #f6f5f1;
  }
}

.filter-card {
  margin-bottom: 20px;
  /* (套用) 柔和背景 */
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);

  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }
}

.results-area {
  margin-top: 20px;
  h3 {
    margin-bottom: 20px;
    color: var(--el-text-color-primary);
  }
}

.freelancer-col {
  margin-bottom: 20px;
}

/* (移除) .project-card 樣式 (已移至 FreelancerCard.vue) */
</style>
