import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Avatar, Paper, Button,
    Chip, CircularProgress, List, ListItem, ListItemText
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import { getProfileAPI } from '../services/customerAuthService';

const COLORS = { primary: '#3D1A0A', accent: '#C8860A', surface: '#FDF6F0' };

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('customerToken');
        if (!token) { navigate('/login'); return; }
        getProfileAPI()
            .then(data => setProfile(data))
            .catch(() => navigate('/login'))
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        navigate('/menu');
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
    );

    return (
        <Box sx={{ bgcolor: COLORS.surface, minHeight: '100vh', pb: 6 }}>
            {/* Header */}
            <Box sx={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #6B2D0A 100%)`,
                px: 3, pt: 6, pb: 4, textAlign: 'center'
            }}>
                <Avatar src={profile?.avatar} sx={{
                    width: 80, height: 80, mx: 'auto', mb: 1.5,
                    bgcolor: COLORS.accent, fontSize: 32
                }}>
                    {profile?.fullName?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Typography variant="h6" sx={{
                    fontFamily: '"Playfair Display", serif',
                    color: '#fff', fontWeight: 700
                }}>
                    {profile?.fullName || 'Khách hàng'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                    {profile?.email}
                </Typography>
                <Chip
                    icon={<StarIcon sx={{ color: COLORS.accent + ' !important', fontSize: 16 }} />}
                    label={`${profile?.loyaltyPoints || 0} điểm tích lũy`}
                    sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }}
                />
            </Box>

            <Box sx={{ px: 2, pt: 3 }}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f0e6dc', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 1.5 }}>
                        Thông tin tài khoản
                    </Typography>
                    {[
                        { label: 'Email', value: profile?.email },
                        { label: 'Điện thoại', value: profile?.phone || 'Chưa cập nhật' },
                        { label: 'Điểm tích lũy', value: `${profile?.loyaltyPoints || 0} điểm` },
                    ].map(item => (
                        <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f9f0ea' }}>
                            <Typography sx={{ color: '#6b7280', fontSize: 14 }}>{item.label}</Typography>
                            <Typography sx={{ fontWeight: 600, color: COLORS.primary, fontSize: 14 }}>{item.value}</Typography>
                        </Box>
                    ))}
                </Paper>

                <Button fullWidth variant="outlined" startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        borderColor: '#ef4444', color: '#ef4444',
                        textTransform: 'none', fontWeight: 700,
                        borderRadius: 3, py: 1.2,
                        '&:hover': { bgcolor: '#fee2e2', borderColor: '#dc2626' }
                    }}>
                    Đăng xuất
                </Button>
            </Box>
        </Box>
    );
};

export default Profile;
