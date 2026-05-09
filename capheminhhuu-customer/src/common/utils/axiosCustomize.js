import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7280/api',
});

instance.interceptors.request.use(function (config) {
    const token = localStorage.getItem("customerToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

instance.interceptors.response.use(
    function (response) {
        return response && response.data ? response.data : response;
    },
    function (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem("customerToken");
            localStorage.removeItem("customerUser");
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default instance;
