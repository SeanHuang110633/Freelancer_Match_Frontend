<template>
  <div class="freelancer-search-view">
    <el-card shadow="never" class="filter-card">
      <template #header>
        <h2 style="margin: 0px">Search Freelancers</h2>
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
// (Script 保持不變)
import { ref, onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import { getAllTags } from "@/api/tags.js";
import { searchFreelancers } from "@/api/profile.js";
import { Search } from "@element-plus/icons-vue";
import FreelancerCard from "@/components/FreelancerCard.vue";

const allTags = ref([]);
const profiles = ref([]);
const isLoading = ref(false);

const filters = reactive({
  tag_id: [],
});

onMounted(async () => {
  isLoading.value = true;
  try {
    const tagsRes = await getAllTags();
    allTags.value = tagsRes.data;
  } catch (err) {
    ElMessage.error("Failed to load skills list");
  }
  await handleSearch();
  isLoading.value = false;
});

const handleSearch = async () => {
  isLoading.value = true;
  try {
    const res = await searchFreelancers(filters.tag_id);
    profiles.value = res.data;
    console.log("Search results:", profiles.value);
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "Search failed");
  }
  isLoading.value = false;
};
</script>

<style lang="scss" scoped>
/* (!! 📍 關鍵修改 📍 !!) */
/* * 1. 根選擇器改為 .freelancer-search-view
 * 2. 完整複製 HomeView.vue 的調色盤 (Palette) 與 Element Plus 覆蓋 (Overrides)
 */
.freelancer-search-view {
  // --- 1. Define New Palette (From HomeView) ---
  --app-bg-color: rgba(250, 247, 239, 0.973); // Soft beige
  --app-text-color: #616130;
  --app-text-color-secondary: #8a8a69;
  --app-hover-border-color: #dcd8c8;
  --app-hover-bg-color: rgba(252, 250, 248, 1); // More opaque
  --app-accent-color: #817c5b; // Muted olive-brown
  --app-warning-color: #c6a870; // Muted gold
  --app-danger-color: #b56f6f; // Brownish-red
  --app-info-bg-color: rgba(220, 216, 200, 0.3); // Muted beige bg for tags

  // --- 2. Override Element Plus Vars (From HomeView) ---
  --el-text-color-primary: var(--app-text-color);
  --el-text-color-regular: var(--app-text-color);
  --el-text-color-secondary: var(--app-text-color-secondary);
  --el-text-color-placeholder: #a2a287;

  --el-bg-color: var(--app-bg-color);
  --el-bg-color-overlay: var(--app-hover-bg-color);
  --el-fill-color-light: var(--app-hover-bg-color);
  --el-fill-color-blank: transparent; // Make backgrounds transparent

  --el-card-bg-color: var(--app-bg-color);
  --el-card-border-color: transparent;

  --el-border-color: var(--app-hover-border-color);
  --el-border-color-lighter: rgba(220, 216, 200, 0.5);
  --el-border-color-light: var(--app-hover-border-color);

  // (!! 📍 Button 顏色將來自這裡 !!)
  --el-color-primary: var(--app-accent-color);
  --el-color-primary-light-9: var(--app-info-bg-color);

  --el-color-warning: var(--app-warning-color);
  --el-color-warning-light-9: var(--app-info-bg-color);

  --el-color-info: var(--app-text-color-secondary);
  --el-color-info-light-9: var(--app-info-bg-color);

  --el-color-danger: var(--app-danger-color);
  --el-color-danger-light-9: rgba(181, 111, 111, 0.1);

  // --- 3. Apply Base Styles (From HomeView) ---
  padding: 20px;
  color: var(--app-text-color);

  // (!! 📍 額外調整 📍 !!)
  // 確保最小高度以顯示背景色
  min-height: calc(100vh - 60px);
}

/* (!! 📍 關鍵修改 📍 !!) */
/* * 移除舊的 :deep() 區塊
 * 現在所有顏色都由 .freelancer-search-view 區塊中的 CSS 變數控制
 */

.filter-card {
  margin-bottom: 20px;
  /* (套用) 柔和背景 */
  background-color: var(--app-bg-color);
  border: 1px solid var(--app-hover-border-color); // 使用 HomeView 的邊框色

  .filter-form {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  /* * "Search" 按鈕 (el-button type="primary") 
   * 將自動繼承 --el-color-primary 
   * (也就是 var(--app-accent-color) -> #817c5b)
   */
}

.results-area {
  margin-top: 20px;
  h3 {
    margin-bottom: 20px;
    color: var(--app-text-color-primary);
  }
}

.freelancer-col {
  margin-bottom: 20px;
}
</style>
