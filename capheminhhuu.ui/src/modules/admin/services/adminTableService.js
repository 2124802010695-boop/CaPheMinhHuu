import axios from "../../../common/utils/axiosCustomize";

const getTablesAPI = () => axios.get("/table");

const getTableByIdAPI = (id) => axios.get(`/table/${id}`);

const createTableAPI = (data) => axios.post("/table", data);

const updateTableAPI = (id, data) => axios.put(`/table/${id}`, data);

const deleteTableAPI = (id) => axios.delete(`/table/${id}`);

const getTableQRAPI = (id) => axios.get(`/table/${id}/qr`);

export {
    getTablesAPI,
    getTableByIdAPI,
    createTableAPI,
    updateTableAPI,
    deleteTableAPI,
    getTableQRAPI
};
