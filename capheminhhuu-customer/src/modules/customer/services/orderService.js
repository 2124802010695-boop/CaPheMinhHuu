import axios from "../../../common/utils/axiosCustomize";

export const createGuestOrderAPI = (dto) =>
    axios.post("/guest/order", dto);

export const trackOrderAPI = (orderCode) =>
    axios.get(`/guest/order/${orderCode}`);

export const createPaymentUrlAPI = (orderCode) =>
    axios.post("/payment/vnpay/create-url", { orderCode });
