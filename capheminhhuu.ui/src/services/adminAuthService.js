import axios from '../utils/axiosCustomize';

// POST: api/Auth/admin/login
export const adminLoginAPI = async (username, password) => {
    return axios.post('/Auth/admin/login', {
        username,
        password,
        rememberMe: true
    });
};