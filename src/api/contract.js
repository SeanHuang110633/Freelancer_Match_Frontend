import http from "./http.js"; // 匯入我們配置好的 Axios 實例

/**
 * (M7.1) 接受提案後，建立合約草案
 * 呼叫: POST /contracts
 *
 * @param {string} proposalId
 * @returns {Promise<ContractOut>}
 */
export const createContract = (proposalId) => {
  // 後端 ContractCreate Schema 期望 { proposal_id: "..." }
  const data = { proposal_id: proposalId };
  return http.post("/contracts/", data);
};

/**
 * (M7.2) 獲取我的合約列表 (雇主或工作者)
 * 呼叫: GET /contracts/my
 *
 * @returns {Promise<List[ContractOut]>}
 */
export const getMyContracts = () => {
  return http.get("/contracts/my");
};

/**
 * (M7.2) 檢視合約詳情
 * 呼叫: GET /contracts/{contractId}
 *
 * @param {string} contractId
 * @returns {Promise<ContractOut>}
 */
export const getContractById = (contractId) => {
  return http.get(`/contracts/${contractId}`);
};

/**
 * (M7.3) 雇主更新合約草案 (協商中)
 * 呼叫: PUT /contracts/{contractId}
 *
 * @param {string} contractId
 * @param {object} updateData (符合 ContractUpdate schema, e.g., { title, content, amount })
 * @returns {Promise<ContractOut>}
 */
export const updateContractDetails = (contractId, updateData) => {
  return http.put(`/contracts/${contractId}`, updateData);
};

/**
 * (M7.4 / M7.5) 狀態流轉 (簽訂、驗收、終止)
 * Kêu gọi: PATCH /contracts/{contractId}/status
 *
 * @param {string} contractId
 * @param {string} newStatus (e.g., "已簽訂", "已完成", "終止")
 * @returns {Promise<ContractOut>}
 */
export const updateContractStatus = (contractId, newStatus) => {
  // 後端 ContractStatusUpdate Schema 期望 { status: "..." }
  const data = { status: newStatus };
  return http.patch(`/contracts/${contractId}/status`, data);
};

/**
 * (M7.3) 雇主撤銷合約草案 (協商中)
 * 呼叫: DELETE /contracts/{contractId}
 *
 * @param {string} contractId
 * @returns {Promise} (204 No Content)
 */
export const deleteContract = (contractId) => {
  return http.delete(`/contracts/${contractId}`);
};
