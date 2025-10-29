// src/api/tags.js
import http from "./http.js";

// 獲取所有技能標籤
export const getAllTags = () => {
  return http.get("/tags/");
};
