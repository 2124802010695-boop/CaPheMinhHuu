import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Grid, Card, CardContent, Typography, Button,
    Chip, Skeleton, Alert, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, LinearProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import { getDashboardStats, getDashboardRangeStats } from '../services/dashboardService';
import { onConnectionReady, onReceiveNewOrder, onOrderPaid } from '../../../common/utils/signalRConnection';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const fmtVND = (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(v) + 'đ';
const fmtFull = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ';

function StatCard({ icon, label, value, sub, color, loading }) {
    const theme = useTheme();
    return (
        <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}
                            textTransform="uppercase" letterSpacing={1}>
                            {label}
                        </Typography>
                        {loading ? <Skeleton width={120} height={40} /> : (
                            <Typography variant="h5" fontWeight={800} color={color || 'text.primary'} mt={0.5}>
                                {value}
                            </Typography>
                        )}
                        {sub && !loading && (
                            <Typography variant="caption" color="text.secondary">{sub}</Typography>
                        )}
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}20` }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
    const theme = useTheme();

    // Today-centric stats
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);
    const [chartDays, setChartDays] = useState(30);

    // Range stats
    const [rangeStats, setRangeStats] = useState(null);
    const [loadingRange, setLoadingRange] = useState(false);
    const [errorRange, setErrorRange] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        const now = new Date();
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    });

    // UI
    const [stockOpen, setStockOpen] = useState(false);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        setErrorStats(null);
        try {
            const data = await getDashboardStats(chartDays);
            setStats(data);
        } catch {
            setErrorStats('Không thể tải dữ liệu dashboard');
        } finally {
            setLoadingStats(false);
        }
    }, [chartDays]);

    const fetchRangeStats = useCallback(async () => {
        setLoadingRange(true);
        setErrorRange(null);
        try {
            const data = await getDashboardRangeStats(new Date(fromDate), new Date(toDate));
            setRangeStats(data);
        } catch {
            setErrorRange('Không thể tải dữ liệu theo khoảng thời gian');
        } finally {
            setLoadingRange(false);
        }
    }, [fromDate, toDate]);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchRangeStats(); }, []);  // chỉ chạy 1 lần khi mount

    // SignalR real-time refresh
    useEffect(() => {
        let offNew  = () => {};
        let offPaid = () => {};
        const cleanup = onConnectionReady(() => {
            offNew  = onReceiveNewOrder(() => fetchStats()) || (() => {});
            offPaid = onOrderPaid(() => { fetchStats(); fetchRangeStats(); }) || (() => {});
        });
        return () => { offNew(); offPaid(); cleanup(); };
    }, [fetchStats, fetchRangeStats]);

    // Chart data — fix: convert ISO date string directly, không re-parse
    const chartData = (stats?.revenueByDay || []).map(d => ({
        date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: d.revenue,
        orders: d.orderCount,
    }));

    const rangeChartData = (rangeStats?.revenueByDay || []).map(d => ({
        date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: d.revenue,
        orders: d.orderCount,
    }));

    const paymentData = (rangeStats?.revenueByPaymentMethod || []).map(d => ({
        name: d.paymentMethod === 'Cash'     ? 'Tiền mặt' :
              d.paymentMethod === 'Transfer' ? 'Chuyển khoản' :
              d.paymentMethod === 'Card'     ? 'Thẻ' : d.paymentMethod,
        value: d.revenue,
        count: d.orderCount,
    }));

    const toppingData = (rangeStats?.topToppings || []).map(d => ({
        name: d.toppingName,
        qty: d.quantity,
        revenue: d.revenue,
    }));

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">

                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>Bảng điều khiển</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {new Date().toLocaleDateString('vi-VN', {
                                weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                        </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />}
                        onClick={() => { fetchStats(); fetchRangeStats(); }}>
                        Làm mới
                    </Button>
                </Box>

                {errorStats && <Alert severity="error" sx={{ mb: 3 }}>{errorStats}</Alert>}

                {/* Stat Cards */}
                <Grid container spacing={3} mb={4}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard icon={<TrendingUpIcon sx={{ color: '#10b981' }} />}
                            label="Doanh thu hôm nay" loading={loadingStats}
                            value={fmtFull(stats?.todayRevenue || 0)}
                            sub={`Tuần: ${fmtVND(stats?.weekRevenue || 0)}`}
                            color="#10b981" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard icon={<TrendingUpIcon sx={{ color: '#8b5cf6' }} />}
                            label="Doanh thu tháng" loading={loadingStats}
                            value={fmtFull(stats?.monthRevenue || 0)}
                            color="#8b5cf6" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard icon={<ShoppingCartIcon sx={{ color: '#3b82f6' }} />}
                            label="Đơn hôm nay" loading={loadingStats}
                            value={stats?.todayOrders ?? '—'}
                            sub={`Đang chờ: ${stats?.pendingOrders ?? 0}`}
                            color="#3b82f6" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard icon={<PendingActionsIcon sx={{ color: '#f59e0b' }} />}
                            label="Tỷ lệ hủy đơn" loading={loadingStats}
                            value={`${(stats?.cancellationRate || 0).toFixed(1)}%`}
                            color="#f59e0b" />
                    </Grid>
                </Grid>

                {/* Low Stock Banner */}
                {!loadingStats && (
                    <Paper sx={{
                        p: 2, mb: 4, borderRadius: 3,
                        bgcolor: (stats?.lowStockCount || 0) > 0 ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${(stats?.lowStockCount || 0) > 0 ? '#fca5a5' : '#86efac'}`
                    }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            {(stats?.lowStockCount || 0) > 0
                                ? <WarningAmberIcon sx={{ color: '#ef4444' }} />
                                : <CheckCircleIcon sx={{ color: '#10b981' }} />
                            }
                            <Typography fontWeight={600}
                                color={(stats?.lowStockCount || 0) > 0 ? '#dc2626' : '#16a34a'}>
                                {(stats?.lowStockCount || 0) > 0
                                    ? `${stats.lowStockCount} nguyên liệu sắp hết`
                                    : 'Tồn kho ổn định'}
                            </Typography>
                            {(stats?.lowStockCount || 0) > 0 && (
                                <Button size="small" color="error" onClick={() => setStockOpen(true)}>
                                    Xem chi tiết
                                </Button>
                            )}
                        </Box>
                    </Paper>
                )}

                {/* Chart - Revenue by day (today-centric, N days) */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={700}>Doanh thu theo ngày</Typography>
                        <Box display="flex" gap={1}>
                            {[7, 14, 30].map(d => (
                                <Button key={d} size="small"
                                    variant={chartDays === d ? 'contained' : 'outlined'}
                                    onClick={() => setChartDays(d)}>
                                    {d} ngày
                                </Button>
                            ))}
                        </Box>
                    </Box>
                    {loadingStats && <LinearProgress sx={{ mb: 1 }} />}
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={fmtVND} tick={{ fontSize: 11 }} width={70} />
                            <RechartsTooltip formatter={(v) => [fmtFull(v), 'Doanh thu']} />
                            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6"
                                fill="url(#colorRevenue)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Range Stats Section */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                        Phân tích theo khoảng thời gian
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center" mb={3} flexWrap="wrap">
                        <TextField label="Từ ngày" type="date" size="small"
                            value={fromDate} onChange={e => setFromDate(e.target.value)}
                            InputLabelProps={{ shrink: true }} />
                        <TextField label="Đến ngày" type="date" size="small"
                            value={toDate} onChange={e => setToDate(e.target.value)}
                            InputLabelProps={{ shrink: true }} />
                        <Button variant="contained" onClick={fetchRangeStats} disabled={loadingRange}>
                            Xem báo cáo
                        </Button>
                        {rangeStats && (
                            <Box display="flex" gap={3} ml={2} flexWrap="wrap">
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tổng doanh thu</Typography>
                                    <Typography variant="h6" fontWeight={800} color="#10b981">
                                        {fmtFull(rangeStats.totalRevenue)}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tổng đơn</Typography>
                                    <Typography variant="h6" fontWeight={800} color="#3b82f6">
                                        {rangeStats.totalOrders}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tỷ lệ hủy</Typography>
                                    <Typography variant="h6" fontWeight={800} color="#f59e0b">
                                        {rangeStats.cancellationRate.toFixed(1)}%
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {errorRange && <Alert severity="error" sx={{ mb: 2 }}>{errorRange}</Alert>}
                    {loadingRange && <LinearProgress sx={{ mb: 2 }} />}

                    {rangeStats && (
                        <Grid container spacing={3}>
                            {/* Revenue by day - range */}
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                                    Doanh thu theo ngày
                                </Typography>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={rangeChartData}>
                                        <defs>
                                            <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis tickFormatter={fmtVND} tick={{ fontSize: 10 }} width={65} />
                                        <RechartsTooltip formatter={(v) => [fmtFull(v), 'Doanh thu']} />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981"
                                            fill="url(#colorRange)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Grid>

                            {/* Payment method pie */}
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                                    Phương thức thanh toán
                                </Typography>
                                {paymentData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie data={paymentData} dataKey="value" nameKey="name"
                                                cx="50%" cy="50%" outerRadius={75}
                                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}>
                                                {paymentData.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(v) => fmtFull(v)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Box display="flex" alignItems="center" justifyContent="center" height={220}>
                                        <Typography color="text.secondary">Không có dữ liệu</Typography>
                                    </Box>
                                )}
                            </Grid>

                            {/* Top Products */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>Top sản phẩm</Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>#</TableCell>
                                                <TableCell>Sản phẩm</TableCell>
                                                <TableCell align="right">SL</TableCell>
                                                <TableCell align="right">Doanh thu</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(rangeStats.topProducts || []).map((p, i) => (
                                                <TableRow key={i} hover>
                                                    <TableCell>
                                                        <Chip label={i + 1} size="small"
                                                            color={i === 0 ? 'warning' : 'default'} />
                                                    </TableCell>
                                                    <TableCell>{p.productName}</TableCell>
                                                    <TableCell align="right">{p.quantity}</TableCell>
                                                    <TableCell align="right">{fmtVND(p.revenue)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            {/* Top Toppings */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={1}>Top topping</Typography>
                                {toppingData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={toppingData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis type="number" tickFormatter={fmtVND} tick={{ fontSize: 10 }} />
                                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                                            <RechartsTooltip formatter={(v, n) => [
                                                n === 'revenue' ? fmtFull(v) : v,
                                                n === 'revenue' ? 'Doanh thu' : 'Số lượng'
                                            ]} />
                                            <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Box display="flex" alignItems="center" justifyContent="center" height={220}>
                                        <Typography color="text.secondary">Không có dữ liệu</Typography>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </Paper>

                {/* Staff Summary */}
                {(stats?.staffShiftSummary || []).length > 0 && (
                    <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} mb={2}>
                            Thống kê nhân sự tháng này
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nhân viên</TableCell>
                                        <TableCell>Vai trò</TableCell>
                                        <TableCell align="right">Ca làm</TableCell>
                                        <TableCell align="right">Giờ làm</TableCell>
                                        <TableCell align="right">Doanh thu</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(stats.staffShiftSummary || []).map((s, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell>{s.fullName}</TableCell>
                                            <TableCell>
                                                <Chip label={s.role} size="small"
                                                    color={s.role === 'Cashier' ? 'primary' : 'default'} />
                                            </TableCell>
                                            <TableCell align="right">{s.totalShifts}</TableCell>
                                            <TableCell align="right">{s.totalHours?.toFixed(1)}h</TableCell>
                                            <TableCell align="right">{fmtVND(s.totalRevenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}

            </Container>

            {/* Low Stock Dialog */}
            <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nguyên liệu sắp hết</DialogTitle>
                <DialogContent>
                    <List dense>
                        {(stats?.lowStockItems || []).map((item) => (
                            <ListItem key={item.id} divider>
                                <ListItemText
                                    primary={item.name}
                                    secondary={`Còn: ${item.currentStock} ${item.baseUnit} / Tối thiểu: ${item.minStock} ${item.baseUnit}`}
                                />
                                <LinearProgress variant="determinate"
                                    value={Math.min(100, (item.currentStock / item.minStock) * 100)}
                                    color="error" sx={{ width: 80, ml: 2 }} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStockOpen(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}