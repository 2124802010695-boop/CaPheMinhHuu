import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Grid, Card, CardContent, Typography, Button,
    Chip, Skeleton, Alert, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup,
    LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemIcon, ListItemText, Tooltip, IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '../services/dashboardService';

// ── Formatters ─────────────────────────────────────────────────
const fmtVND = (v) => {
    const n = Number(v) || 0;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return n.toLocaleString('vi-VN');
};
const fmtFull = (v) =>
    (Number(v) || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// ── StatCard ────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon, color, onClick, chipLabel, chipColor }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Card onClick={onClick} sx={{
            height: '100%',
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative',
            overflow: 'hidden',
            borderTop: `3px solid ${color}`,
            transition: 'transform .2s, box-shadow .2s',
            '&:hover': onClick ? {
                transform: 'translateY(-3px)',
                boxShadow: `0 8px 24px ${color}30`
            } : {},
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="caption" sx={{
                            fontFamily: '"DM Mono", monospace',
                            letterSpacing: '.06em',
                            color: 'text.secondary',
                            display: 'block',
                            mb: 1,
                        }}>
                            {title.toUpperCase()}
                        </Typography>
                        <Typography sx={{
                            fontSize: 32, fontWeight: 800,
                            letterSpacing: -1.5, lineHeight: 1,
                            color, fontFamily: '"DM Mono", monospace',
                        }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{
                                fontFamily: '"DM Mono", monospace',
                                color: 'text.secondary', mt: .5, display: 'block'
                            }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{
                        bgcolor: `${color}15`, borderRadius: 2, p: 1.2,
                        display: 'flex', alignItems: 'center',
                    }}>
                        {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
                    </Box>
                </Box>
                {chipLabel && (
                    <Chip label={chipLabel} size="small" color={chipColor || 'default'}
                        sx={{ mt: 1.5, fontFamily: '"DM Mono", monospace', fontSize: 10, fontWeight: 600 }} />
                )}
            </CardContent>
            {/* Decorative bg icon */}
            <Box sx={{
                position: 'absolute', right: -8, bottom: -8,
                opacity: isDark ? .04 : .06, fontSize: 80, lineHeight: 1,
                pointerEvents: 'none', userSelect: 'none',
            }}>
                {React.cloneElement(icon, { sx: { fontSize: 80, color } })}
            </Box>
        </Card>
    );
};

// ── Skeleton ────────────────────────────────────────────────────
const CardSkeleton = () => (
    <Card sx={{ height: '100%', borderTop: '3px solid #e0e0e0' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                    <Skeleton width="50%" height={14} sx={{ mb: 1 }} />
                    <Skeleton width="35%" height={40} />
                    <Skeleton width="60%" height={12} sx={{ mt: 1 }} />
                </Box>
                <Skeleton variant="rounded" width={48} height={48} />
            </Box>
            <Skeleton variant="rounded" width={72} height={22} sx={{ mt: 1.5 }} />
        </CardContent>
    </Card>
);

// ── Main ────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [days, setDays] = useState(30);
    const [stockOpen, setStockOpen] = useState(false);

    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDashboardStats(days);
            setStats(data);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    // Chart data
    const chartData = (stats?.revenueByDay || []).map(d => ({
        date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: d.revenue,
    })).filter(d => !isNaN(new Date(d.date)));

    const slicedChart = chartData.slice(-days);
    const totalTopRev = (stats?.topProducts || []).reduce((s, p) => s + p.revenue, 0) || 1;

    const COLORS = {
        green: '#10b981', blue: '#3b82f6',
        amber: '#f59e0b', purple: '#8b5cf6', red: '#ef4444',
    };
    const barColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280'];
    const rankColors = ['#f59e0b', '#9ca3af', '#b45309', '#374151', '#374151'];

    const cardBg = isDark ? '#111318' : '#fff';
    const borderColor = isDark ? '#ffffff0f' : '#e5e7eb';
    const mutedColor = isDark ? '#6b7280' : '#9ca3af';

    // Skeleton
    if (loading && !stats) return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Skeleton width={200} height={40} sx={{ mb: 1 }} />
            <Skeleton width={300} height={20} sx={{ mb: 4 }} />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {[0,1,2,3].map(i => (
                    <Grid key={i} item xs={12} sm={6} md={3}>
                        <CardSkeleton />
                    </Grid>
                ))}
            </Grid>
            <Skeleton variant="rounded" height={80} sx={{ mb: 3, borderRadius: 2 }} />
            <Grid container spacing={2.5}>
                <Grid item xs={12} md={8}><Skeleton variant="rounded" height={340} /></Grid>
                <Grid item xs={12} md={4}><Skeleton variant="rounded" height={340} /></Grid>
            </Grid>
        </Container>
    );

    if (error && !stats) return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchStats}>
                Thử lại
            </Button>
        </Container>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                    <Typography variant="caption" sx={{
                        fontFamily: '"DM Mono", monospace',
                        letterSpacing: '.08em', color: 'text.secondary',
                        display: 'block', mb: .5,
                    }}>
                        TỔNG QUAN KINH DOANH
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>
                        Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>
                        Xin chào, {adminUser.fullName || 'Admin'}. Đây là hoạt động mới nhất.
                    </Typography>
                </Box>
                <Button variant="outlined" startIcon={<RefreshIcon />}
                    onClick={fetchStats} disabled={loading}
                    sx={{ textTransform: 'none', fontFamily: '"DM Mono", monospace', fontSize: 12 }}>
                    {loading ? 'Đang tải...' : 'Làm mới'}
                </Button>
            </Box>

            {error && (
                <Alert severity="warning" onClose={() => setError(null)} sx={{ mb: 3 }}>
                    {error} — Đang hiển thị dữ liệu cũ.
                </Alert>
            )}

            {/* Stat Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Doanh thu hôm nay"
                        value={fmtVND(stats?.todayRevenue)}
                        subtitle={`Tuần: ${fmtVND(stats?.weekRevenue)}`}
                        icon={<TrendingUpIcon />} color={COLORS.green} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Đơn hàng hôm nay"
                        value={stats?.todayOrders ?? 0}
                        subtitle="Tổng đơn trong ngày"
                        icon={<ShoppingCartIcon />} color={COLORS.blue} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Đang chờ xử lý"
                        value={stats?.pendingOrders ?? 0}
                        icon={<PendingActionsIcon />}
                        color={(stats?.pendingOrders ?? 0) > 0 ? COLORS.amber : mutedColor}
                        chipLabel={(stats?.pendingOrders ?? 0) > 0 ? 'Đang chờ' : 'Trống'}
                        chipColor={(stats?.pendingOrders ?? 0) > 0 ? 'warning' : 'default'} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Doanh thu tháng"
                        value={fmtVND(stats?.monthRevenue)}
                        subtitle={`Tuần này: ${fmtVND(stats?.weekRevenue)}`}
                        icon={<CalendarMonthIcon />} color={COLORS.purple} />
                </Grid>
            </Grid>

            {/* Alert Banner */}
            {(stats?.lowStockCount ?? 0) > 0 ? (
                <Paper onClick={() => setStockOpen(true)} sx={{
                    mb: 3, p: '16px 24px',
                    display: 'flex', alignItems: 'center', gap: 2,
                    border: `1px solid ${COLORS.red}30`,
                    bgcolor: isDark ? '#12080a' : '#fff5f5',
                    borderTop: `3px solid ${COLORS.red}`,
                    cursor: 'pointer', transition: '.15s',
                    '&:hover': { borderColor: COLORS.red, boxShadow: `0 0 0 1px ${COLORS.red}` },
                }}>
                    <Typography sx={{
                        fontSize: 36, fontWeight: 800, color: COLORS.red,
                        fontFamily: '"DM Mono", monospace', letterSpacing: -2, minWidth: 70,
                    }}>
                        {stats.lowStockCount}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{
                            fontFamily: '"DM Mono", monospace', color: `${COLORS.red}80`,
                            letterSpacing: '.06em', display: 'block', mb: .3,
                        }}>
                            CẢNH BÁO TỒN KHO
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color={COLORS.red}>
                            Nguyên liệu dưới mức tối thiểu
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Kiểm tra và bổ sung kho ngay để tránh gián đoạn.
                        </Typography>
                    </Box>
                    <Button variant="outlined" color="error" size="small"
                        sx={{ fontFamily: '"DM Mono", monospace', fontSize: 11, textTransform: 'none' }}
                        onClick={e => { e.stopPropagation(); navigate('/admin/quanlykho'); }}>
                        Đi đến Kho →
                    </Button>
                </Paper>
            ) : (
                <Paper sx={{
                    mb: 3, p: '14px 24px',
                    display: 'flex', alignItems: 'center', gap: 2,
                    border: `1px solid ${COLORS.green}30`,
                    bgcolor: isDark ? '#081210' : '#f0fdf4',
                    borderTop: `3px solid ${COLORS.green}`,
                }}>
                    <CheckCircleIcon sx={{ color: COLORS.green }} />
                    <Box>
                        <Typography variant="body2" fontWeight={700} color={COLORS.green}>
                            Tồn kho ổn định
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Tất cả nguyên liệu trên mức tối thiểu.
                        </Typography>
                    </Box>
                </Paper>
            )}

            {/* Chart + Top Products */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="body2" fontWeight={700} sx={{
                                fontFamily: '"DM Mono", monospace', letterSpacing: '.04em'
                            }}>
                                DOANH THU THEO NGÀY
                            </Typography>
                            <ToggleButtonGroup value={days} exclusive size="small"
                                onChange={(_, v) => v && setDays(v)}>
                                <ToggleButton value={7} sx={{ fontFamily: '"DM Mono", monospace', fontSize: 11 }}>
                                    7 ngày
                                </ToggleButton>
                                <ToggleButton value={30} sx={{ fontFamily: '"DM Mono", monospace', fontSize: 11 }}>
                                    30 ngày
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {loading && <LinearProgress sx={{ mb: 1 }} />}

                        {slicedChart.length < 2 ? (
                            <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary"
                                    sx={{ fontFamily: '"DM Mono", monospace' }}>
                                    Chưa có dữ liệu doanh thu
                                </Typography>
                            </Box>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={slicedChart}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.purple} stopOpacity={isDark ? .3 : .15} />
                                            <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3"
                                        stroke={isDark ? '#ffffff08' : '#f0f0f0'} />
                                    <XAxis dataKey="date"
                                        tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: mutedColor }}
                                        axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={fmtVND}
                                        tick={{ fontSize: 10, fontFamily: 'DM Mono', fill: mutedColor }}
                                        axisLine={false} tickLine={false} width={48} />
                                    <RechartsTooltip
                                        contentStyle={{
                                            background: cardBg,
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: 8, fontSize: 12,
                                            fontFamily: 'DM Mono',
                                        }}
                                        formatter={(v) => [fmtFull(v), 'Doanh thu']}
                                        labelStyle={{ fontWeight: 700 }}
                                    />
                                    <Area type="monotone" dataKey="revenue"
                                        stroke={COLORS.purple} strokeWidth={2}
                                        fill="url(#colorRev)" animationDuration={600} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="body2" fontWeight={700}
                                sx={{ fontFamily: '"DM Mono", monospace', letterSpacing: '.04em' }}>
                                TOP SẢN PHẨM
                            </Typography>
                            <Typography variant="caption"
                                sx={{ fontFamily: '"DM Mono", monospace', color: 'text.secondary' }}>
                                THÁNG NÀY
                            </Typography>
                        </Box>
                        {(stats?.topProducts || []).length === 0 ? (
                            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary"
                                    sx={{ fontFamily: '"DM Mono", monospace' }}>
                                    Chưa có dữ liệu
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        {stats.topProducts.map((p, i) => (
                                            <TableRow key={i} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                <TableCell sx={{ pl: 0, width: 28 }}>
                                                    <Box sx={{
                                                        width: 22, height: 22, borderRadius: 1,
                                                        bgcolor: `${rankColors[i]}20`,
                                                        color: rankColors[i],
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 10, fontFamily: '"DM Mono", monospace', fontWeight: 700,
                                                    }}>
                                                        {i + 1}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>
                                                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 130 }}>
                                                        {p.productName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontFamily: '"DM Mono", monospace', fontSize: 12, color: 'text.secondary' }}>
                                                    {p.quantity}
                                                </TableCell>
                                                <TableCell align="right" sx={{ width: 56 }}>
                                                    <Box sx={{ position: 'relative', height: 3, bgcolor: isDark ? '#ffffff10' : '#f0f0f0', borderRadius: 2 }}>
                                                        <Box sx={{
                                                            position: 'absolute', left: 0, top: 0, height: 3,
                                                            width: `${Math.round(p.revenue / totalTopRev * 100)}%`,
                                                            bgcolor: barColors[i], borderRadius: 2,
                                                        }} />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Quick Links */}
            <Typography variant="caption" sx={{
                fontFamily: '"DM Mono", monospace', letterSpacing: '.08em',
                color: 'text.secondary', display: 'block', mb: 1.5,
            }}>
                TRUY CẬP NHANH
            </Typography>
            <Grid container spacing={1.5}>
                {[
                    { label: 'Sản phẩm', icon: <RestaurantMenuIcon />, path: '/admin/quanlysanpham', color: '#3b82f6' },
                    { label: 'Danh mục', icon: <CategoryIcon />, path: '/admin/quanlydanhmuc', color: '#10b981' },
                    { label: 'Kho & NL', icon: <InventoryIcon />, path: '/admin/quanlykho', color: '#f59e0b' },
                    { label: 'Nhân viên', icon: <PeopleIcon />, path: '/admin/quanlynhanvien', color: '#8b5cf6' },
                ].map((item, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <Card onClick={() => navigate(item.path)} sx={{
                            cursor: 'pointer', textAlign: 'center', py: 2.5,
                            transition: 'transform .2s, box-shadow .2s',
                            '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 8px 20px ${item.color}25` },
                            '&:active': { transform: 'scale(.97)' },
                        }}>
                            <Box sx={{ color: item.color, mb: 1 }}>
                                {React.cloneElement(item.icon, { sx: { fontSize: 32 } })}
                            </Box>
                            <Typography variant="body2" fontWeight={700}>{item.label}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Low Stock Dialog */}
            <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, fontFamily: '"DM Mono", monospace' }}>
                    Nguyên liệu tồn kho thấp ({stats?.lowStockCount ?? 0})
                </DialogTitle>
                <DialogContent dividers>
                    <List dense>
                        {(stats?.lowStockItems || []).map(item => {
                            const pct = Math.min(100, Math.round(item.currentStock / item.minStock * 100));
                            return (
                                <ListItem key={item.id} divider>
                                    <ListItemIcon>
                                        <WarningAmberIcon color="error" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .5 }}>
                                                <Typography fontWeight={700} variant="body2">{item.name}</Typography>
                                                <Chip label={item.sku} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Box sx={{ height: 3, bgcolor: '#ef444420', borderRadius: 1, mb: .5 }}>
                                                    <Box sx={{ height: 3, width: `${pct}%`, bgcolor: COLORS.red, borderRadius: 1 }} />
                                                </Box>
                                                <Typography variant="caption" color="error.main"
                                                    sx={{ fontFamily: '"DM Mono", monospace' }}>
                                                    Tồn: {item.currentStock} / Min: {item.minStock} {item.baseUnit}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStockOpen(false)}>Đóng</Button>
                    <Button variant="contained" color="error"
                        onClick={() => { setStockOpen(false); navigate('/admin/quanlykho'); }}>
                        Đi đến Kho
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}