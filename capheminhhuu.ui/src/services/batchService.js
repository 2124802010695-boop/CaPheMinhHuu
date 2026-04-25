import axios from "../utils/axiosCustomize";

// API thêm lô hàng mới cho nguyên liệu đã có
const createBatchAPI = (ingredientId, data) => {
    return axios.post(`/Ingredient/${ingredientId}/batch`, data);
};

// API lấy tất cả lô hàng của nguyên liệu
const getBatchesByIngredientAPI = (ingredientId) => {
    return axios.get(`/Ingredient/${ingredientId}/batches`);
};

// API cập nhật lô hàng
const updateBatchAPI = (ingredientId, batchId, data) => {
    return axios.put(`/Ingredient/${ingredientId}/batch/${batchId}`, data);
};

// API xóa lô hàng
const deleteBatchAPI = (ingredientId, batchId) => {
    return axios.delete(`/Ingredient/${ingredientId}/batch/${batchId}`);
};

export {
    createBatchAPI,
    getBatchesByIngredientAPI,
    updateBatchAPI,
    deleteBatchAPI
};
