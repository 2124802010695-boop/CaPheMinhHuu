import axios from "axios";

const instance = axios.create({
    baseURL: 'https://localhost:7280/api',
});

// ======= HELPER: Xác định portal hiện tại =======
const getTokenKeys = () => {
    // Ưu tiên admin, sau đó staff, cuối cùng token generic
    if (localStorage.getItem("adminToken")) {
        return { tokenKey: "adminToken", refreshKey: "adminRefreshToken", userKey: "adminUser" };
    }
    if (localStorage.getItem("staffToken")) {
        return { tokenKey: "staffToken", refreshKey: "staffRefreshToken", userKey: "staffUser" };
    }
    return { tokenKey: "token", refreshKey: "refreshToken", userKey: "user" };
};

// ======= REQUEST INTERCEPTOR =======
instance.interceptors.request.use(function (config) {
    const { tokenKey } = getTokenKeys();
    const token = localStorage.getItem(tokenKey);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        const originalRequest = error.config;

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
            const getTokenKeys = () => {
         const path = window.location.pathname;
    
                if (path.startsWith("/admin")) {
                    return { tokenKey: "adminToken", refreshKey: "adminRefreshToken", userKey: "adminUser" };
                }
                if (path.startsWith("/cashier") || path.startsWith("/kitchen")) {
                    return { tokenKey: "staffToken", refreshKey: "staffRefreshToken", userKey: "staffUser" };
                }
                // Fallback
                if (localStorage.getItem("adminToken")) {
                    return { tokenKey: "adminToken", refreshKey: "adminRefreshToken", userKey: "adminUser" };
                }
                return { tokenKey: "staffToken", refreshKey: "staffRefreshToken", userKey: "staffUser" };
};
            const refreshToken = localStorage.getItem(refreshKey);


            if (!refreshToken) {
                isRefreshing = false;
                // Không có refresh token → redirect login
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
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
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
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshKey);
    localStorage.removeItem(userKey);

    // Redirect về login tương ứng
    const isAdmin = tokenKey === "adminToken";
    const loginPath = isAdmin ? "/admin/login" : "/staff/login";

    // Chỉ redirect nếu đang ở trang cần auth
    if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = loginPath;
    }
}

export default instance;