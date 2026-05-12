import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, TextField, Button,
    Divider, CircularProgress, Paper, useTheme,
    Tabs, Tab, Fade
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { sendOtpAPI, verifyOtpAPI, googleLoginAPI } from '../services/customerAuthService';

const CustomerLogin = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = location.state?.returnTo || '/menu';
    const tableId  = location.state?.tableId;

    const [step, setStep]       = useState('email'); // email | otp
    const [email, setEmail]     = useState('');
    const [otp, setOtp]         = useState('');
    const [loading, setLoading] = useState(false);
    const [wantRegister, setWantRegister] = useState(true);

    const saveAuth = (data) => {
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerUser', JSON.stringify(data.user));
    };

    const handleSendOtp = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) { toast.error('Email không hợp lệ'); return; }
        setLoading(true);
        try {
            await sendOtpAPI(email);
            setStep('otp');
            toast.success('Mã OTP đã gửi đến email của bạn');
        } catch {
            toast.error('Không gửi được OTP, thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) { toast.error('Nhập đủ 6 số OTP'); return; }
        setLoading(true);
        try {
            const res = await verifyOtpAPI(email, otp, wantRegister);
            if (res.isGuest) {
                localStorage.setItem('guestToken', res.token);
                localStorage.setItem('guestEmail', email);
                toast.success('Xác thực thành công!');
                navigate(returnTo, { state: { tableId, guestEmail: email } });
                return;
            }
            saveAuth(res);
            toast.success(`Chào mừng${res.isNewUser ? ' bạn mới' : ' trở lại'}! 🎉`);
            navigate(returnTo, { state: { tableId } });
        } catch (err) {
            const msg = err?.response?.data?.message || 'OTP không đúng hoặc đã hết hạn';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const res = await googleLoginAPI(credentialResponse.credential);
            saveAuth(res);
            toast.success(`Chào mừng ${res.user?.fullName || 'bạn'}! 🎉`);
            navigate(returnTo, { state: { tableId } });
        } catch {
            toast.error('Đăng nhập Google thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleSkipLogin = () => {
        toast.info('Vui lòng đăng nhập để đặt món (Chế độ xem thử)', { icon: '☕' });
        navigate('/menu', { replace: true, state: { tableId } });
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Elements */}
            <Box sx={{
                position: 'absolute', top: -100, right: -100,
                width: 300, height: 300, borderRadius: '50%',
                background: 'rgba(200, 134, 10, 0.05)', filter: 'blur(80px)'
            }} />
            <Box sx={{
                position: 'absolute', bottom: -50, left: -50,
                width: 200, height: 200, borderRadius: '50%',
                background: 'rgba(200, 134, 10, 0.03)', filter: 'blur(60px)'
            }} />

            <Fade in timeout={800}>
                <Paper elevation={0} sx={{
                    width: '100%',
                    maxWidth: 420,
                    p: { xs: 3, sm: 5 },
                    borderRadius: 6,
                    bgcolor: theme.palette.background.default,
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Logo Section */}
                    <Typography sx={{ fontSize: 56, mb: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>☕</Typography>
                    <Typography variant="h4" sx={{ 
                        color: theme.palette.primary.main, 
                        mb: 1,
                        letterSpacing: '-0.5px'
                    }}>
                        Cà Phê Minh Hữu
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 4, fontWeight: 500 }}>
                        Đặt món tại bàn • Nhanh chóng • Tiện lợi
                    </Typography>

                    {step === 'email' ? (
                        <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, ml: 0.5, color: theme.palette.primary.main }}>
                                Đăng nhập bằng Email
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                                sx={{ mb: 3 }}
                            />
                            
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSendOtp}
                                disabled={loading}
                                sx={{ height: 52, fontSize: 16 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi mã OTP'}
                            </Button>

                            <Divider sx={{ my: 4, '&::before, &::after': { borderColor: 'rgba(0,0,0,0.08)' } }}>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, px: 1, fontWeight: 600 }}>
                                    HOẶC
                                </Typography>
                            </Divider>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google login thất bại')}
                                    theme="filled_blue"
                                    shape="pill"
                                    width="100%"
                                    locale="vi"
                                />
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.primary.main }}>
                                Xác thực OTP
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                                Mã xác nhận đã được gửi tới<br/>
                                <strong style={{ color: theme.palette.primary.main }}>{email}</strong>
                            </Typography>

                            <TextField
                                fullWidth
                                placeholder="● ● ● ● ● ●"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                                inputProps={{ 
                                    maxLength: 6, 
                                    style: { 
                                        letterSpacing: 12, 
                                        fontSize: 28, 
                                        textAlign: 'center',
                                        fontWeight: 800,
                                        fontFamily: 'monospace'
                                    } 
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                                <Button
                                    variant={wantRegister ? 'contained' : 'outlined'}
                                    onClick={() => setWantRegister(true)}
                                    sx={{ 
                                        flex: 1, 
                                        height: 40,
                                        fontSize: 13,
                                        bgcolor: wantRegister ? theme.palette.primary.main : 'transparent',
                                        color: wantRegister ? '#fff' : theme.palette.primary.main
                                    }}
                                >
                                    Đăng ký
                                </Button>
                                <Button
                                    variant={!wantRegister ? 'contained' : 'outlined'}
                                    onClick={() => setWantRegister(false)}
                                    sx={{ 
                                        flex: 1, 
                                        height: 40,
                                        fontSize: 13,
                                        bgcolor: !wantRegister ? theme.palette.primary.main : 'transparent',
                                        color: !wantRegister ? '#fff' : theme.palette.primary.main
                                    }}
                                >
                                    Chỉ đặt món
                                </Button>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length !== 6}
                                sx={{ height: 52, fontSize: 16, mb: 2 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận Đặt món'}
                            </Button>

                            <Button 
                                onClick={() => setStep('email')}
                                sx={{ color: theme.palette.text.secondary, fontSize: 13 }}
                            >
                                ← Quay lại nhập Email
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="text"
                            color="secondary"
                            onClick={handleSkipLogin}
                            sx={{ 
                                fontWeight: 600,
                                '&:hover': { background: 'rgba(200, 134, 10, 0.05)' }
                            }}
                        >
                            Bỏ qua đăng nhập?
                        </Button>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default CustomerLogin;
