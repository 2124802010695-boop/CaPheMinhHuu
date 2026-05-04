import axios from '../../../common/utils/axiosCustomize';

// =============================================
// TABLE SERVICE — Map đầy đủ TableController
// =============================================

// GET: api/Table — Lấy tất cả bàn
const getTablesAPI = () => {
    return axios.get("/Table");
};

// GET: api/Table/{id} — Lấy chi tiết 1 bàn
const getTableByIdAPI = (id) => {
    return axios.get(`/Table/${id}`);
};

// GET: api/Table/{id}/qr — Lấy thông tin QR Code của bàn
const getTableQRCodeAPI = (id) => {
    return axios.get(`/Table/${id}/qr`);
};

// POST: api/Table — Tạo bàn mới
// Body: { number, seats, areaId? }
const createTableAPI = (data) => {
    return axios.post("/Table", data);
};

// PUT: api/Table/{id} — Cập nhật bàn
// Body: { number, seats, status, areaId? }
const updateTableAPI = (id, data) => {
    return axios.put(`/Table/${id}`, data);
};

// DELETE: api/Table/{id} — Xóa bàn
const deleteTableAPI = (id) => {
    return axios.delete(`/Table/${id}`);
};
// PATCH: api/Table/{id}/status — Cashier đổi trạng thái bàn (Empty/Occupied/Reserved)
const updateTableStatusAPI = (id, status) => {
    return axios.patch(`/Table/${id}/status`, JSON.stringify(status), {
        headers: { "Content-Type": "application/json" }
    });
};

export {
    getTablesAPI,
    getTableByIdAPI,
    getTableQRCodeAPI,
    createTableAPI,
    updateTableAPI,
    updateTableStatusAPI,
    deleteTableAPI
};
