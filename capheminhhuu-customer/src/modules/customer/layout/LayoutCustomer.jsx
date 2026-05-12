import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';

const LayoutCustomer = () => {
    const theme = useTheme();
    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: theme.palette.background.default,
            fontFamily: theme.typography.fontFamily,
        }}>
            <Outlet />
        </Box>
    );
};

export default LayoutCustomer;
