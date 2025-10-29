// src/api/recommendation.js (新檔案)
import http from "./http.js";

/**
 * (工作者) 獲取推薦案件列表
 * @returns {Promise}
 */
export const getJobRecommendations = () => {
  return http.get("/recommendations/jobs");
};

/**
 * (雇主) 獲取推薦工作者列表
 * @returns {Promise}
 */
export const getFreelancerRecommendations = () => {
  return http.get("/recommendations/freelancers");
};
