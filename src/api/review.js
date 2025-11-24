// src/api/review.js
import http from "./http.js";

/**
 * (M9.1) 提交評價
 * 呼叫: POST /reviews
 * @param {object} reviewData
 * - contract_id
 * - comment
 * - 評分欄位 (依角色不同，傳入 _fw 或 _we 系列欄位)
 */
export const createReview = (reviewData) => {
  return http.post("/reviews/", reviewData);
};

/**
 * (M9.2) 獲取合約的評價列表
 * 呼叫: GET /reviews/contract/{contractId}
 */
export const getContractReviews = (contractId) => {
  return http.get(`/reviews/contract/${contractId}`);
};
