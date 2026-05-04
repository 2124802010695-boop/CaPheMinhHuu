import axios from "../../../common/utils/axiosCustomize";

// 1. Lấy danh sách định mức của 1 món
const getRecipesByProductAPI = (productId) => {
    return axios.get(`/Recipe/product/${productId}`);
};

// 2. Thêm nguyên liệu vào món
const createRecipeAPI = (data) => {
    return axios.post("/Recipe", data);
};

// 3. Xóa nguyên liệu khỏi món
const deleteRecipeAPI = (recipeId) => {
    return axios.delete(`/Recipe/${recipeId}`);
};

export { getRecipesByProductAPI, createRecipeAPI, deleteRecipeAPI };