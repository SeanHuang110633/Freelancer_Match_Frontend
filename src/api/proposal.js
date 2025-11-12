// src/api/proposal.js

import http from "./http.js";

/**
 * (工作者) 提交提案 (Use Case 6.1)
 *
 * 呼叫： POST /projects/{project_id}/proposals
 * (注意：由於包含檔案上傳，我們必須使用 FormData)
 *
 * @param {string} projectId 案件 ID
 * @param {string} briefDescription 提案簡述
 * @param {File | null} attachmentFile 附件 (PDF 檔案)
 * @returns {Promise}
 */
export const submitProposal = (projectId, briefDescription, attachmentFile) => {
  // 1. 建立 FormData 物件
  const formData = new FormData();

  // 2. 附加表單欄位 (對應 router 中的 Form(...))
  formData.append("brief_description", briefDescription);

  // 3. 附加檔案 (對應 router 中的 File(...))
  if (attachmentFile) {
    formData.append("attachment", attachmentFile);
  }

  // 4. 發送請求
  // (重要) 當 Axios 看到 FormData 時，它會自動設定
  // 'Content-Type': 'multipart/form-data'，我們無需手動設定。
  return http.post(`/projects/${projectId}/proposals`, formData);
};

/**
 * (工作者) 撤回提案 (Use Case 6.2)
 *
 * 呼叫： DELETE /proposals/{proposal_id}
 *
 * @param {string} proposalId 提案 ID
 * @returns {Promise}
 */
export const withdrawProposal = (proposalId) => {
  return http.delete(`/proposals/${proposalId}`);
};

/**
 * (雇主) 檢視特定案件的所有提案 (Use Case 6.3)
 *
 * 呼叫： GET /projects/{project_id}/proposals
 *
 * @param {string} projectId 案件 ID
 * @returns {Promise<List[ProposalOutWithFreelancer]>}
 */
export const getProposalsForProject = (projectId) => {
  return http.get(`/projects/${projectId}/proposals`);
};

/**
 * (工作者) 檢視自己提交的所有提案
 *
 * 呼叫： GET /proposals/my
 *
 * @returns {Promise<List[ProposalOut]>}
 */
export const getMyProposals = () => {
  return http.get("/proposals/my");
};

/**
 * (雇主) 選擇或拒絕人選 (Use Case 6.3, 6.5)
 *
 * 呼叫： PATCH /proposals/{proposal_id}/status
 *
 * @param {string} proposalId 提案 ID
 * @param {string} status "已接受" 或 "已拒絕"
 * @returns {Promise<ProposalOut>}
 */
export const updateProposalStatus = (proposalId, status) => {
  // 後端 router (Step 3) 期望的 Body 格式為： { "status": "..." }
  return http.patch(`/proposals/${proposalId}/status`, { status });
};

/**
 * (新增) (工作者) 獲取單一提案詳情
 *
 * 呼叫： GET /proposals/{proposal_id}
 *
 * @param {string} proposalId 提案 ID
 * @returns {Promise<ProposalOutWithFullProject>}
 */
export const getProposalDetails = (proposalId) => {
  return http.get(`/proposals/${proposalId}`);
};

/**
 * (新增) (工作者) 更新提案
 *
 * 呼叫： PUT /proposals/{proposal_id}
 *
 * @param {string} proposalId 提案 ID
 * @param {string} briefDescription 提案簡述
 * @param {File | null} attachmentFile 附件 (PDF 檔案)
 * @returns {Promise<ProposalOut>}
 */
export const updateProposal = (
  proposalId,
  briefDescription,
  attachmentFile
) => {
  // 1. 建立 FormData 物件
  const formData = new FormData();

  // 2. 附加表單欄位
  formData.append("brief_description", briefDescription);

  // 3. 附加檔案
  if (attachmentFile) {
    formData.append("attachment", attachmentFile);
  }

  // 4. 發送 PUT 請求
  return http.put(`/proposals/${proposalId}`, formData, {
    // (重要) 確保 Content-Type 是 multipart/form-data
    // (Axios 看到 FormData 通常會自動設定)
  });
};
