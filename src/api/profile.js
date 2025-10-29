// src/api/profile.js
import http from "./http.js";

// 獲取我的 Profile
export const getMyProfile = () => {
  return http.get("/profiles/me");
};

// 建立我的 Profile (data 必須符合後端 schema)
export const createMyProfile = (data) => {
  // 後端用 Union，前端必須傳送正確的 body
  // e.g., data = { "full_name": "Test", "bio": "..." } (工作者)
  // e.g., data = { "company_name": "Test Inc" } (雇主)
  return http.post("/profiles/me", data);
};

// (僅限工作者) 更新技能
export const updateMySkills = (skill_tag_ids) => {
  const data = { skill_tag_ids: skill_tag_ids }; // e.g., ["uuid1", "uuid2"]
  return http.put("/profiles/freelancer/skills", data);
};

/**
 * 更新 Profile (基本資料/設定)
 * @param {object} data (符合 FreelancerProfileUpdate / EmployerProfileUpdate)
 * @returns {Promise}
 */
export const updateMyProfile = (data) => {
  // (修改) 替換為真實 API
  return http.put("/profiles/me", data);
};

/**
 * (新增) 獲取指定 User ID 的工作者 Profile
 * @param {string} userId
 * @returns {Promise}
 */
export const getFreelancerProfileByUserId = (userId) => {
  return http.get(`/profiles/freelancer/${userId}`);
};
