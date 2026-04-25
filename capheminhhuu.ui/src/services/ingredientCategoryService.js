import axios from "../utils/axiosCustomize";

// 1. API lấy tất cả danh mục nguyên liệu
const getIngredientCategoriesAPI = () => {
    return axios.get("/IngredientCategory");
};

// 2. API tạo danh mục nguyên liệu mới
const createIngredientCategoryAPI = (data) => {
    return axios.post("/IngredientCategory", data);
};

// 3. API cập nhật danh mục nguyên liệu
const updateIngredientCategoryAPI = (id, data) => {
    return axios.put(`/IngredientCategory/${id}`, data);
};

// 4. API xóa danh mục nguyên liệu
const deleteIngredientCategoryAPI = (id) => {
    return axios.delete(`/IngredientCategory/${id}`);
};

export {
    getIngredientCategoriesAPI,
    createIngredientCategoryAPI,
    updateIngredientCategoryAPI,
    deleteIngredientCategoryAPI
};
