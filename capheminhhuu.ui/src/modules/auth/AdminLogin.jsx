import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLoginAPI } from '../../common/services/authService';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      // axiosCustomize trả về response.data trực tiếp
      const res = await adminLoginAPI(username, password);

      if (res && res.token) {
        localStorage.setItem("adminToken", res.token);
        localStorage.setItem("adminUser", JSON.stringify(res.user));
        // Lưu refresh token nếu có
        if (res.refreshToken) {
          localStorage.setItem("adminRefreshToken", res.refreshToken);
        }
        alert("Đăng nhập thành công!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      // axiosCustomize reject error object, error.response vẫn có
      if (error.response && error.response.status === 401) {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
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
            Admin Portal
          </Typography>
          <Typography component="h2" variant="h6" align="center" color="textSecondary">
            SmartPOS - Minh Hữu Cafe
          </Typography>
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Tên đăng nhập"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

export default AdminLogin;