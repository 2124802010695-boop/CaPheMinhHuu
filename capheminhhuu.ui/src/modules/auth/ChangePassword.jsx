import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePasswordAPI } from '../../common/services/authService';
import { Container, Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');

    const handleChangePassword = async () => {
        setError('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        if (newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ HOA, chữ thường, số và ký tự đặc biệt!');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        try {
            // FIX: Dùng staffCode (mã nhân viên) thay vì username
            // Backend ChangePasswordRequest nhận field "StaffCode"
            // LoginResponse.UserInfo có cả username VÀ staffCode — dùng staffCode
            const code = staffUser.staffCode || staffUser.username;
            await changePasswordAPI(code, oldPassword, newPassword);

            alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            localStorage.removeItem('staffToken');
            localStorage.removeItem('staffUser');
            localStorage.removeItem('staffRefreshToken');
            navigate('/staff/login');
        } catch (err) {
            // Lấy lỗi validation chi tiết từ backend
            const data = err.response?.data;
            if (data?.errors) {
                const messages = Object.values(data.errors).flat().join('\n');
                setError(messages);
            } else {
                setError(data?.message || 'Đổi mật khẩu thất bại!');
            }
        }
        setLoading(false);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        🔐 Đổi mật khẩu lần đầu
                    </Typography>
                    <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
                        Xin chào <strong>{staffUser.fullName || staffUser.username}</strong>, vui lòng đặt mật khẩu mới.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Mật khẩu cũ"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        helperText="Mật khẩu mặc định = mã nhân viên"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Mật khẩu mới"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        helperText="Tối thiểu 8 ký tự, gồm: HOA + thường + số + đặc biệt (!@#$...)"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        onClick={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default ChangePassword;
