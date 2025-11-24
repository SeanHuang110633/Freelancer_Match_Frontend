// src/api/deliverable.js

import http from "./http.js";

/**
 * (M7.5) 上傳交付物
 * * 呼叫: POST /contracts/{contractId}/deliverables
 * * @param {string} contractId
 * @param {File} file 交付檔案
 * @param {string} description 交付說明
 * @returns {Promise}
 */
export const uploadDeliverable = (contractId, file, description) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", description);

  return http.post(`/contracts/${contractId}/deliverables`, formData);
};

/**
 * (M7.5) 獲取合約的交付物列表
 * * 呼叫: GET /contracts/{contractId}/deliverables
 * * @param {string} contractId
 * @returns {Promise<List[DeliverableOut]>}
 */
export const getDeliverables = (contractId) => {
  return http.get(`/contracts/${contractId}/deliverables`);
};

/**
 * (M7.5) 更新/重新上傳交付物
 * * 呼叫: PUT /deliverables/{deliverableId}
 * * @param {string} deliverableId
 * @param {File|null} file 新檔案 (若不更新請傳 null/undefined)
 * @param {string|null} description 新說明 (若不更新請傳 null/undefined)
 * @returns {Promise}
 */
export const updateDeliverable = (deliverableId, file, description) => {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }
  if (description) {
    formData.append("description", description);
  }

  return http.put(`/deliverables/${deliverableId}`, formData);
};

/**
 * (M7.5) 撤回/刪除交付物
 * * 呼叫: DELETE /deliverables/{deliverableId}
 * * @param {string} deliverableId
 * @returns {Promise}
 */
export const deleteDeliverable = (deliverableId) => {
  return http.delete(`/deliverables/${deliverableId}`);
};
