import http from "./http.js";

/**
 * 登入 API
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
export const login = (email, password) => {
  // (重要) 後端 OAuth2PasswordRequestForm 需要 form-data 格式
  const params = new URLSearchParams();
  params.append("username", email); // 對應 form_data.username
  params.append("password", password); // 對應 form_data.password

  return http.post("/auth/token", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

/**
 * (新增) 註冊 API
 * @param {object} userData { email, password, role }
 * @returns {Promise}
 */
export const register = (userData) => {
  // 後端 /auth/register 接收 JSON body
  return http.post("/auth/register", userData);
};
