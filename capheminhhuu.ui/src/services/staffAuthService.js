import axios from '../utils/axiosCustomize';

// POST: api/Auth/staff/login
export const staffLoginAPI = async (staffCode, password) => {
    return axios.post('/Auth/staff/login', {
        staffCode,
        password,
        rememberMe: true
    });
};
