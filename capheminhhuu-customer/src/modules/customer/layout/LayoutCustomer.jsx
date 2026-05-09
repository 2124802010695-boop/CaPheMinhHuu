import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Box } from '@mui/material';

const LayoutCustomer = () => {
    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#FDF6F0',
            fontFamily: '"Inter", sans-serif',
        }}>
            <Toaster position="top-center" />
            <Outlet />
        </Box>
    );
};

export default LayoutCustomer;
