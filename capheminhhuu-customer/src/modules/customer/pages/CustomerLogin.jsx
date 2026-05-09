import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, TextField, Button,
    Divider, CircularProgress, Paper
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { sendOtpAPI, verifyOtpAPI, googleLoginAPI } from '../services/customerAuthService';

const COLORS = {
    primary: '#3D1A0A',
    accent:  '#C8860A',
    surface: '#FDF6F0',
};

const CustomerLogin = () => {
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
        if (!email.includes('@')) { toast.error('Email không hợp lệ'); return; }
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

    return (
        <Box sx={{
            minHeight: '100vh', bgcolor: COLORS.surface,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', p: 3
        }}>
            {/* Logo */}
            <Typography variant="h4" sx={{
                fontFamily: '"Playfair Display", serif',
                color: COLORS.primary, fontWeight: 800, mb: 1
            }}>
                Cà Phê Minh Hữu
            </Typography>
            <Typography sx={{ color: COLORS.accent, mb: 4, fontWeight: 500 }}>
                ☕ Đăng nhập để đặt món
            </Typography>

            <Paper elevation={0} sx={{
                width: '100%', maxWidth: 400, p: 3,
                borderRadius: 4, border: '1px solid #f0e6dc'
            }}>
                {step === 'email' ? (
                    <>
                        <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 2 }}>
                            Nhập email của bạn
                        </Typography>
                        <TextField
                            fullWidth size="small" type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        <Button fullWidth variant="contained" onClick={handleSendOtp}
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={16} color="inherit" />}
                            sx={{
                                bgcolor: COLORS.primary, py: 1.2, borderRadius: 2,
                                textTransform: 'none', fontWeight: 700,
                                '&:hover': { bgcolor: COLORS.accent }
                            }}>
                            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                        </Button>

                        <Divider sx={{ my: 2 }}>hoặc</Divider>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google login thất bại')}
                                text="signin_with"
                                shape="rectangular"
                                locale="vi"
                            />
                        </Box>

                        <Typography variant="caption" sx={{
                            display: 'block', textAlign: 'center',
                            color: '#9ca3af', mt: 2
                        }}>
                            Bỏ qua đăng nhập? Bạn vẫn có thể đặt món nhưng không tích điểm
                        </Typography>
                    </>
                ) : (
                    <>
                        <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 0.5 }}>
                            Nhập mã OTP
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                            Đã gửi đến <strong>{email}</strong>
                        </Typography>

                        <TextField
                            fullWidth size="small"
                            placeholder="6 chữ số"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                            inputProps={{ maxLength: 6, style: { letterSpacing: 8, fontSize: 24, textAlign: 'center' } }}
                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Button
                                variant={wantRegister ? 'contained' : 'outlined'}
                                size="small" onClick={() => setWantRegister(true)}
                                sx={{
                                    flex: 1, textTransform: 'none', borderRadius: 2,
                                    bgcolor: wantRegister ? COLORS.primary : 'transparent',
                                    borderColor: COLORS.primary, color: wantRegister ? '#fff' : COLORS.primary,
                                    '&:hover': { bgcolor: wantRegister ? COLORS.accent : '#f5ece6' }
                                }}>
                                Đăng ký thành viên
                            </Button>
                            <Button
                                variant={!wantRegister ? 'contained' : 'outlined'}
                                size="small" onClick={() => setWantRegister(false)}
                                sx={{
                                    flex: 1, textTransform: 'none', borderRadius: 2,
                                    bgcolor: !wantRegister ? COLORS.primary : 'transparent',
                                    borderColor: COLORS.primary, color: !wantRegister ? '#fff' : COLORS.primary,
                                    '&:hover': { bgcolor: !wantRegister ? COLORS.accent : '#f5ece6' }
                                }}>
                                Chỉ đặt món
                            </Button>
                        </Box>

                        <Button fullWidth variant="contained" onClick={handleVerifyOtp}
                            disabled={loading || otp.length !== 6}
                            startIcon={loading && <CircularProgress size={16} color="inherit" />}
                            sx={{
                                bgcolor: COLORS.primary, py: 1.2, borderRadius: 2,
                                textTransform: 'none', fontWeight: 700,
                                '&:hover': { bgcolor: COLORS.accent }
                            }}>
                            {loading ? 'Đang xác thực...' : 'Xác nhận'}
                        </Button>

                        <Button fullWidth onClick={() => setStep('email')}
                            sx={{ mt: 1, textTransform: 'none', color: '#6b7280' }}>
                            ← Đổi email
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default CustomerLogin;
