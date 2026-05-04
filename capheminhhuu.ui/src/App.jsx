import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './common/components/ProtectedRoute';

import PortalSelection from './modules/auth/PortalSelection';
import AdminLogin from './modules/auth/AdminLogin';
import StaffLogin from './modules/auth/StaffLogin';
import ChangePassword from './modules/auth/ChangePassword';

import LayoutAdmin from './modules/admin/layout/LayoutAdmin';
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import QuanLySanPham from './modules/admin/pages/QuanLySanPham';
import QuanLyDanhMuc from './modules/admin/pages/QuanLyDanhMuc';
import QuanLyDanhMucNguyenLieu from './modules/admin/pages/QuanLyDanhMucNguyenLieu';
import QuanLyKho from './modules/admin/pages/QuanLyKho';
import QuanLyNhanVien from './modules/admin/pages/QuanLyNhanVien';
import QuanLyCaLamViec from './modules/admin/pages/QuanLyCaLamViec';
import SecurityDashboard from './modules/admin/pages/SecurityDashboard';

import LayoutCashier from './modules/cashier/layout/LayoutCashier';
import CashierPOS from './modules/cashier/pages/CashierPOS';
import TableManagement from './modules/cashier/pages/TableManagement';
import OrderList from './modules/cashier/pages/OrderList';
import OrderDetail from './modules/cashier/pages/OrderDetail';
import ShiftOpen from './modules/cashier/pages/ShiftOpen';
import ShiftClose from './modules/cashier/pages/ShiftClose';
import ShiftReport from './modules/cashier/pages/ShiftReport';

import KDS_Bep from './modules/kitchen/pages/KDS_Bep';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PortalSelection />} />
                <Route path="/login" element={<PortalSelection />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/staff/change-password" element={<ChangePassword />} />

                <Route path="admin" element={
                    <ProtectedRoute allowedRoles={["Admin"]} authKey="adminToken" userKey="adminUser" loginPath="/admin/login">
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
                    <Route path="baomat" element={<SecurityDashboard />} />
                </Route>

                <Route path="cashier" element={
                    <ProtectedRoute allowedRoles={["Cashier"]} authKey="staffToken" userKey="staffUser" loginPath="/staff/login">
                        <LayoutCashier />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="pos" replace />} />
                    <Route path="pos" element={<CashierPOS />} />
                    <Route path="tables" element={<TableManagement />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="orders/:id" element={<OrderDetail />} />
                    <Route path="shift-open" element={<ShiftOpen />} />
                    <Route path="shift-close" element={<ShiftClose />} />
                    <Route path="shift-report" element={<ShiftReport />} />
                </Route>

                <Route path="/Bep" element={
                    <ProtectedRoute allowedRoles={["Kitchen"]} authKey="staffToken" userKey="staffUser" loginPath="/staff/login">
                        <KDS_Bep />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;