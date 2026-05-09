import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, IconButton, Button, TextField,
    Divider, Paper, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import toast from 'react-hot-toast';

const COLORS = {
    primary: '#3D1A0A',
    accent:  '#C8860A',
    surface: '#FDF6F0',
    muted:   '#8B6F5E',
};

const Cart = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const tableId   = location.state?.tableId || new URLSearchParams(window.location.search).get('tableId');

    const [cart, setCart] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
        catch { return []; }
    });

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const updateQty = (id, delta) => {
        const updated = cart.map(i => i.id === id
            ? { ...i, quantity: Math.max(1, i.quantity + delta) }
            : i);
        updateCart(updated);
    };

    const updateNote = (id, note) => {
        updateCart(cart.map(i => i.id === id ? { ...i, note } : i));
    };

    const removeItem = (id) => {
        updateCart(cart.filter(i => i.id !== id));
        toast.success('Đã xóa khỏi giỏ');
    };

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const handleOrder = () => {
        if (cart.length === 0) { toast.error('Giỏ hàng trống'); return; }
        const user = localStorage.getItem('customerUser');
        if (!user) {
            navigate('/login', { state: { tableId, returnTo: '/cart' } });
            return;
        }
        navigate('/confirm-order', { state: { cart, tableId } });
    };

    return (
        <Box sx={{ bgcolor: COLORS.surface, minHeight: '100vh', pb: 12 }}>
            {/* Header */}
            <Box sx={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #6B2D0A 100%)`,
                px: 2, py: 2,
                display: 'flex', alignItems: 'center', gap: 1
            }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{
                    fontFamily: '"Playfair Display", serif',
                    color: '#fff', fontWeight: 700
                }}>
                    Giỏ hàng {tableId && `· Bàn ${tableId}`}
                </Typography>
            </Box>

            {cart.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography sx={{ fontSize: 64 }}>🛒</Typography>
                    <Typography sx={{ color: COLORS.muted, mt: 1 }}>Giỏ hàng trống</Typography>
                    <Button onClick={() => navigate('/menu')}
                        sx={{ mt: 2, color: COLORS.primary, textTransform: 'none' }}>
                        ← Quay lại menu
                    </Button>
                </Box>
            ) : (
                <Box sx={{ px: 2, pt: 2 }}>
                    {cart.map((item, idx) => (
                        <Paper key={item.id} elevation={0} sx={{
                            mb: 2, p: 2, borderRadius: 3,
                            border: '1px solid #f0e6dc'
                        }}>
                            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                                <Avatar src={item.imageUrl} variant="rounded"
                                    sx={{ width: 56, height: 56, bgcolor: '#f5ece6', fontSize: 28 }}>
                                    {!item.imageUrl && '☕'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ fontWeight: 700, color: COLORS.primary, fontSize: 14 }}>
                                        {item.name}
                                    </Typography>
                                    <Typography sx={{ color: COLORS.accent, fontWeight: 800, fontSize: 15 }}>
                                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                    </Typography>
                                </Box>
                                <IconButton size="small" onClick={() => removeItem(item.id)}
                                    sx={{ color: '#ef4444', alignSelf: 'flex-start' }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            {/* Quantity */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <IconButton size="small" onClick={() => updateQty(item.id, -1)}
                                    sx={{ border: `1px solid ${COLORS.primary}`, p: 0.3 }}>
                                    <RemoveIcon fontSize="small" sx={{ color: COLORS.primary }} />
                                </IconButton>
                                <Typography sx={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                                    {item.quantity}
                                </Typography>
                                <IconButton size="small" onClick={() => updateQty(item.id, 1)}
                                    sx={{ bgcolor: COLORS.primary, p: 0.3, '&:hover': { bgcolor: COLORS.accent } }}>
                                    <AddIcon fontSize="small" sx={{ color: '#fff' }} />
                                </IconButton>
                            </Box>

                            {/* Note */}
                            <TextField fullWidth size="small" placeholder="Ghi chú (không đường, ít đá...)"
                                value={item.note || ''}
                                onChange={e => updateNote(item.id, e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: 13,
                                        '& fieldset': { borderColor: '#f0e6dc' }
                                    }
                                }}
                            />
                        </Paper>
                    ))}

                    {/* Total */}
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `2px solid ${COLORS.accent}`, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ color: COLORS.muted }}>Tạm tính</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{total.toLocaleString('vi-VN')}đ</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontWeight: 700, color: COLORS.primary }}>Tổng cộng</Typography>
                            <Typography sx={{ fontWeight: 800, color: COLORS.accent, fontSize: 18 }}>
                                {total.toLocaleString('vi-VN')}đ
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            )}

            {/* Bottom CTA */}
            {cart.length > 0 && (
                <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: '#fff', borderTop: '1px solid #f0e6dc' }}>
                    <Button fullWidth variant="contained" onClick={handleOrder}
                        sx={{
                            bgcolor: COLORS.primary, py: 1.5,
                            fontFamily: '"Playfair Display", serif',
                            fontSize: 16, fontWeight: 700,
                            textTransform: 'none', borderRadius: 3,
                            '&:hover': { bgcolor: COLORS.accent }
                        }}>
                        Đặt món · {total.toLocaleString('vi-VN')}đ
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default Cart;
