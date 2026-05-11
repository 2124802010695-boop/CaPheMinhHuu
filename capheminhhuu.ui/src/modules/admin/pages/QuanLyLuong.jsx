import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Chip, CircularProgress, Alert, Collapse, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, FormControl, InputLabel,
    Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownloadIcon from '@mui/icons-material/Download';
import PaidIcon from '@mui/icons-material/Paid';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import { getMonthlySalaryAPI } from '../services/salaryService';
import { getHolidaysAPI, createHolidayAPI, toggleHolidayAPI, deleteHolidayAPI } from '../services/holidayService';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' ₫';
const formatDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
};

// ── HolidayModal ──────────────────────────────────────────────
const HolidayModal = ({ open, onClose, month, year, salaryData, onSaved }) => {
    const [holidays, setHolidays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [staffOnDay, setStaffOnDay] = useState([]);
    const [form, setForm] = useState({ name: '', multiplier: 2 });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchHolidays = useCallback(async () => {
        try {
            const res = await getHolidaysAPI();
            setHolidays(res?.data || res || []);
        } catch { setHolidays([]); }
    }, []);

    useEffect(() => { if (open) fetchHolidays(); }, [open, fetchHolidays]);

    const holidayDates = holidays.filter(h => h.isActive).map(h => {
        const d = new Date(h.date);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    });

    const handleDayClick = (date) => {
        setSelectedDate(date);
        setError('');
        const dateStr = date.format('YYYY-MM-DD');
        const staff = [];
        (salaryData?.staffs || []).forEach(s => {
            const shiftsOnDay = s.shifts.filter(sh => dayjs(sh.openTime).format('YYYY-MM-DD') === dateStr);
            if (shiftsOnDay.length > 0) {
                staff.push({ fullName: s.fullName, role: s.role, shifts: shiftsOnDay, totalHours: shiftsOnDay.reduce((sum, sh) => sum + sh.hours, 0) });
            }
        });
        setStaffOnDay(staff);
        const existing = holidays.find(h => {
            const d = new Date(h.date);
            const hStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            return hStr === dateStr;
        });
        setForm(existing ? { name: existing.name, multiplier: existing.salaryMultiplier } : { name: '', multiplier: 2 });
    };

    const handleSave = async () => {
        if (!selectedDate) return;
        if (!form.name.trim()) { setError('Vui lòng nhập tên ngày đặc biệt'); return; }
        setSaving(true); setError('');
        try {
            await createHolidayAPI({ date: selectedDate.format('YYYY-MM-DDTHH:mm:ss'), name: form.name.trim(), salaryMultiplier: Number(form.multiplier) });
            await fetchHolidays();
            onSaved();
        } catch (err) { setError(err.response?.data?.message || 'Không thể lưu'); }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa ngày đặc biệt này?')) return;
        try { await deleteHolidayAPI(id); await fetchHolidays(); onSaved(); setSelectedDate(null); setStaffOnDay([]); } catch { }
    };

    const handleToggle = async (id) => {
        try { await toggleHolidayAPI(id); await fetchHolidays(); onSaved(); } catch { }
    };

    const selectedDateStr = selectedDate?.format('YYYY-MM-DD');
    const existingHoliday = holidays.find(h => {
        const d = new Date(h.date);
        const hStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        return hStr === selectedDateStr;
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon sx={{ color: '#f59e0b' }} /> Ngày Lương Đặc Biệt — Tháng {month}/{year}
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', minHeight: 480 }}>
                    <Box sx={{ borderRight: '1px solid #e5e7eb', flex: '0 0 320px' }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                            <DateCalendar
                                value={selectedDate}
                                onChange={handleDayClick}
                                defaultCalendarMonth={dayjs(`${year}-${String(month).padStart(2, '0')}-01`)}
                                slotProps={{
                                    day: (ownerState) => ({
                                        sx: holidayDates.includes(ownerState.day.format('YYYY-MM-DD'))
                                            ? { bgcolor: '#fef08a !important', color: '#854d0e !important', fontWeight: 700 }
                                            : {}
                                    })
                                }}
                            />
                        </LocalizationProvider>
                    </Box>
                    <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {!selectedDate ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography color="text.secondary" textAlign="center">👆 Chọn một ngày trên lịch<br/>để xem nhân viên làm việc và cài đặt hệ số lương</Typography>
                            </Box>
                        ) : (
                            <>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    📅 {selectedDate.format('DD/MM/YYYY')}
                                    {existingHoliday && <Chip label={`×${existingHoliday.salaryMultiplier} — ${existingHoliday.name}`} size="small" color="warning" sx={{ ml: 1, fontWeight: 700 }} />}
                                </Typography>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">NHÂN VIÊN LÀM VIỆC:</Typography>
                                    {staffOnDay.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>Không có nhân viên nào làm việc ngày này</Typography>
                                    ) : (
                                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {staffOnDay.map((s, i) => (
                                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#f8fafc', borderRadius: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: s.role === 'Kitchen' ? '#fef3c7' : '#dbeafe' }}>
                                                        <PersonIcon sx={{ fontSize: 16, color: s.role === 'Kitchen' ? '#d97706' : '#2563eb' }} />
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={600}>{s.fullName}</Typography>
                                                    <Chip label={`${s.shifts.length} ca — ${Math.round(s.totalHours * 100) / 100}h`} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                                <Divider />
                                {existingHoliday ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">ĐÃ CÀI ĐẶT:</Typography>
                                        <Box sx={{ p: 2, bgcolor: '#fef9c3', borderRadius: 2, border: '1px solid #fde047' }}>
                                            <Typography fontWeight={700}>{existingHoliday.name}</Typography>
                                            <Typography variant="body2">Hệ số: ×{existingHoliday.salaryMultiplier}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="outlined" color="warning" size="small" onClick={() => handleToggle(existingHoliday.id)} sx={{ textTransform: 'none' }}>
                                                {existingHoliday.isActive ? 'Tắt' : 'Bật'}
                                            </Button>
                                            <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => handleDelete(existingHoliday.id)} sx={{ textTransform: 'none' }}>
                                                Xóa
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">CÀI HỆ SỐ LƯƠNG ĐẶC BIỆT:</Typography>
                                        <TextField label="Tên ngày đặc biệt" size="small" fullWidth placeholder="VD: Sinh nhật quán, Ngày lễ..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                        <FormControl size="small" fullWidth>
                                            <InputLabel>Hệ số lương</InputLabel>
                                            <Select value={form.multiplier} label="Hệ số lương" onChange={(e) => setForm({ ...form, multiplier: e.target.value })}>
                                                <MenuItem value={1.5}>×1.5 — Phụ cấp nhẹ</MenuItem>
                                                <MenuItem value={2}>×2 — Ngày lễ</MenuItem>
                                                <MenuItem value={3}>×3 — Lễ lớn / Tết</MenuItem>
                                            </Select>
                                        </FormControl>
                                        {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
                                        <Button variant="contained" onClick={handleSave} disabled={saving}
                                            sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, textTransform: 'none' }}>
                                            {saving ? <CircularProgress size={20} color="inherit" /> : '💾 Lưu hệ số'}
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb' }}>
                <Button onClick={onClose} sx={{ textTransform: 'none' }}>Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

// ── StaffRow ──────────────────────────────────────────────────
const StaffRow = ({ staff }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' }, bgcolor: open ? '#f0fdf4' : 'inherit' }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: staff.role === 'Kitchen' ? '#fef3c7' : '#dbeafe', width: 36, height: 36 }}>
                            <PersonIcon sx={{ color: staff.role === 'Kitchen' ? '#d97706' : '#2563eb', fontSize: 20 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{staff.fullName}</Typography>
                            <Chip
                                label={staff.role === 'Kitchen' ? '👨🍳 Bếp' : '💰 Thu ngân'}
                                size="small"
                                sx={{
                                    bgcolor: staff.role === 'Kitchen' ? '#fef3c7' : '#dbeafe',
                                    color: staff.role === 'Kitchen' ? '#d97706' : '#1d4ed8',
                                    fontWeight: 600, fontSize: 10, height: 18
                                }}
                            />
                        </Box>
                    </Box>
                </TableCell>
                <TableCell align="center">
                    <Chip label={`${staff.totalShifts} ca`} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell align="center">
                    <Typography fontWeight={600}>{staff.totalHours}h</Typography>
                </TableCell>
                <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">{formatVND(staff.hourlyRate)}/h</Typography>
                </TableCell>
                <TableCell align="right">
                    <Typography fontWeight={700} color="#059669" fontSize="1rem">
                        {formatVND(staff.totalSalary)}
                    </Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={6} sx={{ p: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                CHI TIẾT TỪNG CA
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {['Mã ca', 'Loại', 'Bắt đầu', 'Kết thúc', 'Giờ làm', 'Hệ số', 'Ngày lễ', 'Lương ca'].map(h => (
                                            <TableCell key={h}>
                                                <Typography variant="caption" fontWeight={700}>{h}</Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {staff.shifts.map((s) => (
                                        <TableRow key={s.shiftId} sx={{ bgcolor: s.multiplier > 1 ? '#fef9c3' : 'inherit' }}>
                                            <TableCell>
                                                <Chip label={`#${s.shiftId}`} size="small" sx={{ fontFamily: 'monospace' }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={s.shiftType === 'Kitchen' ? '👨🍳' : '💰'}
                                                    size="small" variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{formatDateTime(s.openTime)}</TableCell>
                                            <TableCell>{formatDateTime(s.closeTime)}</TableCell>
                                            <TableCell><Typography fontWeight={600}>{s.hours}h</Typography></TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`×${s.multiplier}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: s.multiplier > 1 ? '#fef08a' : '#f3f4f6',
                                                        color: s.multiplier > 1 ? '#854d0e' : '#6b7280',
                                                        fontWeight: 700
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {s.holidayName
                                                    ? <Chip label={s.holidayName} size="small" color="warning" variant="outlined" />
                                                    : <Typography variant="caption" color="text.secondary">—</Typography>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600} color="#059669">
                                                    {formatVND(s.salary)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// ── Main ──────────────────────────────────────────────────────
const QuanLyLuong = () => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [holidayModal, setHolidayModal] = useState(false);
    const [holidays, setHolidays] = useState([]);

    const fetchSalary = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getMonthlySalaryAPI(month, year);
            setData(res?.data || res);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải bảng lương');
        }
        setLoading(false);
    }, [month, year]);

    const fetchHolidays = useCallback(async () => {
        try {
            const res = await getHolidaysAPI();
            setHolidays(res?.data || res || []);
        } catch { setHolidays([]); }
    }, []);

    const handleHolidaySaved = () => { fetchSalary(); fetchHolidays(); };

    const activeHolidaysThisMonth = holidays.filter(h =>
        h.isActive && new Date(h.date).getMonth() + 1 === month && new Date(h.date).getFullYear() === year
    );

    useEffect(() => { fetchSalary(); }, [fetchSalary]);
    useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

    const handleExportExcel = () => {
        if (!data) return;
        const rows = [];
        data.staffs.forEach(staff => {
            staff.shifts.forEach(s => {
                rows.push({
                    'Nhân viên': staff.fullName,
                    'Vai trò': staff.role === 'Kitchen' ? 'Bếp' : 'Thu ngân',
                    'Mã ca': s.shiftId,
                    'Loại ca': s.shiftType,
                    'Bắt đầu': new Date(s.openTime).toLocaleString('vi-VN'),
                    'Kết thúc': new Date(s.closeTime).toLocaleString('vi-VN'),
                    'Giờ làm': s.hours,
                    'Lương/giờ': staff.hourlyRate,
                    'Hệ số': s.multiplier,
                    'Ngày lễ': s.holidayName || '',
                    'Lương ca': s.salary
                });
            });
            rows.push({
                'Nhân viên': `TỔNG — ${staff.fullName}`,
                'Vai trò': '',
                'Mã ca': '',
                'Loại ca': '',
                'Bắt đầu': '',
                'Kết thúc': '',
                'Giờ làm': staff.totalHours,
                'Lương/giờ': staff.hourlyRate,
                'Hệ số': '',
                'Ngày lễ': '',
                'Lương ca': staff.totalSalary
            });
            rows.push({});
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Luong_${month}_${year}`);
        XLSX.writeFile(wb, `BangLuong_${month}_${year}.xlsx`);
    };

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = [2024, 2025, 2026, 2027];

    return (
        <Box sx={{ p: 3, minHeight: '100vh' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#dcfce7', width: 48, height: 48 }}>
                            <PaidIcon sx={{ color: '#16a34a', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight={700}>Bảng Lương Nhân Viên</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tính lương theo giờ làm việc thực tế
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Chọn tháng */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={600}>Tháng:</Typography>
                            <select
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
                            >
                                {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                            </select>
                        </Box>
                        {/* Chọn năm */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={600}>Năm:</Typography>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </Box>
                        <Button variant="outlined" startIcon={<EventIcon />}
                            onClick={() => setHolidayModal(true)}
                            sx={{ textTransform: 'none', borderColor: '#f59e0b', color: '#d97706', '&:hover': { borderColor: '#d97706', bgcolor: '#fef9c3' } }}>
                            Ngày đặc biệt
                            {activeHolidaysThisMonth.length > 0 && (
                                <Chip label={activeHolidaysThisMonth.length} size="small" sx={{ ml: 1, height: 18, bgcolor: '#f59e0b', color: 'white', fontSize: 10 }} />
                            )}
                        </Button>
                        <Button variant="contained" startIcon={<DownloadIcon />}
                            onClick={handleExportExcel} disabled={!data || loading}
                            sx={{ bgcolor: '#16a34a', textTransform: 'none', '&:hover': { bgcolor: '#15803d' } }}>
                            Xuất Excel
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Stats */}
            {data && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                        <Typography variant="caption" color="text.secondary">Tổng nhân viên</Typography>
                        <Typography variant="h4" fontWeight={700}>{data.staffs?.length || 0}</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                        <Typography variant="caption" color="text.secondary">Tổng số ca</Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {data.staffs?.reduce((s, st) => s + st.totalShifts, 0) || 0}
                        </Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', bgcolor: '#f0fdf4' }}>
                        <Typography variant="caption" color="text.secondary">Tổng chi lương</Typography>
                        <Typography variant="h4" fontWeight={700} color="#059669">
                            {formatVND(data.totalPayout)}
                        </Typography>
                    </Paper>
                </Box>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#16a34a' }} />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                <TableRow>
                                    <TableCell sx={{ width: 50 }} />
                                    {['Nhân viên', 'Số ca', 'Tổng giờ', 'Lương/giờ', 'Thành tiền'].map(h => (
                                        <TableCell key={h} align={h === 'Thành tiền' ? 'right' : 'center'}
                                            sx={{ fontWeight: 700 }}>{h}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data?.staffs?.length > 0 ? (
                                    <>
                                        {data.staffs.map(staff => (
                                            <StaffRow key={staff.userId} staff={staff} />
                                        ))}
                                        <TableRow sx={{ bgcolor: '#f0fdf4' }}>
                                            <TableCell colSpan={4} />
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={700} color="text.secondary">
                                                    TỔNG CHI:
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="h6" fontWeight={700} color="#059669">
                                                    {formatVND(data.totalPayout)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <PaidIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1, display: 'block', mx: 'auto' }} />
                                            <Typography color="text.secondary">
                                                Không có dữ liệu lương tháng {month}/{year}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <HolidayModal open={holidayModal} onClose={() => setHolidayModal(false)}
                month={month} year={year} salaryData={data} onSaved={handleHolidaySaved} />
        </Box>
    );
};

export default QuanLyLuong;
