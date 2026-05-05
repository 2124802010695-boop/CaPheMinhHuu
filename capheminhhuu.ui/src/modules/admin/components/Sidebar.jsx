import React from 'react';
import {
    Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    Toolbar, Divider, Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import InventoryIcon from '@mui/icons-material/Inventory';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SecurityIcon from '@mui/icons-material/Security';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    { label: 'Bảng điều khiển',      path: '/admin',                         icon: <DashboardIcon />,                                    exact: true },
    { label: 'Quản lý Danh mục',     path: '/admin/quanlydanhmuc',           icon: <CategoryIcon /> },
    { label: 'Quản lý Sản phẩm',     path: '/admin/quanlysanpham',           icon: <FastfoodIcon /> },
    { label: 'Danh mục Nguyên liệu', path: '/admin/quanlydanhmucnguyenlieu', icon: <FolderSpecialIcon sx={{ color: '#10b981' }} /> },
    { label: 'Kho & Định mức',       path: '/admin/quanlykho',               icon: <InventoryIcon /> },
    { label: 'Khu Vực & Bàn',        path: '/admin/quanlykhuvucban',         icon: <MeetingRoomIcon sx={{ color: '#10b981' }} /> },
    { label: 'Quản lý Nhân viên',    path: '/admin/quanlynhanvien',          icon: <PeopleIcon sx={{ color: '#9333ea' }} /> },
    { label: 'Quản lý Ca',           path: '/admin/quanlycalamviec',         icon: <AccessTimeIcon sx={{ color: '#d97706' }} /> },
    { label: 'Bảo mật',              path: '/admin/baomat',                  icon: <SecurityIcon sx={{ color: '#ef4444' }} /> },
];

export default function Sidebar({
    collapsed = false,
    mobileOpen = false,
    onMobileClose,
    drawerWidth = 240,
    collapsedWidth = 64,
}) {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const drawerContent = (
        <>
            <Toolbar />
            <Divider />
            <List sx={{ pt: 1 }}>
                {NAV_ITEMS.map(({ label, path, icon, exact }) => {
                    const isSelected = exact
                        ? location.pathname === path
                        : location.pathname.startsWith(path);

                    const button = (
                        <ListItemButton
                            component={Link}
                            to={path}
                            selected={isSelected}
                            onClick={isMobile ? onMobileClose : undefined}
                            sx={{
                                borderRadius: 1.5,
                                mx: 0.75,
                                mb: 0.25,
                                minHeight: 44,
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                px: collapsed ? 1.5 : 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                                    '&:hover': { bgcolor: 'primary.dark' },
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: collapsed ? 0 : 36,
                                    mr: collapsed ? 0 : 1,
                                    justifyContent: 'center',
                                }}
                            >
                                {icon}
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText
                                    primary={label}
                                    primaryTypographyProps={{
                                        fontSize: 14,
                                        fontWeight: isSelected ? 600 : 400,
                                    }}
                                />
                            )}
                        </ListItemButton>
                    );

                    return collapsed ? (
                        <Tooltip key={path} title={label} placement="right" arrow>
                            <span>{button}</span>
                        </Tooltip>
                    ) : (
                        <React.Fragment key={path}>{button}</React.Fragment>
                    );
                })}
            </List>
        </>
    );

    // Mobile — temporary drawer
    if (isMobile) {
        return (
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        );
    }

    // Desktop — permanent, animate width khi collapse
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: collapsed ? collapsedWidth : drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: collapsed ? collapsedWidth : drawerWidth,
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
}