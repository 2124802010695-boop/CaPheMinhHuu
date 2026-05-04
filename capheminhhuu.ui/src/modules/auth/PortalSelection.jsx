import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper, Grid } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';

const PortalSelection = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="md">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    SmartPOS - Minh Hữu Cafe
                </Typography>
                <Typography variant="h6" color="textSecondary" gutterBottom sx={{ mb: 4 }}>
                    Chọn cổng đăng nhập
                </Typography>

                <Grid container spacing={3} sx={{ width: '100%' }}>
                    {/* Admin Portal */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => navigate('/admin/login')}
                        >
                            <AdminPanelSettingsIcon sx={{ fontSize: 80, color: '#1976d2', mb: 2 }} />
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Admin
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Quản trị hệ thống
                            </Typography>
                            <Button variant="contained" fullWidth>
                                Đăng nhập
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Staff Portal */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => navigate('/staff/login')}
                        >
                            <PeopleIcon sx={{ fontSize: 80, color: '#2e7d32', mb: 2 }} />
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Nhân viên
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Thu ngân & Bếp
                            </Typography>
                            <Button variant="contained" color="success" fullWidth>
                                Đăng nhập
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Customer Portal */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => alert('Tính năng đang phát triển!')}
                        >
                            <StorefrontIcon sx={{ fontSize: 80, color: '#ed6c02', mb: 2 }} />
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Khách hàng
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Đặt hàng online
                            </Typography>
                            <Button variant="contained" color="warning" fullWidth>
                                Đăng nhập
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default PortalSelection;
