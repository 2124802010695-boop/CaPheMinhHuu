import axios from "axios";
import tabManager from './tabManager';

const instance = axios.create({
    baseURL: 'https://localhost:7280/api',
});

// ======= HELPER: Xác định portal hiện tại =======
const getTokenKeys = () => {
    const path = window.location.pathname;
    if (path.startsWith("/admin")) {
        return { tokenKey: "adminToken", refreshKey: "adminRefreshToken", userKey: "adminUser" };
    }
    if (path.startsWith("/Bep") || path.startsWith("/bep")) {
        return { tokenKey: "kitchenToken", refreshKey: "kitchenRefreshToken", userKey: "kitchenUser" };
    }
    // Cashier /cashier/*
    return { tokenKey: "cashierToken", refreshKey: "cashierRefreshToken", userKey: "cashierUser" };
};

// ======= REQUEST INTERCEPTOR =======
instance.interceptors.request.use(function (config) {
    const { tokenKey } = getTokenKeys();
    const token = localStorage.getItem(tokenKey);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Gắn TabId vào mọi request để backend tracking
    const tabId = tabManager.getTabId();
    if (tabId) {
        config.headers['X-Tab-Id'] = tabId;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// ======= RESPONSE INTERCEPTOR — Auto Refresh Token =======
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

instance.interceptors.response.use(
    function (response) {
        // Trả response.data trực tiếp cho gọn
        return response && response.data ? response.data : response;
    },
    async function (error) {
        console.error('[Interceptor] Response error:', 
            error?.response?.status, 
            error?.config?.url,
            error?.response?.data
        );
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        // Nếu lỗi 401 VÀ chưa retry → thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Không retry cho chính request refresh-token (tránh loop vô tận)
            if (originalRequest.url?.includes('/Auth/refresh-token') ||
                originalRequest.url?.includes('/Auth/admin/login') ||
                originalRequest.url?.includes('/Auth/staff/login') ||
                originalRequest.url?.includes('/Auth/login')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Đang refresh rồi → xếp hàng đợi
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return instance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const { tokenKey, refreshKey, userKey } = getTokenKeys();
            const refreshToken = localStorage.getItem(refreshKey);


            if (!refreshToken) {
                isRefreshing = false;
                // Không có refresh token → redirect login
                console.error('[Auth] No refresh token found, forcing logout. Path:', window.location.pathname, 'tokenKey:', tokenKey);
                handleForceLogout(tokenKey, refreshKey, userKey);
                return Promise.reject(error);
            }

            try {
                // Gọi refresh token API (dùng axios gốc để tránh interceptor loop)
                const response = await axios.post('https://localhost:7280/api/Auth/refresh-token', {
                    refreshToken: refreshToken
                });

                const newData = response.data;

                if (newData && newData.token) {
                    // Lưu token mới
                    localStorage.setItem(tokenKey, newData.token);
                    if (newData.refreshToken) {
                        localStorage.setItem(refreshKey, newData.refreshToken);
                    }

                    // Retry original request với token mới
                    originalRequest.headers.Authorization = `Bearer ${newData.token}`;
                    processQueue(null, newData.token);

                    return instance(originalRequest);
                } else {
                    console.error('[Auth] Refresh response missing token:', newData);
                    processQueue(new Error('Refresh token response invalid'), null);
                    handleForceLogout(tokenKey, refreshKey, userKey);
                    return Promise.reject(new Error('Refresh token response invalid'));
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                console.error('[Auth] Refresh token failed:', refreshError?.response?.status, refreshError?.response?.data, 'refreshToken used:', refreshToken?.substring(0, 20) + '...');
                handleForceLogout(tokenKey, refreshKey, userKey);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Helper: Force logout khi refresh token cũng hết hạn
function handleForceLogout(tokenKey, refreshKey, userKey) {
    console.error('[Auth] Force logout triggered. tokenKey:', tokenKey, 'path:', window.location.pathname);
    // Không gọi revoke-tab ở đây vì token đã invalid
    // revoke-tab sẽ được gọi khi user logout chủ động
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(userKey);

    const loginPath = "/login";
    if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = loginPath;
    }
}

export default instance;