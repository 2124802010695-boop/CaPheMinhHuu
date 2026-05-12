import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, Divider,
    CircularProgress, AppBar, Toolbar, IconButton, useTheme, Stack,
    Container, TextField, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import toast from 'react-hot-toast';
import { createGuestOrderAPI } from '../services/orderService';

const ConfirmOrder = () => {
    const theme     = useTheme();
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
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const handleSubmit = async () => {
        if (cart.length === 0) { toast.error('Giỏ hàng trống'); return; }
        setLoading(true);
        try {
            const dto = {
                tableId:       tableId ? Number(tableId) : null,
                email:         guestEmail || null,
                couponCode:    voucherCode.trim() || null,
                paymentMethod: paymentMethod,
                items:         cart.map(i => ({
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
        <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', pb: 12 }}>
            {/* Header */}
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: theme.palette.primary.main }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff', mr: 1 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                            Xác nhận đơn hàng
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Stack spacing={3}>
                    {/* SECTION 1 — Table Info */}
                    <Paper elevation={0} sx={{ 
                        p: 2, 
                        borderRadius: 4, 
                        bgcolor: '#FDF6EE', 
                        border: '1px solid rgba(61,26,10,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}>
                        <Typography sx={{ fontSize: 24 }}>🪑</Typography>
                        <Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                VỊ TRÍ PHỤC VỤ
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                {tableId ? `Bàn số: ${tableId}` : 'Mang về / Tự đến quầy'}
                            </Typography>
                            {guestEmail && (
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12, mt: 0.5 }}>
                                    📧 Xác nhận gửi về: {guestEmail}
                                </Typography>
                            )}
                        </Box>
                    </Paper>

                    {/* SECTION 2 — Order Items */}
                    <Box>
                        <Typography variant="h6" sx={{ 
                            color: theme.palette.primary.main, 
                            mb: 2, 
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700
                        }}>
                            Món đã chọn
                        </Typography>
                        <Stack spacing={2}>
                            {cart.map((item, idx) => (
                                <Paper key={idx} elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main, flex: 1, pr: 2 }}>
                                            {item.name}
                                        </Typography>
                                        <Typography sx={{ 
                                            color: theme.palette.secondary.main, 
                                            fontWeight: 700,
                                            fontFamily: "'Playfair Display', serif"
                                        }}>
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                        </Typography>
                                    </Box>
                                    
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic', display: 'block', mb: 1.5 }}>
                                        {item.displayOptions || item.sizeLabel || 'Mặc định'}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Chip 
                                            label={`×${item.quantity}`} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: theme.palette.primary.main, 
                                                color: '#fff', 
                                                fontWeight: 700,
                                                borderRadius: 1.5
                                            }} 
                                        />
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                            Đơn giá: {item.price.toLocaleString('vi-VN')}đ
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>

                    {/* SECTION 3 — Voucher */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: theme.palette.primary.main }}>
                            Mã giảm giá (Voucher)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField 
                                fullWidth 
                                placeholder="Nhập mã voucher..."
                                value={voucherCode}
                                onChange={e => setVoucherCode(e.target.value)}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                            <Button 
                                variant="contained" 
                                color="secondary"
                                sx={{ px: 3, borderRadius: 3, whiteSpace: 'nowrap' }}
                            >
                                Áp dụng
                            </Button>
                        </Box>
                    </Box>

                    {/* SECTION 3b — Payment Method */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: theme.palette.primary.main }}>
                            Thanh toán
                        </Typography>
                        <Stack spacing={1.5}>
                            {[
                                { value: 'Cash',   icon: '💵', label: 'Tiền mặt tại quầy',   sub: 'Thanh toán khi nhận món' },
                                { value: 'VietQR', icon: '📱', label: 'Chuyển khoản QR',      sub: 'Quét mã VietQR — tự động xác nhận' },
                            ].map(opt => (
                                <Paper
                                    key={opt.value}
                                    elevation={0}
                                    onClick={() => setPaymentMethod(opt.value)}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        border: paymentMethod === opt.value
                                            ? `2px solid ${theme.palette.secondary.main}`
                                            : '1px solid rgba(0,0,0,0.08)',
                                        bgcolor: paymentMethod === opt.value ? '#FFF8EE' : '#fff',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Typography sx={{ fontSize: 28 }}>{opt.icon}</Typography>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                            {opt.label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                            {opt.sub}
                                        </Typography>
                                    </Box>
                                    {paymentMethod === opt.value && (
                                        <Box sx={{ ml: 'auto' }}>
                                            <Chip label="✓" size="small" color="secondary" sx={{ fontWeight: 700, height: 24 }} />
                                        </Box>
                                    )}
                                </Paper>
                            ))}
                        </Stack>
                    </Box>

                    {/* SECTION 4 — Total Card */}
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 5, 
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        color: '#fff'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body1" sx={{ opacity: 0.8 }}>Tạm tính</Typography>
                            <Typography variant="body1">{total.toLocaleString('vi-VN')}đ</Typography>
                        </Box>
                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Tổng cộng</Typography>
                            <Typography variant="h4" sx={{ 
                                color: theme.palette.secondary.main, 
                                fontWeight: 800,
                                fontFamily: "'Playfair Display', serif"
                            }}>
                                {total.toLocaleString('vi-VN')}đ
                            </Typography>
                        </Box>
                    </Paper>
                </Stack>
            </Container>

            {/* Footer Sticky */}
            <Box sx={{ 
                position: 'fixed', bottom: 0, left: 0, right: 0, 
                p: 2, bgcolor: '#fff', 
                borderTop: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
                zIndex: 1000 
            }}>
                <Container maxWidth="sm">
                    <Button 
                        fullWidth 
                        variant="contained" 
                        size="large"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{ 
                            height: 56, 
                            borderRadius: 4, 
                            fontSize: 18,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận đặt món ☕'}
                    </Button>
                    <Typography variant="caption" sx={{ 
                        display: 'block', 
                        textAlign: 'center', 
                        mt: 1.5, 
                        color: theme.palette.text.secondary,
                        fontWeight: 500
                    }}>
                        Đơn hàng sẽ được xử lý ngay lập tức
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default ConfirmOrder;
