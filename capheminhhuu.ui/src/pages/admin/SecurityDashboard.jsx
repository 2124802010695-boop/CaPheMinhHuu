import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, Button, 
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Alert, LinearProgress, Chip
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import axios from '../../utils/axiosCustomize';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && children}
    </div>
  );
}

export default function SecurityDashboard() {
  const [tabIndex, setTabIndex] = useState(0);

  // Tab 2: Account Lockout State
  const [lockedStaffs, setLockedStaffs] = useState([]);
  const [loadingStaffs, setLoadingStaffs] = useState(false);

  // Tab 3: Spam Logs State
  const [spamLogs, setSpamLogs] = useState([]);
  const [isSpamming, setIsSpamming] = useState(false);

  // Tab 4: Password Policy State
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    if (tabIndex === 1) {
      fetchLockedAccounts();
    }
  }, [tabIndex]);

  // --- API CALLS ---

  // Lấy danh sách nhân viên và lọc ra người bị khóa
  const fetchLockedAccounts = async () => {
    setLoadingStaffs(true);
    try {
      const data = await axios.get('/Staff');
      // Dữ liệu trả về tùy thuộc backend, giả sử trả về mảng user
      const list = Array.isArray(data) ? data : data?.items || [];
      const locked = list.filter(s => 
        s.isActive === false || 
        s.failedLoginAttempts >= 5 || 
        (s.lockedUntil && new Date(s.lockedUntil) > new Date())
      );
      setLockedStaffs(locked);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân viên:", error);
    } finally {
      setLoadingStaffs(false);
    }
  };

  // Mở khóa tài khoản thủ công
  const handleUnlockAccount = async (id) => {
    try {
      if(window.confirm("Bạn muốn mở khóa/kích hoạt lại tài khoản này?")) {
        await axios.patch(`/Staff/${id}/toggle-active`);
        alert("Đã mở khóa thành công!");
        fetchLockedAccounts(); // Reload list
      }
    } catch (error) {
      alert("Lỗi khi mở khóa: " + error.message);
    }
  };

  // Giả lập Bombard API (Rate Limiting)
  const simulateBruteForce = async () => {
    setSpamLogs([]);
    setIsSpamming(true);
    let logs = [];
    
    // Gửi 15 request liên tục bằng Promise.all để dội bom server ngay lập tức
    const requests = Array.from({ length: 15 }).map(async (_, idx) => {
      const reqNum = idx + 1;
      try {
        await axios.post('/Auth/login', { username: 'test_spam', password: '123' });
        return `Request ${reqNum}: 401 Unauthorized (Vì sai pass)`;
      } catch (error) {
        if (error.response?.status === 429) {
          return `Request ${reqNum}: 🔴 HTTP 429 TOO MANY REQUESTS - HỆ THỐNG ĐÃ BLOCKED IP CỦA BẠN!`;
        }
        return `Request ${reqNum}: ${error.response?.status || 'Lỗi mạng'}`;
      }
    });

    const results = await Promise.allSettled(requests);
    results.forEach(res => logs.push(res.value || res.reason));
    setSpamLogs(logs);
    setIsSpamming(false);
  };

  // Validate Mật khẩu (Cho Tab 4)
  const isLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
  const score = [isLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;


  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Bảng điều khiển Bảo mật (Admin Security)
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs 
          value={tabIndex} 
          onChange={(e, val) => setTabIndex(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="1. Token & Khóa phiên" />
          <Tab label="2. Account Lockout" />
          <Tab label="3. Rate Limiting Demo" />
          <Tab label="4. Mật khẩu & BCrypt" />
          <Tab label="5. Lịch sử Đăng nhập" />
          <Tab label="6. Nhật ký Hệ thống" />
        </Tabs>
      </Paper>

      {/* TAB 1: Quản lý JWT */}
      <TabPanel value={tabIndex} index={0}>
        <Alert severity="info" sx={{ mb: 2 }}>
            Tính năng đang phát triển Backend (Chưa có API `GET /api/Auth/active-sessions`).
            (Giáo viên có thể check Postman cho API Revoke Token).
        </Alert>
        <Typography variant="h6">Quản lý Phiên đăng nhập (Refresh Tokens)</Typography>
        <Table sx={{ mt: 2, background: '#fff' }}>
          <TableHead><TableRow><TableCell>Nhân viên</TableCell><TableCell>Phiên/Thiết bị</TableCell><TableCell>Hành động</TableCell></TableRow></TableHead>
          <TableBody>
            <TableRow><TableCell colSpan={3} align="center">Chưa có dữ liệu từ Server</TableCell></TableRow>
          </TableBody>
        </Table>
      </TabPanel>

      {/* TAB 2: Khóa tài khoản */}
      <TabPanel value={tabIndex} index={1}>
        <Typography variant="h6" gutterBottom>Danh sách tài khoản bị khóa (Brute-force)</Typography>
        <Button variant="outlined" onClick={fetchLockedAccounts} sx={{ mb: 2 }}>Tải lại danh sách</Button>
        <Table sx={{ background: '#fff' }}>
          <TableHead><TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tên / Username</TableCell>
            <TableCell>Số lần nhập sai</TableCell>
            <TableCell>Vai trò</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {loadingStaffs ? (
              <TableRow><TableCell colSpan={6} align="center"><LinearProgress /></TableCell></TableRow>
            ) : lockedStaffs.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">Hiện tại không có hệ thống ai bị khóa!</TableCell></TableRow>
            ) : (
              lockedStaffs.map(staff => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.id}</TableCell>
                  <TableCell><b>{staff.fullName}</b> ({staff.username || 'staff'})</TableCell>
                  <TableCell sx={{ color:'red', fontWeight:'bold' }}>{staff.failedLoginAttempts || 5} lần</TableCell>
                  <TableCell><Chip label={staff.role} color="primary" size="small" /></TableCell>
                  <TableCell>Bị vô hiệu (Locked)</TableCell>
                  <TableCell>
                    <Button 
                      color="success" 
                      variant="contained" 
                      size="small" 
                      onClick={() => handleUnlockAccount(staff.id)}
                      startIcon={<LockOpenIcon />}
                    >
                      Mở khóa ngay
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TabPanel>

      {/* TAB 3: Rate Limiting Spam */}
      <TabPanel value={tabIndex} index={2}>
        <Typography variant="h6">Giả lập Tấn công Spam API (Giới hạn Global Limit)</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Nhấn nút dưới đây để hệ thống ném 15 Request Login đồng thời vào server (Kiểm tra giới hạn IP).
        </Typography>
        <Button 
            variant="contained" 
            color="warning" 
            onClick={simulateBruteForce} 
            disabled={isSpamming}
            sx={{ mb: 2 }}
        >
            {isSpamming ? "Đang Bắn Spam..." : "Bắn Spam Login (15 Requests)"}
        </Button>
        <Paper sx={{ p: 2, background: '#1e1e1e', color: '#0f0', fontFamily: 'monospace', minHeight: '300px' }}>
            {spamLogs.length === 0 && <Typography color="#666">// Đang chờ lệnh tấn công...</Typography>}
            {spamLogs.map((log, idx) => (
                <div key={idx} style={{ 
                    color: log.includes('429') ? '#ff4444' : '#0f0',
                    fontWeight: log.includes('429') ? 'bold' : 'normal',
                    padding: '4px 0'
                }}>
                    {log}
                </div>
            ))}
        </Paper>
      </TabPanel>

      {/* TAB 4: BCrypt */}
      <TabPanel value={tabIndex} index={3}>
        <Typography variant="h6">Demo Kiểm tra Password (Min 8 Ký tự, Hoa, Thường, Số, Đặc biệt)</Typography>
        <Box sx={{ maxWidth: 500, background: '#fff', p: 3, mt: 2, borderRadius: 2, boxShadow: 1 }}>
            <TextField 
                fullWidth 
                label="Nhập mật khẩu bất kỳ" 
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoComplete="off"
            />
            {pwd && (
                <Box sx={{ mt: 2 }}>
                    <Typography color={isLength ? "green" : "red"}>{isLength ? "✅" : "❌"} Ít nhất 8 ký tự</Typography>
                    <Typography color={hasUpper ? "green" : "red"}>{hasUpper ? "✅" : "❌"} Có chữ in hoa</Typography>
                    <Typography color={hasLower ? "green" : "red"}>{hasLower ? "✅" : "❌"} Có chữ in thường</Typography>
                    <Typography color={hasNumber ? "green" : "red"}>{hasNumber ? "✅" : "❌"} Có ít nhất 1 chữ số</Typography>
                    <Typography color={hasSpecial ? "green" : "red"}>{hasSpecial ? "✅" : "❌"} Có ít nhất 1 ký hiệu (!@#$)</Typography>
                </Box>
            )}
            {score === 5 && (
                <Alert severity="success" sx={{ mt: 2 }}>Mật khẩu rất mạnh! Chuẩn bị Băm BCrypt...</Alert>
            )}
            {score === 5 && (
                <Typography sx={{ mt: 2, p: 2, background: '#f5f5f5', borderRadius: 1, wordBreak: 'break-all' }}>
                    Kết quả Băm (Lưu DB): <br/>
                    <b>$2a$10$xyz123abc456def789...</b> <br/>
                    <small><i>(Giá trị mô phỏng vì BCrypt băm thực tế trên Backend C#)</i></small>
                </Typography>
            )}
        </Box>
      </TabPanel>

      {/* TAB 5 & 6 cơ bản */}
      <TabPanel value={tabIndex} index={4}>
        <Alert severity="warning">API cho `LoginHistory` hiện chưa được mở (Sẽ cần build thêm ở Backend).</Alert>
      </TabPanel>
      <TabPanel value={tabIndex} index={5}>
        <Alert severity="warning">API cho `AuditLogs` hiện chưa được mở (Sẽ cần build thêm ở Backend).</Alert>
      </TabPanel>

    </Box>
  );
}
