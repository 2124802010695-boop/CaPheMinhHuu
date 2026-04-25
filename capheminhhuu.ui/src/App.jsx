import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PortalSelection from './pages/PortalSelection';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffLogin from './pages/StaffLogin';
import ChangePassword from './pages/ChangePassword';
import LayoutAdmin from './layouts/LayoutAdmin';
import QuanLyDanhMuc from './pages/admin/QuanLyDanhMuc';
import QuanLyDanhMucNguyenLieu from './pages/admin/QuanLyDanhMucNguyenLieu';
import KDS_Bep from './pages/kitchen/KDS_Bep'
import QuanLyKho from './pages/admin/QuanLyKho';
import QuanLySanPham from './pages/admin/QuanLySanPham';
import QuanLyNhanVien from './pages/admin/QuanLyNhanVien';
import QuanLyCaLamViec from './pages/admin/QuanLyCaLamViec';

// Cashier
import LayoutCashier from './layouts/LayoutCashier';
import CashierPOS from './pages/cashier/CashierPOS';
import TableManagement from './pages/cashier/TableManagement';
import OrderList from './pages/cashier/OrderList';
import OrderDetail from './pages/cashier/OrderDetail';
import ShiftOpen from './pages/cashier/ShiftOpen';
import ShiftClose from './pages/cashier/ShiftClose';
import ShiftReport from './pages/cashier/ShiftReport';

// Route Protection
import ProtectedRoute from './components/shared/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={<PortalSelection />} />
        <Route path="/login" element={<PortalSelection />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff/change-password" element={<ChangePassword />} />

        {/* === ADMIN ROUTES (Role: Admin) === */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={["Admin"]} authKey="adminToken" userKey="adminUser" loginPath="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="admin" element={
          <ProtectedRoute allowedRoles={["Admin"]} authKey="adminToken" userKey="adminUser" loginPath="/admin/login">
            <LayoutAdmin />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="quanlysanpham" replace />} />
          <Route path="quanlysanpham" element={<QuanLySanPham />} />
          <Route path="quanlydanhmuc" element={<QuanLyDanhMuc />} />
          <Route path="quanlydanhmucnguyenlieu" element={<QuanLyDanhMucNguyenLieu />} />
          <Route path="quanlykho" element={<QuanLyKho />} />
          <Route path="quanlynhanvien" element={<QuanLyNhanVien />} />
          <Route path="quanlycalamviec" element={<QuanLyCaLamViec />} />
        </Route>

        {/* === CASHIER ROUTES (Role: Cashier) === */}
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

        {/* === KITCHEN ROUTE (Role: Kitchen) === */}
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