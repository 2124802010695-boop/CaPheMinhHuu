import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, IconButton, Button, TextField,
    Divider, Paper, Avatar, AppBar, Toolbar, useTheme,
    Container, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import toast from 'react-hot-toast';

const Cart = () => {
    const theme = useTheme();
    const navigate  = useNavigate();
    const location  = useLocation();
    const tableId = location.state?.tableId 
        || sessionStorage.getItem('tableId') 
        || new URLSearchParams(window.location.search).get('tableId');

    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
        catch { return []; }
    });

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const getItemKey = (i) => i.cartKey || `${i.id}_${i.sizeLabel}_${i.sugarLevel}_${i.iceLevel}`;

    const updateQty = (key, delta) => {
        const updated = cart.map(i => getItemKey(i) === key
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i);
        updateCart(updated);
    };

    const updateNote = (key, note) => {
        updateCart(cart.map(i => getItemKey(i) === key ? { ...i, note } : i));
    };

    const removeItem = (key) => {
        updateCart(cart.filter(i => getItemKey(i) !== key));
        toast.success('Đã xóa khỏi giỏ');
    };

    const clearAll = () => {
        updateCart([]);
        toast.success('Đã xóa toàn bộ giỏ hàng');
    };

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const isTokenValid = (token) => {
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch { return false; }
    };

    const handleOrder = () => {
        if (cart.length === 0) { toast.error('Giỏ hàng trống'); return; }
        const customerToken = localStorage.getItem('customerToken');
        const guestToken    = localStorage.getItem('guestToken');
        const token = customerToken || guestToken;
        if (!isTokenValid(token)) {
            // Xóa token hết hạn trước khi redirect
            localStorage.removeItem('customerToken');
            localStorage.removeItem('guestToken');
            localStorage.removeItem('guestEmail');
            toast.error('Phiên đăng nhập đã hết hạn, vui lòng xác thực lại');
            navigate('/login', { state: { tableId, returnTo: '/cart' } });
            return;
        }
        const guestEmail = localStorage.getItem('guestEmail') || null;
        navigate('/confirm-order', { state: { cart, tableId, guestEmail } });
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
                            Giỏ hàng của bạn
                        </Typography>
                    </Box>
                    {cart.length > 0 && (
                        <Button 
                            onClick={clearAll} 
                            sx={{ color: theme.palette.secondary.main, fontSize: 12, fontWeight: 700 }}
                        >
                            Xóa tất cả
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ py: 3 }}>
                {cart.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography sx={{ fontSize: 80, mb: 2 }}>🛒</Typography>
                        <Typography variant="h4" sx={{ color: theme.palette.primary.main, mb: 1 }}>
                            Giỏ hàng trống
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                            Hãy chọn món từ menu nhé!
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate('/menu', { state: { tableId } })}
                            sx={{ px: 4, py: 1.5 }}
                        >
                            Xem Menu ngay
                        </Button>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {cart.map((item) => {
                            const itemKey = getItemKey(item);
                            return (
                                <Paper key={itemKey} elevation={0} sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    position: 'relative',
                                    display: 'flex',
                                    gap: 2
                                }}>
                                    {/* Product Image */}
                                    <Box sx={{ position: 'relative' }}>
                                        {item.imageUrl ? (
                                            <Avatar 
                                                src={item.imageUrl} 
                                                variant="rounded" 
                                                sx={{ width: 64, height: 64, borderRadius: 3 }}
                                            />
                                        ) : (
                                            <Box sx={{ 
                                                width: 64, height: 64, borderRadius: 3,
                                                bgcolor: theme.palette.primary.main,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 32
                                            }}>☕</Box>
                                        )}
                                    </Box>

                                    {/* Product Content */}
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main, lineHeight: 1.2 }}>
                                                {item.name}
                                            </Typography>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => removeItem(itemKey)}
                                                sx={{ color: theme.palette.error.main, p: 0, mt: -0.5 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        {/* Options Summary */}
                                        <Typography variant="caption" sx={{ color: theme.palette.secondary.main, fontStyle: 'italic', display: 'block', mb: 1 }}>
                                            {item.displayOptions || item.sizeLabel || 'Mặc định'}
                                        </Typography>

                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                            Đơn giá: {item.price.toLocaleString('vi-VN')}đ
                                        </Typography>

                                        {/* Quantity & Subtotal Row */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(61,26,10,0.04)', borderRadius: 2, p: 0.5 }}>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => updateQty(itemKey, -1)}
                                                    sx={{ 
                                                        border: `1px solid ${theme.palette.primary.main}`, 
                                                        width: 28, height: 28, borderRadius: 2,
                                                        color: theme.palette.primary.main 
                                                    }}
                                                >
                                                    <RemoveIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                                <Typography sx={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => updateQty(itemKey, 1)}
                                                    sx={{ 
                                                        bgcolor: theme.palette.primary.main, 
                                                        width: 28, height: 28, borderRadius: 2,
                                                        color: '#fff',
                                                        '&:hover': { bgcolor: theme.palette.secondary.main }
                                                    }}
                                                >
                                                    <AddIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Box>
                                            
                                            <Typography variant="h6" sx={{ 
                                                color: theme.palette.secondary.main, 
                                                fontWeight: 700,
                                                fontFamily: "'Playfair Display', serif"
                                            }}>
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                            </Typography>
                                        </Box>

                                        {/* Note field */}
                                        <TextField 
                                            fullWidth 
                                            size="small" 
                                            placeholder="Ghi chú món này..."
                                            value={item.note || ''}
                                            onChange={e => updateNote(itemKey, e.target.value)}
                                            sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 12, bgcolor: 'rgba(0,0,0,0.02)' } }}
                                        />
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Container>

            {/* Sticky Footer */}
            {cart.length > 0 && (
                <Box sx={{ 
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    bgcolor: '#fff', 
                    p: 2, 
                    borderTop: `2px solid ${theme.palette.background.default}`,
                    boxShadow: '0 -10px 40px rgba(61,26,10,0.1)',
                    zIndex: 1000
                }}>
                    <Container maxWidth="md">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                                Tổng cộng
                            </Typography>
                            <Typography variant="h4" sx={{ 
                                color: theme.palette.secondary.main, 
                                fontWeight: 800,
                                fontFamily: "'Playfair Display', serif"
                            }}>
                                {total.toLocaleString('vi-VN')}đ
                            </Typography>
                        </Box>
                        <Button 
                            fullWidth 
                            variant="contained" 
                            size="large"
                            onClick={handleOrder}
                            sx={{ 
                                height: 56, 
                                fontSize: 18,
                                fontWeight: 700,
                                fontFamily: "'Playfair Display', serif"
                            }}
                        >
                            Đặt món ngay →
                        </Button>
                    </Container>
                </Box>
            )}
        </Box>
    );
};

export default Cart;
