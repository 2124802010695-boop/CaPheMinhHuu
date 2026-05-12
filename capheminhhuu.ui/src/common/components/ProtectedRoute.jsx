import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { registerTabAPI } from '../services/authService';
import tabManager from '../utils/tabManager';

const ProtectedRoute = ({
    children,
    allowedRoles = [],
    authKey = "staffToken",
    userKey = "staffUser",
    loginPath = "/login"
}) => {
    const [status, setStatus] = useState('checking'); // checking | ok | fail


    useEffect(() => {
        let isMounted = true; // Memory leak prevention

        const verify = async () => {
            const token = localStorage.getItem(authKey);
            const userRaw = localStorage.getItem(userKey);

            if (!token || !userRaw) {
                if (isMounted) setStatus('fail');
                return;
            }

            // Kiểm tra role trước khi gọi API
            try {
                const user = JSON.parse(userRaw);
                if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                    if (isMounted) setStatus('fail');
                    return;
                }
            } catch {
                if (isMounted) setStatus('fail');
                return;
            }

            // Verify token với backend — dùng axios raw để tránh interceptor gắn nhầm token
            try {
                const tabId = tabManager.getTabId();
                axios.get(`${import.meta.env.VITE_API_URL}/Auth/check-token`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Tab-Id': tabId
                    }
                });
                // Token valid → register tab (auto-restore session)
                // Wrap in try/catch — tab registration failure must NOT cause redirect
                try {
                    await registerTabAPI(tabId);
                } catch (tabErr) {
                    console.warn('[ProtectedRoute] registerTab failed (non-fatal):', tabErr?.response?.status);
                }
                if (isMounted) setStatus('ok');
            } catch (err) {
                console.error('[ProtectedRoute] check-token failed:', 
                    err?.response?.status, 
                    err?.config?.url,
                    authKey
                );
                // Chỉ xóa token nếu thực sự unauthorized (401)
                // Không xóa nếu rớt mạng hoặc server lỗi (500, network error)
                if (err.response?.status === 401) {
                    localStorage.removeItem(authKey);
                    localStorage.removeItem(userKey);
                }
                if (isMounted) setStatus('fail');
            }
        };

        verify();

        return () => { isMounted = false; }; // Cleanup khi unmount
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (status === 'checking') {
        return null; // hoặc loading spinner
    }

    if (status === 'fail') {
        return <Navigate to={loginPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
