// src/store/proposalStore.js

import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getProposalsForProject,
  updateProposalStatus,
} from "@/api/proposal.js";

export const useProposalStore = defineStore("proposal", () => {
  // State: 儲存目前檢視的案件提案列表
  const proposals = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Action: (雇主) 獲取特定案件的所有提案
  async function fetchProposals(projectId) {
    isLoading.value = true;
    error.value = null;
    proposals.value = [];
    try {
      const response = await getProposalsForProject(projectId);
      proposals.value = response.data.proposals;
    } catch (err) {
      error.value = err.response?.data?.detail || "載入提案失敗";
    } finally {
      isLoading.value = false;
    }
  }

  // Action: (雇主) 更新提案狀態
  async function updateStatus(proposalId, status) {
    try {
      const response = await updateProposalStatus(proposalId, status);
      // 更新成功後，更新本地列表中的該筆資料
      const index = proposals.value.findIndex(
        (p) => p.proposal_id === proposalId
      );
      if (index !== -1) {
        proposals.value[index] = response.data;
      }
      return true;
    } catch (err) {
      error.value = err.response?.data?.detail || "更新狀態失敗";
      return false;
    }
  }

  return {
    proposals,
    isLoading,
    error,
    fetchProposals,
    updateStatus,
  };
});
