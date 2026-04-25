import React from 'react';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import InventoryIcon from '@mui/icons-material/Inventory';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Link, useLocation } from 'react-router-dom';
const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar /> {/* Khoảng trống cho Navbar */}
      <Divider />
      <List>
        {/* 1. Dashboard */}
        <ListItemButton
          component={Link}
          to="/admin"
          selected={location.pathname === "/admin"}
        >
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Bảng điều khiển" />
        </ListItemButton>

        {/* 2. Quản lý Danh mục */}
        <ListItemButton
          component={Link}
          to="/admin/quanlydanhmuc"
          selected={location.pathname === "/admin/quanlydanhmuc"}
        >
          <ListItemIcon><CategoryIcon /></ListItemIcon>
          <ListItemText primary="Quản lý Danh mục" />
        </ListItemButton>

        {/* 3. Quản lý Sản phẩm */}
        <ListItemButton
          component={Link}
          to="/admin/quanlysanpham"
          selected={location.pathname === "/admin/quanlysanpham"}
        >
          <ListItemIcon><FastfoodIcon /></ListItemIcon>
          <ListItemText primary="Quản lý Sản phẩm" />
        </ListItemButton>

        {/* 4. Quản lý Danh mục Nguyên liệu */}
        <ListItemButton
          component={Link}
          to="/admin/quanlydanhmucnguyenlieu"
          selected={location.pathname === "/admin/quanlydanhmucnguyenlieu"}
        >
          <ListItemIcon><FolderSpecialIcon sx={{ color: '#10b981' }} /></ListItemIcon>
          <ListItemText primary="Danh mục Nguyên liệu" />
        </ListItemButton>

        {/* 5. Quản lý Kho */}
        <ListItemButton
          component={Link}
          to="/admin/quanlykho"
          selected={location.pathname === "/admin/quanlykho"}
        >
          <ListItemIcon><InventoryIcon /></ListItemIcon>
          <ListItemText primary="Kho & Định mức" />
        </ListItemButton>
        
        {/* 6. Quản lý Nhân viên */}
        <ListItemButton
          component={Link}
          to="/admin/quanlynhanvien"
          selected={location.pathname === "/admin/quanlynhanvien"}
        >
          <ListItemIcon><PeopleIcon sx={{ color: '#9333ea' }} /></ListItemIcon>
          <ListItemText primary="Quản lý Nhân viên" />
        </ListItemButton>
        {/* 7. Quản lý Ca làm việc */}
        <ListItemButton
          component={Link}
          to="/admin/quanlycalamviec"
          selected={location.pathname === "/admin/quanlycalamviec"}
        >
          <ListItemIcon><AccessTimeIcon sx={{ color: '#d97706' }} /></ListItemIcon>
          <ListItemText primary="Quản lý Ca" />
        </ListItemButton>

      </List>
    </Drawer>
  );
};


export default Sidebar;