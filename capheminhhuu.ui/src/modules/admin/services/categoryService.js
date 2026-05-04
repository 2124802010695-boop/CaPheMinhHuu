import axios from "../../../common/utils/axiosCustomize";

const getCategoriesAPI = () => {
    return axios.get("/Category");
};

const createCategoryAPI = (data) => {
    return axios.post("/Category", data);
};

// PUT: api/Category/{id} — Cập nhật danh mục
const updateCategoryAPI = (id, data) => {
    return axios.put(`/Category/${id}`, data);
};

const deleteCategoryAPI = (id) => {
    return axios.delete(`/Category/${id}`);
};

export { getCategoriesAPI, createCategoryAPI, updateCategoryAPI, deleteCategoryAPI };
