import React, { useEffect, useState } from 'react';
import {
    Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography, IconButton,
    Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, InputAdornment, Tooltip, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LockResetIcon from '@mui/icons-material/LockReset';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    getAllStaffAPI, createStaffAPI, updateStaffAPI,
    toggleStaffActiveAPI, resetStaffPasswordAPI
} from '../services/staffService';

const INITIAL_FORM = {
    username: '', password: '', fullName: '', phone: '',
    email: '', role: 'Cashier', salary: 0, salaryCoefficient: 1.0
};

const QuanLyNhanVien = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [openModal, setOpenModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await getAllStaffAPI();
            setStaffList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Lỗi lấy danh sách nhân viên:', err);
        }
        setLoading(false);
    };

    // === OPEN MODAL ===
    const handleOpenCreate = () => {
        setEditingId(null);
        setForm(INITIAL_FORM);
        setOpenModal(true);
    };

    const handleOpenEdit = (staff) => {
        setEditingId(staff.id);
        setForm({
            username: staff.username || '',
            password: '',
            fullName: staff.fullName || '',
            phone: staff.phone || '',
            email: staff.email || '',
            role: staff.role || 'Cashier',
            salary: staff.salary || 0,
            salaryCoefficient: staff.salaryCoefficient || 1.0
        });
        setOpenModal(true);
    };

    // === SUBMIT ===
    const handleSubmit = async () => {
        if (!form.fullName.trim() || !form.phone.trim() || !form.role) {
            alert('Vui lòng điền đủ: Họ tên, Số điện thoại, Vai trò');
            return;
        }
        if (!editingId && (!form.username.trim() || !form.password.trim())) {
            alert('Vui lòng điền Username và Mật khẩu cho nhân viên mới');
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await updateStaffAPI(editingId, {
                    fullName: form.fullName,
                    phone: form.phone,
                    email: form.email || null,
                    role: form.role,
                    salary: parseFloat(form.salary) || 0,
                    salaryCoefficient: parseFloat(form.salaryCoefficient) || 1.0
                });
                alert('Cập nhật nhân viên thành công!');
            } else {
                await createStaffAPI({
                    username: form.username,
                    password: form.password,
                    fullName: form.fullName,
                    phone: form.phone,
                    email: form.email || null,
                    role: form.role,
                    salary: parseFloat(form.salary) || 0,
                    salaryCoefficient: parseFloat(form.salaryCoefficient) || 1.0
                });
                alert('Tạo nhân viên thành công!');
            }
            setOpenModal(false);
            fetchStaff();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Lỗi thao tác nhân viên');
        }
        setSubmitting(false);
    };

    // === TOGGLE ACTIVE ===
    const handleToggleActive = async (staff) => {
        const action = staff.isActive ? 'vô hiệu hóa' : 'kích hoạt';
        if (!window.confirm(`Bạn có chắc muốn ${action} nhân viên "${staff.fullName}"?`)) return;
        try {
            const result = await toggleStaffActiveAPI(staff.id);
            alert(result.message || `Đã ${action} thành công`);
            fetchStaff();
        } catch (err) {
            alert(err.response?.data?.message || `Lỗi ${action}`);
        }
    };

    // === RESET PASSWORD ===
    const handleResetPassword = async (staff) => {
        if (!window.confirm(`Reset mật khẩu của "${staff.fullName}" về mặc định (= username)?`)) return;
        try {
            const result = await resetStaffPasswordAPI(staff.id);
            alert(result.message || 'Đã reset mật khẩu thành công');
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi reset mật khẩu');
        }
    };

    const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + 'đ';
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#f3e8ff', width: 48, height: 48 }}>
                            <PeopleIcon sx={{ color: '#9333ea', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                                Quản Lý Nhân Viên
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Quản lý tài khoản nhân viên thu ngân và nhà bếp
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{
                            bgcolor: '#9333ea', textTransform: 'none', fontWeight: 500, px: 3,
                            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                            '&:hover': { bgcolor: '#7e22ce', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
                        }}
                    >
                        Thêm Nhân Viên
                    </Button>
                </Box>
            </Paper>

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#9333ea' }} />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Nhân viên</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Username</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>SĐT</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Vai trò</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Lương</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Ngày tạo</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {staffList.map((s) => (
                                    <TableRow key={s.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ bgcolor: s.role === 'Kitchen' ? '#fef3c7' : '#dbeafe', width: 36, height: 36 }}>
                                                    <PersonIcon sx={{ color: s.role === 'Kitchen' ? '#d97706' : '#2563eb', fontSize: 20 }} />
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                                                        {s.fullName}
                                                    </Typography>
                                                    <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                                                        {s.email || '—'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={s.username} size="small" sx={{ bgcolor: '#f3f4f6', fontWeight: 500, fontFamily: 'monospace' }} />
                                        </TableCell>
                                        <TableCell sx={{ color: '#374151' }}>{s.phone || '—'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={s.role}
                                                size="small"
                                                sx={{
                                                    bgcolor: s.role === 'Kitchen' ? '#fef3c7' : '#dbeafe',
                                                    color: s.role === 'Kitchen' ? '#92400e' : '#1e40af',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: '#374151', fontWeight: 500 }}>
                                            {formatVND(s.salary)}
                                            {s.salaryCoefficient !== 1 && (
                                                <Typography component="span" sx={{ color: '#9ca3af', fontSize: '0.75rem', ml: 0.5 }}>
                                                    (×{s.salaryCoefficient})
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={s.isActive ? <CheckCircleIcon /> : <BlockIcon />}
                                                label={s.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                                size="small"
                                                sx={{
                                                    bgcolor: s.isActive ? '#dcfce7' : '#fee2e2',
                                                    color: s.isActive ? '#166534' : '#991b1b',
                                                    fontWeight: 500,
                                                    '& .MuiChip-icon': { color: 'inherit' }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: '#6b7280', fontSize: '0.8rem' }}>{formatDate(s.createdDate)}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Sửa thông tin">
                                                <IconButton size="small" onClick={() => handleOpenEdit(s)} sx={{ color: '#6366f1' }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={s.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                                <IconButton size="small" onClick={() => handleToggleActive(s)}
                                                    sx={{ color: s.isActive ? '#ef4444' : '#22c55e' }}>
                                                    {s.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reset mật khẩu">
                                                <IconButton size="small" onClick={() => handleResetPassword(s)} sx={{ color: '#f59e0b' }}>
                                                    <LockResetIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {staffList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                            <PeopleIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                                            <Typography sx={{ color: '#9ca3af', fontWeight: 500 }}>Chưa có nhân viên nào</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* ===== MODAL THÊM / SỬA NHÂN VIÊN ===== */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editingId ? 'Cập Nhật Nhân Viên' : 'Thêm Nhân Viên Mới'}
                </DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {!editingId && (
                            <>
                                <TextField
                                    label="Username (mã nhân viên)" required fullWidth size="small"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    helperText="Sẽ dùng làm mật khẩu mặc định khi reset"
                                />
                                <TextField
                                    label="Mật khẩu" required fullWidth size="small" type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    helperText="Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt"
                                />
                            </>
                        )}
                        <TextField
                            label="Họ và tên" required fullWidth size="small"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        />
                        <TextField
                            label="Số điện thoại" required fullWidth size="small"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                        <TextField
                            label="Email" fullWidth size="small"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <TextField
                            label="Vai trò" required fullWidth size="small" select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <MenuItem value="Cashier">Thu ngân (Cashier)</MenuItem>
                            <MenuItem value="Kitchen">Nhà bếp (Kitchen)</MenuItem>
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Lương" fullWidth size="small" type="number"
                                value={form.salary}
                                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                                InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment> }}
                            />
                            <TextField
                                label="Hệ số lương" size="small" type="number" sx={{ width: 160 }}
                                value={form.salaryCoefficient}
                                onChange={(e) => setForm({ ...form, salaryCoefficient: e.target.value })}
                                inputProps={{ step: 0.1, min: 0.1 }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none' }}>Hủy</Button>
                    <Button
                        variant="contained" onClick={handleSubmit} disabled={submitting}
                        sx={{ bgcolor: '#9333ea', textTransform: 'none', '&:hover': { bgcolor: '#7e22ce' } }}
                    >
                        {submitting ? <CircularProgress size={20} /> : editingId ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuanLyNhanVien;
