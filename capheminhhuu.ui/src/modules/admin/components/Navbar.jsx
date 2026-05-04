import React from 'react';
import {
    AppBar, Toolbar, Typography, Box, IconButton, Avatar, Button, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../../common/context/ThemeContext';
import { revokeTokenAPI } from '../../../common/services/authService';

export default function Navbar({ onMenuClick }) {
    const navigate = useNavigate();
    const { mode, toggleMode } = useThemeMode();
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const adminName = adminUser.fullName || 'Admin';

    const handleLogout = async () => {
        if (!window.confirm('Bạn có chắc muốn đăng xuất?')) return;
        try {
            const refreshToken = localStorage.getItem('adminRefreshToken');
            if (refreshToken) await revokeTokenAPI(refreshToken);
        } catch (err) {
            console.warn('Revoke token failed:', err);
        } finally {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminRefreshToken');
            navigate('/admin/login');
        }
    };

    return (
        <AppBar position="fixed" elevation={0}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" noWrap sx={{
                    flexGrow: 1, fontWeight: 800,
                    color: mode === 'dark' ? '#d19c5a' : '#6f4e37',
                    letterSpacing: '-.3px'
                }}>
                    Trang Quản Trị
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={mode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
                        <IconButton onClick={toggleMode} size="small">
                            {mode === 'dark'
                                ? <LightModeIcon sx={{ color: '#f59e0b' }} />
                                : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <IconButton size="small">
                        <NotificationsIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 1 }}>
                        <Avatar sx={{
                            bgcolor: '#d19c5a', width: 32, height: 32,
                            fontSize: 13, fontWeight: 700
                        }}>
                            {adminName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}
                            sx={{ display: { xs: 'none', md: 'block' } }}>
                            {adminName}
                        </Typography>
                    </Box>

                    <Button variant="outlined" color="error" size="small"
                        startIcon={<LogoutIcon />} onClick={handleLogout}
                        sx={{ textTransform: 'none', fontSize: 12 }}>
                        Đăng xuất
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}