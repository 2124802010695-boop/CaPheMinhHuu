import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './common/components/ProtectedRoute';

import UnifiedLogin from './modules/auth/UnifiedLogin';
import ChangePassword from './modules/auth/ChangePassword';
import QuanLyTopping from './modules/admin/pages/QuanLyTopping';

import LayoutAdmin from './modules/admin/layout/LayoutAdmin';
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import QuanLySanPham from './modules/admin/pages/QuanLySanPham';
import QuanLyDanhMuc from './modules/admin/pages/QuanLyDanhMuc';
import QuanLyDanhMucNguyenLieu from './modules/admin/pages/QuanLyDanhMucNguyenLieu';
import QuanLyKho from './modules/admin/pages/QuanLyKho';
import QuanLyNhanVien from './modules/admin/pages/QuanLyNhanVien';
import QuanLyKhuVucBan from './modules/admin/pages/QuanLyKhuVucBan';
import QuanLyCaLamViec from './modules/admin/pages/QuanLyCaLamViec';
import QuanLyLuong from './modules/admin/pages/QuanLyLuong';


import LayoutCashier from './modules/cashier/layout/LayoutCashier';
import CashierPOS from './modules/cashier/pages/CashierPOS';
import TableManagement from './modules/cashier/pages/TableManagement';
import OrderList from './modules/cashier/pages/OrderList';
import OrderDetail from './modules/cashier/pages/OrderDetail';
import ShiftOpen from './modules/cashier/pages/ShiftOpen';
import ShiftClose from './modules/cashier/pages/ShiftClose';
import ShiftReport from './modules/cashier/pages/ShiftReport';
import PaymentPage from './modules/cashier/pages/PaymentPage';

import KDS_Bep from './modules/kitchen/pages/KDS_Bep';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<UnifiedLogin />} />
                <Route path="/login" element={<UnifiedLogin />} />
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                <Route path="/staff/login" element={<Navigate to="/login" replace />} />
                <Route path="/staff/change-password" element={<ChangePassword />} />

                <Route path="admin" element={
                    <ProtectedRoute allowedRoles={["Admin"]} authKey="adminToken" userKey="adminUser" loginPath="/login">
                        <LayoutAdmin />
                    </ProtectedRoute>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="quanlysanpham" element={<QuanLySanPham />} />
                    <Route path="quanlydanhmuc" element={<QuanLyDanhMuc />} />
                    <Route path="quanlydanhmucnguyenlieu" element={<QuanLyDanhMucNguyenLieu />} />
                    <Route path="quanlykho" element={<QuanLyKho />} />
                    <Route path="quanlynhanvien" element={<QuanLyNhanVien />} />
                    <Route path="quanlycalamviec" element={<QuanLyCaLamViec />} />
                    <Route path="quanlyluong" element={<QuanLyLuong />} />

                    <Route path="quanlykhuvucban" element={<QuanLyKhuVucBan />} />
                    <Route path="quanlytopping" element={<QuanLyTopping />} />
                </Route>

                <Route path="cashier" element={
                    <ProtectedRoute allowedRoles={["Cashier"]} authKey="cashierToken" userKey="cashierUser" loginPath="/login">
                        <LayoutCashier />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="pos" replace />} />
                    <Route path="pos" element={<CashierPOS />} />
                    <Route path="tables" element={<TableManagement />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="orders/:id" element={<OrderDetail />} />
                    <Route path="payment" element={<PaymentPage />} />
                    <Route path="shift-open" element={<ShiftOpen />} />
                    <Route path="shift-close" element={<ShiftClose />} />
                    <Route path="shift-report" element={<ShiftReport />} />
                </Route>

                <Route path="/Bep" element={
                    <ProtectedRoute allowedRoles={["Kitchen"]} authKey="kitchenToken" userKey="kitchenUser" loginPath="/login">
                        <KDS_Bep />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;