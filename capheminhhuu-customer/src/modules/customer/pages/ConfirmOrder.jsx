import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, Divider,
    CircularProgress, List, ListItem, ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import toast from 'react-hot-toast';
import { createGuestOrderAPI } from '../services/orderService';

const COLORS = { primary: '#3D1A0A', accent: '#C8860A', surface: '#FDF6F0' };

const ConfirmOrder = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const cart      = location.state?.cart || [];
    const tableId   = location.state?.tableId || sessionStorage.getItem('tableId');
    const guestEmail = location.state?.guestEmail;
    const [loading, setLoading] = useState(false);

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const [voucherCode, setVoucherCode] = useState(
        localStorage.getItem('pendingVoucher') || ''
    );

    const handleSubmit = async () => {
        if (cart.length === 0) { toast.error('Giỏ hàng trống'); return; }
        setLoading(true);
        try {
            const dto = {
                tableId:     tableId ? Number(tableId) : null,
                email:       guestEmail || null,
                couponCode:  voucherCode.trim() || null,
                items:       cart.map(i => ({
                    productId:  i.id,
                    quantity:   i.quantity,
                    note:       i.note || null,
                    sizeLabel:  i.sizeLabel || null,
                    sugarLevel: i.sugarLevel || null,
                    iceLevel:   i.iceLevel || null,
                    toppings:   i.toppings || []
                }))
            };
            const order = await createGuestOrderAPI(dto);
            localStorage.removeItem('cart');
            localStorage.removeItem('pendingVoucher');
            toast.success('Đặt món thành công! 🎉');
            navigate(`/tracking/${order.orderCode}`, { state: { total } });
        } catch (err) {
            const msg = err?.response?.data?.message || 'Đặt món thất bại';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: COLORS.surface, minHeight: '100vh', pb: 12 }}>
            {/* Header */}
            <Box sx={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #6B2D0A 100%)`,
                px: 2, py: 2,
                display: 'flex', alignItems: 'center', gap: 1
            }}>
                <Button onClick={() => navigate(-1)} sx={{ color: '#fff', minWidth: 0 }}>
                    <ArrowBackIcon />
                </Button>
                <Typography variant="h6" sx={{
                    fontFamily: '"Playfair Display", serif',
                    color: '#fff', fontWeight: 700
                }}>
                    Xác nhận đơn hàng
                </Typography>
            </Box>

            <Box sx={{ px: 2, pt: 3 }}>
                {/* Table info */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #f0e6dc', mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: '#6b7280' }}>Bàn</Typography>
                        <Typography sx={{ fontWeight: 700, color: COLORS.primary }}>
                            {tableId ? `Bàn ${tableId}` : 'Mang đi'}
                        </Typography>
                    </Box>
                    {guestEmail && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography sx={{ color: '#6b7280' }}>Email xác nhận</Typography>
                            <Typography sx={{ fontWeight: 600, color: COLORS.primary, fontSize: 13 }}>
                                {guestEmail}
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Items */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0e6dc', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 1.5 }}>
                        Danh sách món
                    </Typography>
                    <List dense disablePadding>
                        {cart.map((item, i) => (
                            <ListItem key={i} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemText
                                    primary={`${item.name} × ${item.quantity}`}
                                    secondary={item.note || ''}
                                    primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}
                                    secondaryTypographyProps={{ fontSize: 12, color: '#9ca3af' }}
                                />
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>
                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 700 }}>Tổng cộng</Typography>
                        <Typography sx={{ fontWeight: 800, color: COLORS.accent, fontSize: 18 }}>
                            {total.toLocaleString('vi-VN')}đ
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* Bottom CTA */}
            <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: '#fff', borderTop: '1px solid #f0e6dc' }}>
                <Button fullWidth variant="contained" onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={18} color="inherit" />}
                    sx={{
                        bgcolor: COLORS.primary, py: 1.5,
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 16, fontWeight: 700,
                        textTransform: 'none', borderRadius: 3,
                        '&:hover': { bgcolor: COLORS.accent }
                    }}>
                    {loading ? 'Đang đặt món...' : `Xác nhận đặt món · ${total.toLocaleString('vi-VN')}đ`}
                </Button>
            </Box>
        </Box>
    );
};

export default ConfirmOrder;
