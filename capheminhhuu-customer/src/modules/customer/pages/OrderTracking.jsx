import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Chip, CircularProgress,
    Button, Divider, List, ListItem, ListItemText,
    AppBar, Toolbar, IconButton, useTheme, Stack,
    Container, Stepper, Step, StepLabel, Collapse,
    Tooltip
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';
import { trackOrderAPI } from '../services/orderService';
import { startConnection, stopConnection, onOrderStatusUpdated } from '../../../common/utils/signalRConnection';
import dayjs from 'dayjs';

const STATUS_STEPS = [
    { key: 'Pending',    label: 'Đã nhận đơn',      icon: '📋' },
    { key: 'Preparing',  label: 'Đang pha chế',      icon: '☕' },
    { key: 'Ready',      label: 'Sẵn sàng phục vụ',  icon: '🔔' },
    { key: 'Served',     label: 'Đã phục vụ',        icon: '✅' },
    { key: 'Completed',  label: 'Hoàn thành',        icon: '🎉' },
];

const OrderTracking = () => {
    const theme         = useTheme();
    const { orderCode } = useParams();
    const navigate      = useNavigate();
    const [order, setOrder]           = useState(null);
    const [loading, setLoading]       = useState(true);
    const [vietqr, setVietqr]         = useState(null);
    const [expandedDetails, setExpandedDetails] = useState(false);

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
        if (!orderCode) return;

        let offStatus = () => {};
        startConnection(orderCode)
            .then(() => {
                offStatus = onOrderStatusUpdated((receivedCode, status) => {
                    if (receivedCode === orderCode) {
                        setOrder(prev => prev ? { ...prev, status } : prev);
                        if (status === 'Ready')
                            toast.success('🔔 Món của bạn đã sẵn sàng!', { duration: 5000 });
                        if (status === 'Completed')
                            toast.success('🎉 Cảm ơn bạn đã dùng bữa!', { duration: 5000 });
                    }
                }) || (() => {});
            })
            .catch(() => {});
            
        return () => { 
            offStatus(); 
            stopConnection(); 
        };
    }, [orderCode]);

    const handleLoadQRConfig = async () => {
        if (vietqr) return;
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'https://localhost:7280/api'}/payment/vietqr-config`
            );
            const data = await res.json();
            setVietqr(data);
        } catch {
            toast.error('Không tải được thông tin thanh toán');
        }
    };

    useEffect(() => {
        if (order && !order.isPaid && order.paymentMethod !== 'Cash') {
            handleLoadQRConfig();
        }
    }, [order]);

    const vietqrUrl = vietqr
        ? `https://img.vietqr.io/image/${vietqr.bankId}-${vietqr.accountNo}-compact2.png` +
          `?amount=${order?.totalAmount}&addInfo=${orderCode}&accountName=${encodeURIComponent(vietqr.accountName)}`
        : null;

    const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order?.status);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: theme.palette.background.default }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
    );

    if (!order) return (
        <Box sx={{ textAlign: 'center', py: 10, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>😕</Typography>
            <Typography variant="h6">Không tìm thấy đơn hàng</Typography>
            <Button onClick={() => navigate('/menu')} sx={{ mt: 3 }} variant="contained">
                Quay lại Menu
            </Button>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', pb: 12 }}>
            <style>
                {`
                    @keyframes pulse-accent {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(200, 134, 10, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(200, 134, 10, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(200, 134, 10, 0); }
                    }
                `}
            </style>

            {/* Header */}
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: theme.palette.primary.main }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ width: 48 }} />
                    <Typography variant="h6" sx={{ 
                        fontFamily: "'Playfair Display', serif", 
                        color: '#fff', 
                        fontWeight: 700 
                    }}>
                        Theo dõi đơn hàng
                    </Typography>
                    <Tooltip title="Đặt thêm món">
                        <IconButton 
                            onClick={() => navigate('/menu', { state: { tableId: order.tableId } })}
                            sx={{ color: theme.palette.secondary.main }}
                        >
                            <HomeIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Stack spacing={3}>
                    {/* SECTION 1 — Order Code Card */}
                    <Paper elevation={0} sx={{ 
                        p: 3, 
                        borderRadius: 5, 
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        color: '#fff'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.8 }}>
                            <Typography sx={{ fontSize: 20 }}>📋</Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>MÃ ĐƠN HÀNG</Typography>
                        </Box>
                        <Typography variant="h4" sx={{ 
                            fontFamily: "'Playfair Display', serif", 
                            color: theme.palette.secondary.main, 
                            fontWeight: 800,
                            letterSpacing: '2px',
                            mb: 2
                        }}>
                            {order.orderCode}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#9C7B5E', fontWeight: 600 }}>
                                {dayjs(order.orderDate).format('HH:mm - DD/MM/YYYY')}
                            </Typography>
                            {order.isPaid && (
                                <Chip 
                                    label="💰 Đã thanh toán" 
                                    size="small" 
                                    sx={{ bgcolor: theme.palette.success.main, color: '#fff', fontWeight: 700 }} 
                                />
                            )}
                        </Box>
                    </Paper>

                    {/* SECTION 2 — Status Timeline */}
                    <Box>
                        <Typography variant="h6" sx={{ 
                            color: theme.palette.primary.main, 
                            mb: 3, 
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 700
                        }}>
                            Trạng thái đơn hàng
                        </Typography>
                        
                        <Stepper 
                            activeStep={currentStepIdx} 
                            orientation="vertical" 
                            sx={{
                                '& .MuiStepConnector-line': {
                                    minHeight: 40,
                                    borderColor: 'rgba(61,26,10,0.1)'
                                }
                            }}
                        >
                            {STATUS_STEPS.map((step, idx) => {
                                const isCompleted = idx < currentStepIdx;
                                const isActive = idx === currentStepIdx;
                                return (
                                    <Step key={step.key} completed={isCompleted}>
                                        <StepLabel
                                            StepIconComponent={() => (
                                                <Box sx={{
                                                    width: 32, height: 32,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    bgcolor: isCompleted ? theme.palette.success.main : (isActive ? theme.palette.secondary.main : 'rgba(0,0,0,0.05)'),
                                                    color: isCompleted || isActive ? '#fff' : theme.palette.text.secondary,
                                                    borderRadius: '50%',
                                                    zIndex: 1,
                                                    animation: isActive ? 'pulse-accent 2s infinite' : 'none'
                                                }}>
                                                    {isCompleted ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <Typography sx={{ fontSize: 16 }}>{step.icon}</Typography>}
                                                </Box>
                                            )}
                                        >
                                            <Typography sx={{ 
                                                fontWeight: 700, 
                                                color: isActive ? theme.palette.primary.main : (isCompleted ? theme.palette.text.primary : theme.palette.text.secondary),
                                                opacity: isActive || isCompleted ? 1 : 0.4
                                            }}>
                                                {step.label}
                                            </Typography>
                                        </StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                    </Box>

                    {/* SECTION 3 — Collapsible Details */}
                    <Box>
                        <Button 
                            fullWidth
                            onClick={() => setExpandedDetails(!expandedDetails)}
                            endIcon={expandedDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{ 
                                justifyContent: 'space-between', 
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                                px: 1,
                                py: 1.5,
                                borderBottom: '1px solid rgba(0,0,0,0.05)'
                            }}
                        >
                            Chi tiết đơn hàng ({order.items?.length} món)
                        </Button>
                        <Collapse in={expandedDetails}>
                            <List disablePadding sx={{ pt: 2 }}>
                                {order.items?.map((item, i) => (
                                    <ListItem key={i} sx={{ px: 1, py: 1 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                        {item.productName} <span style={{ color: theme.palette.text.secondary, fontWeight: 400 }}>×{item.quantity}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 700 }}>
                                                        {item.subtotalFull.toLocaleString('vi-VN')}đ
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                                                    {item.sizeLabel || 'Mặc định'} {item.note && `(${item.note})`}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </Box>

                    {/* SECTION 4 — Total */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                        <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>Tổng cộng</Typography>
                        <Typography variant="h4" sx={{ 
                            color: theme.palette.secondary.main, 
                            fontWeight: 800,
                            fontFamily: "'Playfair Display', serif"
                        }}>
                            {order.totalAmount?.toLocaleString('vi-VN')}đ
                        </Typography>
                    </Box>

                    {/* SECTION 5 — VietQR */}
                    {!order.isPaid && order.paymentMethod !== 'Cash' && (
                        <Paper elevation={0} sx={{
                            p: 3,
                            borderRadius: 4,
                            border: `2px solid ${theme.palette.secondary.main}`,
                            bgcolor: '#fff',
                            textAlign: 'center'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontFamily: "'Playfair Display', serif", 
                                fontWeight: 700,
                                mb: 3,
                                color: theme.palette.primary.main
                            }}>
                                Quét mã thanh toán
                            </Typography>

                            {vietqrUrl ? (
                                <Box sx={{ mb: 3 }}>
                                    <Box 
                                        component="img" 
                                        src={vietqrUrl} 
                                        alt="VietQR" 
                                        sx={{ 
                                            width: '100%', 
                                            maxWidth: 220, 
                                            borderRadius: 3,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }} 
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ py: 4 }}><CircularProgress size={32} color="secondary" /></Box>
                            )}

                            <Stack spacing={1} sx={{ textAlign: 'left', mb: 3, bgcolor: 'rgba(0,0,0,0.02)', p: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>STK:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{vietqr?.accountNo}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Chủ TK:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{vietqr?.accountName}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Số tiền:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>{order.totalAmount?.toLocaleString('vi-VN')}đ</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Nội dung:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{order.orderCode}</Typography>
                                </Box>
                            </Stack>

                            <Chip 
                                label="Đang chờ xác nhận thanh toán..." 
                                variant="outlined" 
                                color="warning"
                                sx={{ 
                                    fontWeight: 700,
                                    animation: 'pulse-accent 2s infinite',
                                    borderWidth: 2
                                }} 
                            />
                        </Paper>
                    )}

                    {/* Footer */}
                    <Box sx={{ pt: 4, textAlign: 'center' }}>
                        <Button 
                            fullWidth 
                            variant="outlined" 
                            onClick={() => {
                                localStorage.removeItem('cart');
                                navigate('/menu', { state: { tableId: order.tableId } });
                            }}
                            sx={{ mb: 3, py: 1.5, borderRadius: 3, fontWeight: 700 }}
                        >
                            Đặt thêm món ☕
                        </Button>
                        <Typography variant="h6" sx={{ 
                            fontFamily: "'Playfair Display', serif", 
                            fontStyle: 'italic',
                            color: theme.palette.text.secondary,
                            fontSize: 18
                        }}>
                            Cảm ơn bạn đã ghé Cà Phê Minh Hữu ♥
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default OrderTracking;
