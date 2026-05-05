import axios from "../../../common/utils/axiosCustomize";

const getAreasAPI = () => axios.get("/area");

const getAreaByIdAPI = (id) => axios.get(`/area/${id}`);

const createAreaAPI = (data) => axios.post("/area", data);

const updateAreaAPI = (id, data) => axios.put(`/area/${id}`, data);

const deleteAreaAPI = (id) => axios.delete(`/area/${id}`);

export {
    getAreasAPI,
    getAreaByIdAPI,
    createAreaAPI,
    updateAreaAPI,
    deleteAreaAPI
};
