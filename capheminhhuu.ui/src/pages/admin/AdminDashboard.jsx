import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PeopleIcon from '@mui/icons-material/People';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Lấy thông tin user từ localStorage
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            setUser(JSON.parse(adminUser));
        } else {
            // Nếu không có user, chuyển về login
            navigate('/admin/login');
        }
    }, [navigate]);

    const menuItems = [
        { title: 'Quản lý Sản phẩm', icon: <RestaurantMenuIcon sx={{ fontSize: 60 }} />, path: '/admin/quanlysanpham', color: '#1976d2' },
        { title: 'Quản lý Danh mục', icon: <CategoryIcon sx={{ fontSize: 60 }} />, path: '/admin/quanlydanhmuc', color: '#2e7d32' },
        { title: 'Quản lý Kho', icon: <InventoryIcon sx={{ fontSize: 60 }} />, path: '/admin/quanlykho', color: '#ed6c02' },
        { title: 'Quản lý Nhân viên', icon: <PeopleIcon sx={{ fontSize: 60 }} />, path: '/admin/quanlynhanvien', color: '#9c27b0' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        <DashboardIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} />
                        Admin Dashboard
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                        Xin chào, {user?.fullName || user?.username || 'Admin'}!
                    </Typography>
                </Box>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                    Đăng xuất
                </Button>
            </Box>

            {/* Welcome Card */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h5" gutterBottom>
                    Chào mừng đến với SmartPOS - Minh Hữu Cafe
                </Typography>
                <Typography variant="body1">
                    Hệ thống quản lý quán cafe thông minh. Chọn chức năng bên dưới để bắt đầu.
                </Typography>
            </Paper>

            {/* Menu Grid */}
            <Grid container spacing={3}>
                {menuItems.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => navigate(item.path)}
                        >
                            <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                                <Box sx={{ color: item.color, mb: 2 }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                    {item.title}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                                <Button size="small" variant="contained" sx={{ bgcolor: item.color }}>
                                    Truy cập
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default AdminDashboard;
