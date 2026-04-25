import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, Avatar, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { revokeTokenAPI } from '../services/authService';

const drawerWidth = 240;

export default function Navbar() {
  const navigate = useNavigate();

  // Lấy thông tin admin từ localStorage
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const adminName = adminUser.fullName || 'Admin';

  const handleLogout = async () => {
    if (!window.confirm('Bạn có chắc muốn đăng xuất?')) return;

    try {
      // Thu hồi refresh token trên server
      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (refreshToken) {
        await revokeTokenAPI(refreshToken);
      }
    } catch (err) {
      console.warn('Revoke token failed (có thể đã hết hạn):', err);
    } finally {
      // Xóa localStorage dù revoke thành công hay không
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminRefreshToken');
      navigate('/admin/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#6f4e37' }}>
          Trang Quản Trị
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="large" color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
             <Avatar sx={{ bgcolor: '#d19c5a' }}>{adminName.charAt(0).toUpperCase()}</Avatar>
             <Typography variant="subtitle1" sx={{ display: { xs: 'none', md: 'block' } }}>
               {adminName}
             </Typography>
          </Box>

          {/* NÚT ĐĂNG XUẤT */}
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 1 }}
          >
            Đăng xuất
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}