import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLoginAPI, staffLoginAPI } from '../../common/services/authService';
import { getCurrentShiftAPI } from '../cashier/services/shiftService';
import tabManager from '../../common/utils/tabManager';
import { registerTabAPI } from '../../common/services/authService';
import {
    Container, Box, Typography, TextField,
    Button, Paper, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';

const UnifiedLogin = () => {
    const navigate = useNavigate();
    const [portal, setPortal] = useState('staff');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePortalChange = (_, newPortal) => {
        if (newPortal) {
            setPortal(newPortal);
            setIdentifier('');
            setPassword('');
            setError('');
        }
    };

    const handleLogin = async () => {
        if (!identifier || !password) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let res;

            if (portal === 'admin') {
                res = await adminLoginAPI(identifier, password);
                if (res && res.token) {
                    localStorage.setItem('adminToken', res.token);
                    localStorage.setItem('adminUser', JSON.stringify(res.user));
                    if (res.refreshToken) {
                        localStorage.setItem('adminRefreshToken', res.refreshToken);
                    }
                    await registerTabAPI(tabManager.getTabId());
                    navigate('/admin/dashboard');
                }
            } else {
                res = await staffLoginAPI(identifier, password);
                if (res && res.token) {
                    localStorage.setItem('staffToken', res.token);
                    localStorage.setItem('staffUser', JSON.stringify(res.user));
                    if (res.refreshToken) {
                        localStorage.setItem('staffRefreshToken', res.refreshToken);
                    }

                    if (res.isFirstLogin) {
                        navigate('/staff/change-password');
                        return;
                    }

                    const role = res.user?.role;

                    if (role === 'Cashier') {
                        try {
                            const shiftRes = await getCurrentShiftAPI();
                            if (shiftRes && shiftRes.id && shiftRes.status === 'Open') {
                                await registerTabAPI(tabManager.getTabId());
                                navigate('/cashier/pos');
                            } else {
                                await registerTabAPI(tabManager.getTabId());
                                navigate('/cashier/shift-open');
                            }
                        } catch {
                            await registerTabAPI(tabManager.getTabId());
                            navigate('/cashier/shift-open');
                        }
                    } else if (role === 'Kitchen') {
                        await registerTabAPI(tabManager.getTabId());
                        navigate('/Bep');
                    } else {
                        setError('Role không hợp lệ!');
                    }
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Sai tên đăng nhập hoặc mật khẩu!');
            } else if (err.response?.status === 423) {
                setError('Tài khoản đang bị khóa. Vui lòng thử lại sau 15 phút!');
            } else {
                setError('Lỗi kết nối Server!');
            }
        }

        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        SmartPOS — Minh Hữu Cafe
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 1 }}>
                        <ToggleButtonGroup
                            value={portal}
                            exclusive
                            onChange={handlePortalChange}
                            size="small"
                        >
                            <ToggleButton value="staff" sx={{ px: 3 }}>
                                <PeopleIcon sx={{ mr: 1, fontSize: 18 }} />
                                Nhân viên
                            </ToggleButton>
                            <ToggleButton value="admin" sx={{ px: 3 }}>
                                <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 18 }} />
                                Quản trị viên
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label={portal === 'admin' ? 'Tên đăng nhập' : 'Mã nhân viên'}
                        autoFocus
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Mật khẩu"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default UnifiedLogin;
