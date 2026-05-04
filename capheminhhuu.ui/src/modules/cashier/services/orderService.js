import axios from '../../../common/utils/axiosCustomize';
export const createOrder = (dto) =>
    axios.post('/Order', dto);
export const getTodayOrders = () =>
    axios.get('/Order/today');
export const getOrderById = (id) =>
    axios.get(`/Order/${id}`);
export const updateOrderStatus = (id, status) =>
    axios.patch(`/Order/${id}/status`, JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' }
    });