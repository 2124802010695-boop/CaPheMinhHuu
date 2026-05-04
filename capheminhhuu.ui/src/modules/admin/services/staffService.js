import axios from "../../../common/utils/axiosCustomize";

// =============================================
// STAFF SERVICE — Map đầy đủ StaffController
// Yêu cầu token Admin (Backend: [Authorize(Roles = "Admin")])
// =============================================

// GET: api/Staff — Lấy tất cả nhân viên (Cashier + Kitchen)
const getAllStaffAPI = () => {
    return axios.get("/Staff");
};

// POST: api/Staff/create — Tạo nhân viên mới
// Body: { username, password, fullName, phone, email?, role, salary, salaryCoefficient }
const createStaffAPI = (data) => {
    return axios.post("/Staff/create", data);
};

// PUT: api/Staff/{id} — Cập nhật thông tin nhân viên
// Body: { fullName, phone, email?, role, salary, salaryCoefficient }
const updateStaffAPI = (id, data) => {
    return axios.put(`/Staff/${id}`, data);
};

// PATCH: api/Staff/{id}/toggle-active — Kích hoạt / Vô hiệu hóa nhân viên
const toggleStaffActiveAPI = (id) => {
    return axios.patch(`/Staff/${id}/toggle-active`);
};

// POST: api/Staff/{id}/reset-password — Reset mật khẩu về Username
const resetStaffPasswordAPI = (id) => {
    return axios.post(`/Staff/${id}/reset-password`);
};

export {
    getAllStaffAPI,
    createStaffAPI,
    updateStaffAPI,
    toggleStaffActiveAPI,
    resetStaffPasswordAPI
};
