// src/api/recommendation.js (新檔案)
import http from "./http.js";

/**
 * (工作者) 獲取推薦案件列表
 * @returns {Promise}
 */
export const getJobRecommendations = (limit = 10, offset = 0) => {
  return http.get("/recommendations/jobs", {
    params: { limit, offset },
  });
};

/**
 * (雇主) 獲取推薦工作者列表
 * @returns {Promise}
 */
export const getFreelancerRecommendations = (limit = 10, offset = 0) => {
  return http.get("/recommendations/freelancers", {
    params: { limit, offset },
  });
};
