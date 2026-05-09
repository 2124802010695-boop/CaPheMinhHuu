import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const COLORS = { primary: '#3D1A0A', accent: '#C8860A', surface: '#FDF6F0' };

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading');

    const success   = searchParams.get('success') === 'true';
    const orderCode = searchParams.get('orderCode');
    const amount    = searchParams.get('amount');
    const message   = searchParams.get('message');

    useEffect(() => {
        const timer = setTimeout(() => setStatus(success ? 'success' : 'failed'), 800);
        return () => clearTimeout(timer);
    }, [success]);

    if (status === 'loading') return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
    );

    return (
        <Box sx={{
            minHeight: '100vh', bgcolor: COLORS.surface,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center'
        }}>
            {success ? (
                <>
                    <CheckCircleIcon sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
                    <Typography variant="h5" sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 800, color: COLORS.primary, mb: 1
                    }}>
                        Thanh toán thành công!
                    </Typography>
                    <Typography sx={{ color: '#6b7280', mb: 0.5 }}>
                        Đơn hàng #{orderCode}
                    </Typography>
                    <Typography sx={{ color: COLORS.accent, fontWeight: 700, fontSize: 20, mb: 3 }}>
                        {Number(amount).toLocaleString('vi-VN')}đ
                    </Typography>
                    <Button variant="contained" onClick={() => navigate(`/tracking/${orderCode}`)}
                        sx={{
                            bgcolor: COLORS.primary, textTransform: 'none',
                            fontWeight: 700, borderRadius: 3, px: 4, py: 1.2,
                            '&:hover': { bgcolor: COLORS.accent }
                        }}>
                        Xem đơn hàng
                    </Button>
                </>
            ) : (
                <>
                    <ErrorIcon sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
                    <Typography variant="h5" sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 800, color: COLORS.primary, mb: 1
                    }}>
                        Thanh toán thất bại
                    </Typography>
                    <Typography sx={{ color: '#6b7280', mb: 3 }}>
                        {message || 'Có lỗi xảy ra, vui lòng thử lại'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button variant="outlined" onClick={() => navigate(-1)}
                            sx={{ textTransform: 'none', borderColor: COLORS.primary, color: COLORS.primary, borderRadius: 3 }}>
                            Thử lại
                        </Button>
                        <Button variant="contained" onClick={() => navigate('/menu')}
                            sx={{ textTransform: 'none', bgcolor: COLORS.primary, borderRadius: 3, '&:hover': { bgcolor: COLORS.accent } }}>
                            Về menu
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default PaymentCallback;
