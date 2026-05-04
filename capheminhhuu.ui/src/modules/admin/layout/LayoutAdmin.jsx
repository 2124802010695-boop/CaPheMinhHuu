import React, { useState } from 'react';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 64;

export default function LayoutAdmin() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleMenuClick = () => {
        if (isMobile) setMobileOpen(prev => !prev);
        else setCollapsed(prev => !prev);
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Navbar onMenuClick={handleMenuClick} />
            <Sidebar
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
                drawerWidth={DRAWER_WIDTH}
                collapsedWidth={DRAWER_COLLAPSED}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    height: '100vh',
                    overflow: 'auto',
                    minWidth: 0,
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}