import React from 'react';
import { Box, Toolbar, CssBaseline } from '@mui/material';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { Outlet } from 'react-router-dom'; // Quan trọng: Để hiển thị nội dung con

const drawerWidth = 240;

export default function LayoutAdmin() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* 1. Thanh Navbar trên cùng */}
      <Navbar />
      
      {/* 2. Thanh Sidebar bên trái */}
      <Sidebar />

      {/* 3. Phần Nội dung chính */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f4f6f8', // Màu nền xám nhạt cho nội dung
          p: 3,
          minHeight: '100vh',
          width: `calc(100% - ${drawerWidth}px)`
        }}
      >
        {/* Toolbar giả để đẩy nội dung xuống dưới Navbar */}
        <Toolbar />
        
        {/* Nơi các trang con (Dashboard, Products...) sẽ hiện ra */}
        <Outlet /> 
        
        {/* (Tạm thời hiện chữ này để test nếu chưa có Outlet) */}
        {/* <h1>Khu vực Nội dung Chính</h1> */}
      </Box>
    </Box>
  );
}