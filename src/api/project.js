import http from "./http.js";

/**
 * (雇主) 刊登新案件
 * @param {object} projectData - 符合 ProjectCreate schema 的物件
 * e.g., { title: "...", description: "...", skill_tag_ids: ["uuid1"] }
 * @returns {Promise}
 */
export const createProject = (projectData) => {
  return http.post("/projects/", projectData);
};

/**
 * (工作者) 搜尋/篩選案件
 * @param {object} filterParams - 篩選條件
 * e.g., { tag_id: ["uuid1", "uuid2"], location: "台北", work_type: "遠端" }
 * @returns {Promise}
 */
export const getProjects = (filterParams = {}) => {
  // (重要) 處理 Query Parameters
  // axios 會自動將 params 物件轉換為 ?key=value
  // 針對 tag_id 這種多選陣列，axios 會將其序列化為 ?tag_id=uuid1&tag_id=uuid2

  const params = {};

  if (filterParams.tag_id && filterParams.tag_id.length > 0) {
    params.tag_id = filterParams.tag_id;
  }
  if (filterParams.location) {
    params.location = filterParams.location;
  }
  if (filterParams.work_type) {
    params.work_type = filterParams.work_type;
  }

  return http.get("/projects/", { params });
};

/**
 * 獲取單一案件詳情
 * @param {string} projectId
 * @returns {Promise}
 */
export const getProjectById = (projectId) => {
  return http.get(`/projects/${projectId}`);
};

/**
 * (新增) (雇主) 獲取自己刊登的所有案件
 * @returns {Promise}
 */
export const getMyProjects = () => {
  return http.get("/projects/my");
};
