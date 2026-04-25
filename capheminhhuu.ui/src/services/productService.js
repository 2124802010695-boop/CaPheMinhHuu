import axios from "../utils/axiosCustomize";

const getProductsAPI = () => {
    return axios.get("/Product"); // GET /api/Product
};

const createProductAPI = (data) => {
    return axios.post("/Product", data); // POST /api/Product
};

// PUT: api/Product/{id} — Cập nhật sản phẩm
const updateProductAPI = (id, data) => {
    return axios.put(`/Product/${id}`, data); // PUT /api/Product/id
};

const deleteProductAPI = (id) => {
    return axios.delete(`/Product/${id}`); // DELETE /api/Product/id
};

// Cần lấy danh sách danh mục để đổ vào dropdown khi thêm sản phẩm
const getCategoriesForDropdownAPI = () => {
    return axios.get("/Category"); // Reuse Category API
}
// POST: api/Product/{id}/image — Upload ảnh sản phẩm
const uploadProductImageAPI = (id, formData) => {
    return axios.post(`/Product/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export { getProductsAPI, createProductAPI, updateProductAPI, deleteProductAPI, getCategoriesForDropdownAPI, uploadProductImageAPI };
