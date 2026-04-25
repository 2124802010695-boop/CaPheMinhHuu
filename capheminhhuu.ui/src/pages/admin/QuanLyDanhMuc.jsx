import React, { useEffect, useState } from 'react';
import {
    Box, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Typography, IconButton,
    Chip, Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import FolderIcon from '@mui/icons-material/Folder';
import { getCategoriesAPI, deleteCategoryAPI } from '../../services/categoryService';
import ModalAddCategory from '../../components/admin/ModalAddCategory';

const QuanLyDanhMuc = () => {
    const [categories, setCategories] = useState([]);
    const [openModal, setOpenModal] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await getCategoriesAPI();
            if (res && res.length > 0) {
                setCategories(res);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            try {
                await deleteCategoryAPI(id);
                alert("Xóa thành công!");
                fetchCategories();
            } catch (error) {
                alert("Lỗi xóa danh mục!");
            }
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        fetchCategories();
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: '#fff',
                    borderRadius: 2,
                    border: '1px solid #e5e7eb'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                            bgcolor: '#f3f4f6',
                            width: 48,
                            height: 48
                        }}>
                            <CategoryIcon sx={{ color: '#6366f1', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                                Quản Lý Danh Mục
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Quản lý danh mục sản phẩm trong hệ thống
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenModal(true)}
                        sx={{
                            bgcolor: '#6366f1',
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3,
                            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                            '&:hover': {
                                bgcolor: '#4f46e5',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        Thêm Danh Mục
                    </Button>
                </Box>
            </Paper>

            {/* Table */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                                    ID
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                                    Tên Danh Mục
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>
                                    Mô Tả
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>
                                    Hành Động
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{
                                        '&:hover': { bgcolor: '#f9fafb' },
                                        '&:last-child td': { border: 0 }
                                    }}
                                >
                                    <TableCell sx={{ py: 2.5 }}>
                                        <Chip
                                            label={`#${row.id}`}
                                            size="small"
                                            sx={{
                                                bgcolor: '#f3f4f6',
                                                color: '#6b7280',
                                                fontWeight: 500
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{
                                                bgcolor: '#ede9fe',
                                                width: 36,
                                                height: 36
                                            }}>
                                                <FolderIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                                            </Avatar>
                                            <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                                                {row.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: '#6b7280' }}>
                                        {row.description || '-'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleDelete(row.id)}
                                            sx={{
                                                color: '#ef4444',
                                                '&:hover': {
                                                    bgcolor: '#fee2e2'
                                                }
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <CategoryIcon sx={{ fontSize: 48, color: '#d1d5db' }} />
                                            <Typography sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                                Chưa có danh mục nào
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#d1d5db' }}>
                                                Nhấn "Thêm Danh Mục" để bắt đầu
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <ModalAddCategory
                open={openModal}
                handleClose={handleCloseModal}
                fetchCategories={fetchCategories}
            />
        </Box>
    );
};

export default QuanLyDanhMuc;