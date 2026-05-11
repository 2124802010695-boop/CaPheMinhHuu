import axios from "../../../common/utils/axiosCustomize";

const getToppingsAPI = () => axios.get("/Topping");
const getAllToppingsAdminAPI = () => axios.get("/Topping/admin/all");
const getToppingByIdAPI = (id) => axios.get(`/Topping/${id}`);
const createToppingAPI = (data) => axios.post("/Topping", data);
const updateToppingAPI = (id, data) => axios.put(`/Topping/${id}`, data);
const deleteToppingAPI = (id) => axios.delete(`/Topping/${id}`);
const toggleToppingAPI = (id) => axios.patch(`/Topping/${id}/toggle`);

export {
    getToppingsAPI,
    getAllToppingsAdminAPI,
    getToppingByIdAPI,
    createToppingAPI,
    updateToppingAPI,
    deleteToppingAPI,
    toggleToppingAPI
};
