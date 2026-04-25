import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — Bảo vệ route theo role
 * @param {string[]} allowedRoles - Danh sách role được phép truy cập (VD: ["Cashier", "Kitchen"])
 * @param {string} authKey - Key lưu token trong localStorage ("staffToken" hoặc "adminToken")
 * @param {string} userKey - Key lưu user info ("staffUser" hoặc "adminUser")
 * @param {string} loginPath - Redirect về trang login nếu chưa đăng nhập
 */
const ProtectedRoute = ({ children, allowedRoles = [], authKey = "staffToken", userKey = "staffUser", loginPath = "/staff/login" }) => {
    const token = localStorage.getItem(authKey);
    const userRaw = localStorage.getItem(userKey);

    // 1. Chưa đăng nhập → redirect về login
    if (!token || !userRaw) {
        return <Navigate to={loginPath} replace />;
    }

    // 2. Kiểm tra role (nếu có yêu cầu)
    if (allowedRoles.length > 0) {
        try {
            const user = JSON.parse(userRaw);
            if (!allowedRoles.includes(user.role)) {
                // Sai role → redirect về trang chủ
                return <Navigate to="/" replace />;
            }
        } catch {
            return <Navigate to={loginPath} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
