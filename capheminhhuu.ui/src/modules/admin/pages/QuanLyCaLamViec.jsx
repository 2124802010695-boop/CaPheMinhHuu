import React, { useEffect, useRef, useState } from 'react';
import {
    Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography, IconButton,
    Chip, Avatar, Tabs, Tab, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Tooltip, CircularProgress, Alert, Snackbar
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import * as signalR from '@microsoft/signalr';
import {
    getPendingShiftsAPI, approveShiftAPI, rejectShiftAPI,
    getAllShiftsAPI, adminGetZReportAPI
} from '../../cashier/services/shiftService';
import axios from '../../../common/utils/axiosCustomize';

const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + 'đ';
const formatDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const BUSINESS_OPEN = 8;
const BUSINESS_CLOSE = 22;

const STATUS_MAP = {
    'PendingOpen':     { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' },
    'PendingApproval': { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' },
    'Open':            { label: 'Đang mở',   color: '#22c55e', bg: '#dcfce7' },
    'Closed':          { label: 'Đã đóng',   color: '#6366f1', bg: '#e0e7ff' },
    'Approved':        { label: 'Đã duyệt',  color: '#22c55e', bg: '#dcfce7' },
    'Rejected':        { label: 'Từ chối',   color: '#ef4444', bg: '#fee2e2' },
};

const getShiftDurationHours = (openTime) => {
    if (!openTime) return 0;
    return (new Date() - new Date(openTime)) / (1000 * 60 * 60);
};

const isOutsideBusinessHours = () => {
    const h = new Date().getHours();
    return h < BUSINESS_OPEN || h >= BUSINESS_CLOSE;
};

const isShiftOvertime = (openTime) => {
    if (!openTime) return false;
    return getShiftDurationHours(openTime) > 14 || isOutsideBusinessHours();
};

const isPending = (status) => status === 'PendingOpen' || status === 'PendingApproval';

const QuanLyCaLamViec = () => {
    const [tab, setTab] = useState(0);
    const [pendingShifts, setPendingShifts] = useState([]);
    const [allShifts, setAllShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState({ open: false, shiftId: null });
    const [rejectReason, setRejectReason] = useState('');
    const [forceCloseModal, setForceCloseModal] = useState({ open: false, shift: null });
    const [reportModal, setReportModal] = useState({ open: false, data: null, loading: false });
    const [notification, setNotification] = useState({ open: false, message: '' });
    const connectionRef = useRef(null);
    const [, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`https://localhost:7280/appHub?access_token=${token}`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();
        connection.start()
            .then(() => {
                connection.on('ShiftPendingApproval', (data) => {
                    setNotification({ open: true, message: `🔔 ${data.message}` });
                    fetchDataRef.current?.();
                });
                connection.on('ShiftClosed', (data) => {
                    setNotification({ open: true, message: `✅ ${data.message}` });
                    fetchDataRef.current?.();
                });
            })
            .catch(err => console.warn('[SignalR] Kết nối AppHub thất bại:', err));
        connectionRef.current = connection;
        return () => { connection.stop(); };
    }, []);

    useEffect(() => { fetchData(); }, [tab]);

    const fetchDataRef = useRef(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            if (tab === 0) {
                const data = await getPendingShiftsAPI();
                setPendingShifts(Array.isArray(data) ? data : []);
            } else {
                const data = await getAllShiftsAPI();
                setAllShifts(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Lỗi tải ca:', err);
        }
        setLoading(false);
    };
    fetchDataRef.current = fetchData;

    const handleApprove = async (shiftId) => {
        if (!window.confirm('Xác nhận DUYỆT ca này?')) return;
        try {
            await approveShiftAPI(shiftId);
            setNotification({ open: true, message: `✅ Đã duyệt ca #${shiftId}` });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi duyệt ca');
        }
    };

    const handleReject = async () => {
        try {
            await rejectShiftAPI(rejectModal.shiftId, rejectReason || 'Không đủ điều kiện');
            setNotification({ open: true, message: `❌ Đã từ chối ca #${rejectModal.shiftId}` });
            setRejectModal({ open: false, shiftId: null });
            setRejectReason('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi từ chối ca');
        }
    };

    const handleForceClose = async () => {
        const shift = forceCloseModal.shift;
        if (!shift) return;
        try {
            await axios.post(`/Shift/admin/force-close/${shift.id}`);
            setNotification({ open: true, message: `🔒 Đã đóng ca #${shift.id}` });
            setForceCloseModal({ open: false, shift: null });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi đóng ca');
        }
    };

    const handleViewReport = async (shiftId) => {
        setReportModal({ open: true, data: null, loading: true });
        try {
            const data = await adminGetZReportAPI(shiftId);
            setReportModal({ open: true, data, loading: false });
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể tải Z-Report');
            setReportModal({ open: false, data: null, loading: false });
        }
    };

    const getStatusChip = (status) => {
        const cfg = STATUS_MAP[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
        return <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600 }} />;
    };

    const currentList = tab === 0 ? pendingShifts : allShifts;
    const openShifts = allShifts.filter(s => s.status === 'Open');
    const overtimeShifts = openShifts.filter(s => isShiftOvertime(s.openTime));

    return (
        <Box sx={{ p: 3, minHeight: '100vh' }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#fef3c7', width: 48, height: 48 }}>
                            <AccessTimeIcon sx={{ color: '#d97706', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Quản Lý Ca Làm Việc</Typography>
                            <Typography variant="body2" color="text.secondary">Duyệt yêu cầu mở ca, quản lý ca đang mở, xem lịch sử và Z-Report</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip icon={<NotificationsActiveIcon sx={{ fontSize: 14 }} />} label="Real-time" size="small"
                            sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600, fontSize: 11 }} />
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ textTransform: 'none' }}>Làm mới</Button>
                    </Box>
                </Box>
            </Paper>

            {isOutsideBusinessHours() && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    ⏰ Ngoài giờ hoạt động ({BUSINESS_OPEN}:00 – {BUSINESS_CLOSE}:00).
                    {overtimeShifts.length > 0 ? ` Có ${overtimeShifts.length} ca đang mở quá giờ — cần đóng ca!` : ' Không có ca nào đang mở.'}
                </Alert>
            )}
            {overtimeShifts.length > 0 && !isOutsideBusinessHours() && (
                <Alert severity="error" sx={{ mb: 2 }}>🚨 Có {overtimeShifts.length} ca mở quá 14 tiếng! Cần đóng ca chủ động.</Alert>
            )}

            <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
                    <Tab label={`Chờ duyệt (${pendingShifts.length})`} />
                    <Tab label="Tất cả ca" />
                </Tabs>
            </Paper>

            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#d97706' }} />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: 'background.default' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Mã ca</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Loại ca</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thời gian mở</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thời gian đóng</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Tiền đầu ca</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Doanh thu</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentList.map((shift) => {
                                    const overtime = shift.status === 'Open' && isShiftOvertime(shift.openTime);
                                    const durationHrs = shift.status === 'Open' ? getShiftDurationHours(shift.openTime).toFixed(1) : null;
                                    return (
                                        <TableRow key={shift.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, bgcolor: overtime ? '#fef2f2' : 'inherit' }}>
                                            <TableCell><Chip label={`#${shift.id}`} size="small" sx={{ bgcolor: 'action.hover', fontWeight: 600 }} /></TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={shift.shiftType === 'Kitchen' ? '👨‍🍳 Bếp' : '💰 Thu ngân'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: shift.shiftType === 'Kitchen' ? '#fef3c7' : '#dbeafe',
                                                        color: shift.shiftType === 'Kitchen' ? '#d97706' : '#1d4ed8',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{shift.userName || '—'}</TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem' }}>{formatDateTime(shift.openTime)}</TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem' }}>{formatDateTime(shift.closeTime)}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{formatVND(shift.openingCash)}</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#059669' }}>{shift.totalRevenue != null ? formatVND(shift.totalRevenue) : '—'}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getStatusChip(shift.status)}
                                                    {overtime && <Chip icon={<WarningAmberIcon sx={{ fontSize: 14 }} />} label={`${durationHrs}h`} size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.7rem' }} />}
                                                    {shift.status === 'Open' && !overtime && durationHrs && <Chip label={`${durationHrs}h`} size="small" variant="outlined" sx={{ fontWeight: 500, fontSize: '0.7rem' }} />}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                {isPending(shift.status) && (
                                                    <>
                                                        <Tooltip title="Duyệt ca">
                                                            <IconButton size="small" onClick={() => handleApprove(shift.id)} sx={{ color: '#22c55e' }}>
                                                                <CheckCircleIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Từ chối">
                                                            <IconButton size="small" onClick={() => setRejectModal({ open: true, shiftId: shift.id })} sx={{ color: '#ef4444' }}>
                                                                <CancelIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                {shift.status === 'Open' && (
                                                    <Tooltip title="Đóng ca chủ động">
                                                        <IconButton size="small" onClick={() => setForceCloseModal({ open: true, shift })} sx={{ color: overtime ? '#dc2626' : '#d97706' }}>
                                                            <StopCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {(shift.status === 'Closed' || shift.status === 'Approved') && shift.shiftType !== 'Kitchen' && (
                                                    <Tooltip title="Xem Z-Report">
                                                        <IconButton size="small" onClick={() => handleViewReport(shift.id)} sx={{ color: '#6366f1' }}>
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {currentList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                                            <AccessTimeIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1, display: 'block', mx: 'auto' }} />
                                            <Typography color="text.secondary">{tab === 0 ? 'Không có ca nào chờ duyệt' : 'Chưa có ca nào trong hệ thống'}</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={rejectModal.open} onClose={() => setRejectModal({ open: false, shiftId: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Từ Chối Ca</DialogTitle>
                <DialogContent>
                    <TextField label="Lý do từ chối" fullWidth multiline rows={3} sx={{ mt: 1 }}
                        value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="VD: Tiền đầu ca không khớp, chưa kiểm kê..." />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRejectModal({ open: false, shiftId: null })} sx={{ textTransform: 'none' }}>Hủy</Button>
                    <Button variant="contained" color="error" onClick={handleReject} sx={{ textTransform: 'none' }}>Xác nhận từ chối</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={forceCloseModal.open} onClose={() => setForceCloseModal({ open: false, shift: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: '#dc2626' }}>⚠️ Đóng Ca Chủ Động</DialogTitle>
                <DialogContent>
                    {forceCloseModal.shift && (
                        <Box sx={{ mt: 1 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                Đóng ca <b>#{forceCloseModal.shift.id}</b> của <b>{forceCloseModal.shift.userName}</b>. Tiền cuối ca = 0đ.
                            </Alert>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box><Typography variant="caption" color="text.secondary">Thu ngân</Typography><Typography fontWeight={600}>{forceCloseModal.shift.userName}</Typography></Box>
                                <Box><Typography variant="caption" color="text.secondary">Tiền đầu ca</Typography><Typography fontWeight={600}>{formatVND(forceCloseModal.shift.openingCash)}</Typography></Box>
                                <Box><Typography variant="caption" color="text.secondary">Mở ca lúc</Typography><Typography fontWeight={600}>{formatDateTime(forceCloseModal.shift.openTime)}</Typography></Box>
                                <Box><Typography variant="caption" color="text.secondary">Thời gian mở</Typography><Typography fontWeight={600} color="error">{getShiftDurationHours(forceCloseModal.shift.openTime).toFixed(1)} giờ</Typography></Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setForceCloseModal({ open: false, shift: null })} sx={{ textTransform: 'none' }}>Hủy</Button>
                    <Button variant="contained" color="error" onClick={handleForceClose} sx={{ textTransform: 'none' }}>Xác nhận đóng ca</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={reportModal.open} onClose={() => setReportModal({ open: false, data: null, loading: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Z-Report — Ca #{reportModal.data?.shiftId}</DialogTitle>
                <DialogContent>
                    {reportModal.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                    ) : reportModal.data ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}><Typography variant="caption" color="text.secondary">Thu ngân</Typography><Typography fontWeight={600}>{reportModal.data.cashierName}</Typography></Paper>
                                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}><Typography variant="caption" color="text.secondary">Tổng đơn</Typography><Typography fontWeight={600}>{reportModal.data.totalOrders}</Typography></Paper>
                                <Paper sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 2 }}><Typography variant="caption" color="text.secondary">Tổng doanh thu</Typography><Typography fontWeight={700} color="#059669">{formatVND(reportModal.data.totalRevenue)}</Typography></Paper>
                                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Chênh lệch</Typography>
                                    <Typography fontWeight={600} color={reportModal.data.difference === 0 ? '#059669' : reportModal.data.difference < 0 ? '#dc2626' : '#d97706'}>
                                        {reportModal.data.difference != null ? formatVND(reportModal.data.difference) : '— (Blind Close)'}
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportModal({ open: false, data: null, loading: false })} sx={{ textTransform: 'none' }}>Đóng</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={notification.open} autoHideDuration={4000}
                onClose={() => setNotification({ open: false, message: '' })}
                message={notification.message} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
        </Box>
    );
};

export default QuanLyCaLamViec;