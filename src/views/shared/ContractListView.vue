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
  padding: 20px;
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
