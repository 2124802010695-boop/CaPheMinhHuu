import axios from "../../../common/utils/axiosCustomize";

const getSizesByProductAPI = (productId) => axios.get(`/Product/${productId}/sizes`);
const createSizeAPI = (productId, data) => axios.post(`/Product/${productId}/sizes`, data);
const updateSizeAPI = (productId, sizeId, data) => axios.put(`/Product/${productId}/sizes/${sizeId}`, data);
const deleteSizeAPI = (productId, sizeId) => axios.delete(`/Product/${productId}/sizes/${sizeId}`);

export {
    getSizesByProductAPI,
    createSizeAPI,
    updateSizeAPI,
    deleteSizeAPI
};
