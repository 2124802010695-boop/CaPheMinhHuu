import axios from '../utils/axiosCustomize';

// =============================================
// SHIFT SERVICE — Map đầy đủ ShiftController
// =============================================

// ===================== CASHIER =====================

// POST: api/Shift/request-open — Yêu cầu mở ca (Cashier)
export const requestOpenShift = (openingCash) =>
    axios.post('/Shift/request-open', { openingCash });

// GET: api/Shift/current — Lấy ca hiện tại (Cashier)
export const getCurrentShift = () =>
    axios.get('/Shift/current');

// POST: api/Shift/close/{shiftId} — Đóng ca (Cashier)
export const closeShift = (shiftId, closingCash) =>
    axios.post(`/Shift/close/${shiftId}`, { closingCash });

// GET: api/Shift/z-report/{shiftId} — Xem Z-Report (Cashier)
export const getZReport = (shiftId) =>
    axios.get(`/Shift/z-report/${shiftId}`);

// ===================== ADMIN =====================

// GET: api/Shift/admin/pending — Lấy danh sách ca chờ duyệt
export const getPendingShiftsAPI = () =>
    axios.get('/Shift/admin/pending');

// POST: api/Shift/admin/approve/{shiftId} — Duyệt ca
export const approveShiftAPI = (shiftId) =>
    axios.post(`/Shift/admin/approve/${shiftId}`);

// POST: api/Shift/admin/reject/{shiftId} — Từ chối ca
// Body: { reason: "..." }
export const rejectShiftAPI = (shiftId, reason) =>
    axios.post(`/Shift/admin/reject/${shiftId}`, { reason });

// GET: api/Shift/admin/all — Lấy tất cả ca (Admin)
// Query: ?status=Open|Closed|PendingApproval (optional)
export const getAllShiftsAPI = (status) =>
    axios.get('/Shift/admin/all', { params: status ? { status } : {} });

// GET: api/Shift/admin/z-report/{shiftId} — Admin xem Z-Report
export const adminGetZReportAPI = (shiftId) =>
    axios.get(`/Shift/admin/z-report/${shiftId}`);

// ===================== ALIASES =====================
// Cashier pages dùng tên có hậu tố "API" → alias cho tương thích
export const requestOpenShiftAPI = requestOpenShift;
export const getCurrentShiftAPI = getCurrentShift;
export const closeShiftAPI = closeShift;
export const getZReportAPI = getZReport;