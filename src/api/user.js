// src/api/user.js
import http from "./http.js";

/**
 * 獲取當前登入者的資料 (Email, Role, ID)
 */
export const getMe = () => {
  // (注意) http 實例需要攔截器自動帶 Token
  return http.get("/users/me");
};
