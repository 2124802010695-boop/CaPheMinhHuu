import React, { useEffect, useState } from 'react';
import {
    Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography, IconButton,
    Chip, Avatar, Tabs, Tab, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Tooltip, CircularProgress
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    getPendingShiftsAPI, approveShiftAPI, rejectShiftAPI,
    getAllShiftsAPI, adminGetZReportAPI
} from '../../services/shiftService';

const formatVND = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + 'đ';
const formatDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const STATUS_MAP = {
    'PendingApproval': { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' },
    'Open': { label: 'Đang mở', color: '#22c55e', bg: '#dcfce7' },
    'Closed': { label: 'Đã đóng', color: '#6366f1', bg: '#e0e7ff' },
    'Approved': { label: 'Đã duyệt', color: '#22c55e', bg: '#dcfce7' },
    'Rejected': { label: 'Từ chối', color: '#ef4444', bg: '#fee2e2' },
};

const QuanLyCaLamViec = () => {
    const [tab, setTab] = useState(0);
    const [pendingShifts, setPendingShifts] = useState([]);
    const [allShifts, setAllShifts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Reject modal
    const [rejectModal, setRejectModal] = useState({ open: false, shiftId: null });
    const [rejectReason, setRejectReason] = useState('');

    // Z-Report modal
    const [reportModal, setReportModal] = useState({ open: false, data: null, loading: false });

    useEffect(() => {
        fetchData();
    }, [tab]);

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

    // === DUYỆT CA ===
    const handleApprove = async (shiftId) => {
        if (!window.confirm('Xác nhận DUYỆT ca này?')) return;
        try {
            await approveShiftAPI(shiftId);
            alert('Đã duyệt ca thành công!');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi duyệt ca');
        }
    };

    // === TỪ CHỐI CA ===
    const handleReject = async () => {
        try {
            await rejectShiftAPI(rejectModal.shiftId, rejectReason || 'Không đủ điều kiện');
            alert('Đã từ chối ca!');
            setRejectModal({ open: false, shiftId: null });
            setRejectReason('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi từ chối ca');
        }
    };

    // === XEM Z-REPORT ===
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

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#fef3c7', width: 48, height: 48 }}>
                        <AccessTimeIcon sx={{ color: '#d97706', fontSize: 28 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                            Quản Lý Ca Làm Việc
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Duyệt yêu cầu mở ca, xem lịch sử và Z-Report
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Tabs */}
            <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}
                    sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
                    <Tab label={`Chờ duyệt (${pendingShifts.length})`} />
                    <Tab label="Tất cả ca" />
                </Tabs>
            </Paper>

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#d97706' }} />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Mã ca</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thu ngân</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thời gian mở</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thời gian đóng</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Tiền đầu ca</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Doanh thu</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentList.map((shift) => (
                                    <TableRow key={shift.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                        <TableCell>
                                            <Chip label={`#${shift.id}`} size="small" sx={{ bgcolor: '#f3f4f6', fontWeight: 600 }} />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{shift.userName || '—'}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{formatDateTime(shift.openTime)}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{formatDateTime(shift.closeTime)}</TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{formatVND(shift.openingCash)}</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#059669' }}>
                                            {shift.totalRevenue != null ? formatVND(shift.totalRevenue) : '—'}
                                        </TableCell>
                                        <TableCell>{getStatusChip(shift.status)}</TableCell>
                                        <TableCell align="right">
                                            {shift.status === 'PendingApproval' && (
                                                <>
                                                    <Tooltip title="Duyệt ca">
                                                        <IconButton size="small" onClick={() => handleApprove(shift.id)}
                                                            sx={{ color: '#22c55e' }}>
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Từ chối">
                                                        <IconButton size="small"
                                                            onClick={() => setRejectModal({ open: true, shiftId: shift.id })}
                                                            sx={{ color: '#ef4444' }}>
                                                            <CancelIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            {(shift.status === 'Closed' || shift.status === 'Approved') && (
                                                <Tooltip title="Xem Z-Report">
                                                    <IconButton size="small" onClick={() => handleViewReport(shift.id)}
                                                        sx={{ color: '#6366f1' }}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {currentList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                            <AccessTimeIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                                            <Typography sx={{ color: '#9ca3af' }}>
                                                {tab === 0 ? 'Không có ca nào chờ duyệt' : 'Chưa có ca nào trong hệ thống'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* ===== REJECT MODAL ===== */}
            <Dialog open={rejectModal.open} onClose={() => setRejectModal({ open: false, shiftId: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Từ Chối Ca</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Lý do từ chối" fullWidth multiline rows={3} sx={{ mt: 1 }}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="VD: Tiền đầu ca không khớp, chưa kiểm kê..."
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRejectModal({ open: false, shiftId: null })} sx={{ textTransform: 'none' }}>
                        Hủy
                    </Button>
                    <Button variant="contained" color="error" onClick={handleReject} sx={{ textTransform: 'none' }}>
                        Xác nhận từ chối
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ===== Z-REPORT MODAL ===== */}
            <Dialog open={reportModal.open} onClose={() => setReportModal({ open: false, data: null, loading: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Z-Report — Ca #{reportModal.data?.shiftId}
                </DialogTitle>
                <DialogContent>
                    {reportModal.loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : reportModal.data ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                                    <Typography variant="caption" color="textSecondary">Thu ngân</Typography>
                                    <Typography fontWeight={600}>{reportModal.data.cashierName}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                                    <Typography variant="caption" color="textSecondary">Tổng đơn</Typography>
                                    <Typography fontWeight={600}>{reportModal.data.totalOrders}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 2 }}>
                                    <Typography variant="caption" color="textSecondary">Tổng doanh thu</Typography>
                                    <Typography fontWeight={700} color="#059669">{formatVND(reportModal.data.totalRevenue)}</Typography>
                                </Paper>
                                <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                                    <Typography variant="caption" color="textSecondary">Chênh lệch</Typography>
                                    <Typography fontWeight={600}
                                        color={reportModal.data.difference === 0 ? '#059669' : reportModal.data.difference < 0 ? '#dc2626' : '#d97706'}>
                                        {reportModal.data.difference != null ? formatVND(reportModal.data.difference) : '— (Blind Close)'}
                                    </Typography>
                                </Paper>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Tiền đầu ca</Typography>
                                    <Typography>{formatVND(reportModal.data.openingCash)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Tiền cuối ca</Typography>
                                    <Typography>{formatVND(reportModal.data.closingCash)}</Typography>
                                </Box>
                            </Box>
                            {reportModal.data.topProducts?.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Top sản phẩm</Typography>
                                    {reportModal.data.topProducts.slice(0, 5).map((p, i) => (
                                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                            <Typography variant="body2">{i + 1}. {p.productName}</Typography>
                                            <Typography variant="body2" fontWeight={600}>{p.quantitySold} ly — {formatVND(p.revenue)}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportModal({ open: false, data: null, loading: false })} sx={{ textTransform: 'none' }}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuanLyCaLamViec;
