import axios from "../../../common/utils/axiosCustomize";

// 1. API tạo nguyên liệu mới
const createIngredientAPI = (data) => {
    return axios.post("/Ingredient", data);
};

// 2. API lấy tất cả nguyên liệu (Cho bảng QuanLyKho)
const getIngredientsAPI = () => {
    return axios.get("/Ingredient");
};

// 3. API lấy 1 nguyên liệu theo ID
const getIngredientByIdAPI = (id) => {
    return axios.get(`/Ingredient/${id}`);
};

// 4. API cập nhật nguyên liệu
const updateIngredientAPI = (id, data) => {
    return axios.put(`/Ingredient/${id}`, data);
};

// 5. API xóa nguyên liệu
const deleteIngredientAPI = (id) => {
    return axios.delete(`/Ingredient/${id}`);
};

const generateSkuAPI = (name) => axios.post('/Ingredient/generate-sku', { name });

// 7. API thêm đơn vị quy đổi
const addUnitAPI = (ingredientId, data) =>
    axios.post(`/Ingredient/${ingredientId}/units`, data);

// 8. API xóa đơn vị quy đổi
const deleteUnitAPI = (ingredientId, unitId) =>
    axios.delete(`/Ingredient/${ingredientId}/units/${unitId}`);

export {
    createIngredientAPI,
    getIngredientsAPI,
    getIngredientByIdAPI,
    updateIngredientAPI,
    deleteIngredientAPI,
    generateSkuAPI,
    addUnitAPI,
    deleteUnitAPI
};