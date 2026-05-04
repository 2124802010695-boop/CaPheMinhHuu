import axios from "../utils/axiosCustomize";

// =====================================================
// AUTH SERVICE — Unified auth APIs (dùng axiosCustomize)
// =====================================================

// POST: api/Auth/login (Legacy / generic login)
const loginAPI = (username, password) => {
    return axios.post("/Auth/login", { username, password });
};

// POST: api/Auth/refresh-token — Refresh access token khi hết hạn
const refreshTokenAPI = (refreshToken) => {
    return axios.post("/Auth/refresh-token", { refreshToken });
};

// POST: api/Auth/revoke-token — Logout (thu hồi refresh token)
const revokeTokenAPI = (refreshToken) => {
    return axios.post("/Auth/revoke-token", { refreshToken });
};

// POST: api/Auth/change-password — Đổi mật khẩu
const changePasswordAPI = (staffCode, oldPassword, newPassword) => {
    return axios.post("/Auth/change-password", {
        staffCode,
        oldPassword,
        newPassword
    });
};

// GET: api/Auth/check-token — Kiểm tra token hợp lệ
const checkTokenAPI = () => {
    return axios.get("/Auth/check-token");
};

export {
    loginAPI,
    refreshTokenAPI,
    revokeTokenAPI,
    changePasswordAPI,
    checkTokenAPI
};
// === ADMIN AUTH ===
export const adminLoginAPI = async (username, password) => {
    return axios.post('/Auth/admin/login', {
        username,
        password,
        rememberMe: true
    });
};
// === STAFF AUTH ===
export const staffLoginAPI = async (staffCode, password) => {
    return axios.post('/Auth/staff/login', {
        staffCode,
        password,
        rememberMe: true
    });
};