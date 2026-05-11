import axios from '../../../common/utils/axiosCustomize';

export const getHolidaysAPI = () => axios.get('/Holiday');
export const createHolidayAPI = (data) => axios.post('/Holiday', data);
export const toggleHolidayAPI = (id) => axios.patch(`/Holiday/${id}/toggle`);
export const deleteHolidayAPI = (id) => axios.delete(`/Holiday/${id}`);