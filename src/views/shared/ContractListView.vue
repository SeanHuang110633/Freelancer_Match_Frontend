<template>
  <div class="contract-list-view">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="text-large font-600 mr-3">我的合約</span>
      </template>
    </el-page-header>

    <div v-if="isLoading" class="loading-skeleton">
      <el-skeleton :rows="5" animated />
      <el-skeleton :rows="5" animated />
    </div>

    <div v-if="!isLoading && contracts.length > 0" class="contract-list">
      <el-card
        class="contract-card"
        shadow="hover"
        v-for="contract in contracts"
        :key="contract.contract_id"
        @click="goToContractDetail(contract.contract_id)"
      >
        <template #header>
          <div class="card-header">
            <span class="contract-title">{{ contract.title }}</span>
            <el-tag :type="statusTagType(contract.status)" size="small">
              {{ contract.status }}
            </el-tag>
          </div>
        </template>

        <div class="contract-body">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="身份">
              <el-tag size="small" :type="roleTagType(contract)">
                {{ roleText(contract) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="對象">
              {{ otherPartyName(contract) }}
            </el-descriptions-item>
            <el-descriptions-item label="金額">
              TWD {{ contract.amount.toLocaleString() }}
            </el-descriptions-item>
            <el-descriptions-item label="最後更新">
              {{ formatTime(contract.updated_at) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>

    <el-empty
      description="目前尚無任何合約"
      v-if="!isLoading && contracts.length === 0"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { getMyContracts } from "@/api/contract.js";
import { useAuthStore } from "@/store/authStore.js";

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(true);
const contracts = ref([]);
const currentUser = computed(() => authStore.user);

onMounted(async () => {
  isLoading.value = true;
  try {
    const res = await getMyContracts();
    contracts.value = res.data;
  } catch (err) {
    ElMessage.error(err.response?.data?.detail || "載入合約列表失敗");
  }
  isLoading.value = false;
});

const goBack = () => router.back();
const goToContractDetail = (contractId) => {
  router.push(`/contracts/${contractId}`);
};
const formatTime = (time) => {
  return time ? dayjs(time).format("YYYY-MM-DD HH:mm") : "N/A";
};
const roleText = (contract) => {
  if (currentUser.value?.user_id === contract.employer.user_id) {
    return "雇主 (甲方)";
  }
  if (currentUser.value?.user_id === contract.freelancer.user_id) {
    return "工作者 (乙方)";
  }
  return "N/A";
};
const roleTagType = (contract) => {
  if (currentUser.value?.user_id === contract.employer.user_id) {
    return "warning";
  }
  return "primary";
};
const otherPartyName = (contract) => {
  if (currentUser.value?.user_id === contract.employer.user_id) {
    return contract.freelancer.freelancer_profile?.full_name || "N/A";
  }
  return contract.employer.email;
};

// --- ( M7 狀態機重構 ) ---
// (修改) 更新狀態標籤以匹配新的狀態機
const statusTagType = (status) => {
  switch (status) {
    case "協商中":
      return "warning";
    case "進行中":
      return "primary"; // (修改) "已簽訂" 已合併至 "進行中"
    case "雇主請求修改":
    case "工作者請求修改":
    case "工作者要求驗收":
      return "warning"; // (新增) 所有請求狀態
    case "雇主請求終止":
    case "工作者請求終止":
      return "danger"; // (新增) 終止請求
    case "已完成":
      return "success";
    case "終止":
      return "info"; // (修改) 終止改為 info
    default:
      return "";
  }
};
// --- ( M7 修正結束 ) ---
</script>

<style lang="scss" scoped>
/* (Style 保持不變) */
.contract-list-view {
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
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
}
.loading-skeleton {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  .el-skeleton {
    margin-bottom: 20px;
  }
}
.contract-card {
  margin-bottom: 20px;
  cursor: pointer;
  border: 1px solid var(--el-border-color-light);
  &:hover {
    border-color: var(--el-color-primary);
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .contract-title {
    font-weight: bold;
    font-size: 1.1rem;
    color: var(--el-text-color-primary);
  }
  .contract-body {
    font-size: 14px;
    .el-descriptions-item__label {
      font-weight: bold;
    }
  }
}
</style>
