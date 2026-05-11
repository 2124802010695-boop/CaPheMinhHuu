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

export const createVnPayUrl = (orderCode) =>
    axios.post('/payment/vnpay/create-url', { orderCode });

export const getToppings = () =>
    axios.get('/Topping');

export const getProductSizes = (productId) =>
    axios.get(`/Product/${productId}/sizes`);

export const markAsPaid = (id) =>
    axios.patch(`/Order/${id}/pay`);