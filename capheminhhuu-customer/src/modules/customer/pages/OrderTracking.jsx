import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Chip, CircularProgress,
    Button, Divider, List, ListItem, ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import toast from 'react-hot-toast';
import { trackOrderAPI, createPaymentUrlAPI } from '../services/orderService';
import { startConnection, stopConnection, onOrderStatusUpdated } from '../../../common/utils/signalRConnection';

const COLORS = {
    primary: '#3D1A0A',
    accent:  '#C8860A',
    surface: '#FDF6F0',
};

const STATUS_STEPS = [
    { key: 'Pending',    label: 'Đã nhận đơn',      icon: '📋' },
    { key: 'Preparing',  label: 'Đang pha chế',      icon: '☕' },
    { key: 'Ready',      label: 'Sẵn sàng phục vụ',  icon: '🔔' },
    { key: 'Served',     label: 'Đã phục vụ',        icon: '✅' },
    { key: 'Completed',  label: 'Hoàn thành',        icon: '🎉' },
];

const STATUS_COLORS = {
    Pending:   '#f59e0b',
    Preparing: '#3b82f6',
    Ready:     '#10b981',
    Served:    '#8b5cf6',
    Completed: '#10b981',
    Cancelled: '#ef4444',
};

const OrderTracking = () => {
    const { orderCode } = useParams();
    const navigate      = useNavigate();
    const [order, setOrder]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying]   = useState(false);

    const fetchOrder = async () => {
        try {
            const data = await trackOrderAPI(orderCode);
            setOrder(data);
        } catch {
            toast.error('Không tìm thấy đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderCode]);

    useEffect(() => {
        let offStatus = () => {};
        startConnection()
            .then(() => {
                offStatus = onOrderStatusUpdated((orderId, status) => {
                    if (order && orderId === order.id) {
                        setOrder(prev => prev ? { ...prev, status } : prev);
                        if (status === 'Ready')
                            toast.success('🔔 Món của bạn đã sẵn sàng!', { duration: 5000 });
                        if (status === 'Completed')
                            toast.success('🎉 Cảm ơn bạn đã dùng bữa!', { duration: 5000 });
                    }
                }) || (() => {});
            })
            .catch(() => {});
        return () => { offStatus(); stopConnection(); };
    }, [order?.id]);

    const handlePayVnPay = async () => {
        setPaying(true);
        try {
            const res = await createPaymentUrlAPI(orderCode);
            window.location.href = res.paymentUrl;
        } catch {
            toast.error('Không tạo được link thanh toán');
        } finally {
            setPaying(false);
        }
    };

    const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order?.status);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
    );

    if (!order) return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#6b7280' }}>Không tìm thấy đơn hàng</Typography>
            <Button onClick={() => navigate('/menu')} sx={{ mt: 2, color: COLORS.primary }}>
                Về menu
            </Button>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: COLORS.surface, minHeight: '100vh', pb: 10 }}>
            {/* Header */}
            <Box sx={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #6B2D0A 100%)`,
                px: 3, pt: 5, pb: 4
            }}>
                <Typography variant="h5" sx={{
                    fontFamily: '"Playfair Display", serif',
                    color: '#fff', fontWeight: 800
                }}>
                    Theo dõi đơn hàng
                </Typography>
                <Typography sx={{ color: COLORS.accent, fontWeight: 600, mt: 0.5 }}>
                    #{order.orderCode}
                </Typography>
                <Chip
                    label={order.status}
                    sx={{
                        mt: 1, bgcolor: STATUS_COLORS[order.status] || '#6b7280',
                        color: '#fff', fontWeight: 700
                    }}
                />
            </Box>

            <Box sx={{ px: 2, pt: 3 }}>
                {/* Timeline */}
                {order.status !== 'Cancelled' && (
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0e6dc', mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 2 }}>
                            Tiến trình
                        </Typography>
                        {STATUS_STEPS.map((step, idx) => {
                            const done    = idx <= currentStepIdx;
                            const current = idx === currentStepIdx;
                            return (
                                <Box key={step.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                    {done
                                        ? <CheckCircleIcon sx={{ color: COLORS.accent, fontSize: 22 }} />
                                        : <RadioButtonUncheckedIcon sx={{ color: '#d1d5db', fontSize: 22 }} />
                                    }
                                    <Box>
                                        <Typography sx={{
                                            fontWeight: current ? 700 : 400,
                                            color: done ? COLORS.primary : '#9ca3af',
                                            fontSize: 14
                                        }}>
                                            {step.icon} {step.label}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Paper>
                )}

                {/* Order Items */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0e6dc', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 1.5 }}>
                        Chi tiết đơn
                    </Typography>
                    <List dense disablePadding>
                        {order.items?.map((item, i) => (
                            <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemText
                                    primary={`${item.productName} × ${item.quantity}`}
                                    secondary={item.note || ''}
                                    primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}
                                    secondaryTypographyProps={{ fontSize: 12, color: '#9ca3af' }}
                                />
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>
                                    {(item.subtotal).toLocaleString('vi-VN')}đ
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 700 }}>Tổng cộng</Typography>
                        <Typography sx={{ fontWeight: 800, color: COLORS.accent, fontSize: 16 }}>
                            {order.totalAmount?.toLocaleString('vi-VN')}đ
                        </Typography>
                    </Box>
                </Paper>

                {/* Payment */}
                {(order.status === 'Served' || order.status === 'Ready') && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Button fullWidth variant="contained" onClick={handlePayVnPay}
                            disabled={paying}
                            sx={{
                                bgcolor: '#dc2626', py: 1.5, borderRadius: 3,
                                textTransform: 'none', fontWeight: 700, fontSize: 15,
                                '&:hover': { bgcolor: '#b91c1c' }
                            }}>
                            {paying ? 'Đang xử lý...' : '💳 Thanh toán VNPAY'}
                        </Button>
                        <Button fullWidth variant="outlined"
                            sx={{
                                borderColor: COLORS.primary, color: COLORS.primary,
                                py: 1.5, borderRadius: 3, textTransform: 'none', fontWeight: 700
                            }}>
                            💵 Thanh toán tại quầy
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default OrderTracking;
