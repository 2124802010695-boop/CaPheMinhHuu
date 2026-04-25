import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffLoginAPI } from '../services/staffAuthService';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [staffCode, setStaffCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!staffCode || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      // axiosCustomize trả về response.data trực tiếp
      const res = await staffLoginAPI(staffCode, password);

      if (res && res.token) {
        localStorage.setItem("staffToken", res.token);
        localStorage.setItem("staffUser", JSON.stringify(res.user));
        // Lưu refresh token nếu có
        if (res.refreshToken) {
          localStorage.setItem("staffRefreshToken", res.refreshToken);
        }

        // Kiểm tra lần đầu đăng nhập
        if (res.isFirstLogin) {
          alert("Đây là lần đầu đăng nhập! Vui lòng đổi mật khẩu.");
          navigate("/staff/change-password");
        } else {
          alert("Đăng nhập thành công!");
          // Chuyển đến trang tương ứng với role
          if (res.user.role === "Cashier") {
            navigate("/cashier/pos");
          } else if (res.user.role === "Kitchen") {
            navigate("/Bep");
          }
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Sai mã nhân viên hoặc mật khẩu!");
      } else {
        alert("Lỗi kết nối Server!");
      }
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Staff Portal
          </Typography>
          <Typography component="h2" variant="h6" align="center" color="textSecondary">
            SmartPOS - Minh Hữu Cafe
          </Typography>
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mã nhân viên"
              autoFocus
              value={staffCode}
              onChange={(e) => setStaffCode(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StaffLogin;
