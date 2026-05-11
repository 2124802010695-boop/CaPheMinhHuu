import axios from '../../../common/utils/axiosCustomize';

// GET: api/Salary?month=5&year=2026 — Bảng lương toàn bộ nhân viên
export const getMonthlySalaryAPI = (month, year) =>
    axios.get('/Salary', { params: { month, year } });

// GET: api/Salary/{userId}?month=5&year=2026 — Lương 1 nhân viên
export const getStaffSalaryAPI = (userId, month, year) =>
    axios.get(`/Salary/${userId}`, { params: { month, year } });
