// QuanLySanPham.jsx — refactored with image upload drawer
import React, { useEffect, useState, useRef } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Chip, Avatar, Drawer, Divider, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { getProductsAPI, deleteProductAPI, uploadProductImageAPI } from '../services/productService';
import ModalAddProduct from '../components/ModalAddProduct';


const DRAWER_WIDTH = 340;

const QuanLySanPham = () => {
    const [products, setProducts] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchProducts = async () => {
        try {
            const res = await getProductsAPI();
            if (res) setProducts(res);
        } catch (err) {
            console.error('Lỗi lấy sản phẩm:', err);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const openDrawer = (product) => {
        setSelectedProduct(product);
        setPendingFile(null);
        setPreviewUrl(product.imageUrl || null);
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setSelectedProduct(null);
        setPendingFile(null);
        setPreviewUrl(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await deleteProductAPI(id);
                fetchProducts();
            } catch {
                alert('Lỗi xóa sản phẩm!');
            }
        }
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Ảnh vượt quá 5MB!');
            return;
        }
        setPendingFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files[0]);
    };

    const handleSave = async () => {
        if (!pendingFile || !selectedProduct) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('ImageFile', pendingFile);
            await uploadProductImageAPI(selectedProduct.id, formData);
            await fetchProducts();
            setPendingFile(null);
            alert('Cập nhật hình ảnh thành công!');
            closeDrawer();
        } catch {
            alert('Lỗi upload ảnh!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#f3f4f6', width: 48, height: 48 }}>
                            <LocalCafeIcon sx={{ color: '#10b981', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                                Quản Lý Sản Phẩm
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Quản lý thông tin và hình ảnh sản phẩm
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenModal(true)}
                        sx={{
                            bgcolor: '#10b981', textTransform: 'none', fontWeight: 500, px: 3,
                            '&:hover': { bgcolor: '#059669' }
                        }}
                    >
                        Thêm Sản Phẩm
                    </Button>
                </Box>
            </Paper>

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2, width: 60 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Hình ảnh & Tên</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Giá</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Danh Mục</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>TG Pha Chế</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>Hành Động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => openDrawer(row)}
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: selectedProduct?.id === row.id ? '#f0fdf4' : 'inherit',
                                        '&:hover': { bgcolor: selectedProduct?.id === row.id ? '#f0fdf4' : '#f9fafb' },
                                        '&:last-child td': { border: 0 }
                                    }}
                                >
                                    <TableCell>
                                        <Chip label={`#${row.id}`} size="small" sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 500 }} />
                                    </TableCell>

                                    {/* ← Cột mới: thumbnail + tên */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                width: 40, height: 40, borderRadius: '8px',
                                                border: '1px solid #e5e7eb', overflow: 'hidden',
                                                bgcolor: '#d1fae5', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                {row.imageUrl
                                                    ? <img src={row.imageUrl} alt={row.name}
                                                           style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <LocalCafeIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                                }
                                            </Box>
                                            <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                                                {row.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600, color: '#10b981' }}>
                                            {row.price.toLocaleString('vi-VN')} ₫
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={row.categoryName} size="small"
                                              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 500 }} />
                                    </TableCell>
                                    <TableCell sx={{ color: '#6b7280' }}>{row.preparationTime} phút</TableCell>
                                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                        <IconButton size="small" onClick={() => openDrawer(row)}
                                            sx={{ mr: 0.5, '&:hover': { bgcolor: '#fffbeb', color: '#f59e0b' } }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(row.id)}
                                            sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <LocalCafeIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                                        <Typography sx={{ color: '#9ca3af' }}>Chưa có sản phẩm nào</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* ===== DRAWER CẤU HÌNH ===== */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={closeDrawer}
                variant="persistent"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        border: 'none',
                        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
                        top: 0,
                        height: '100%'
                    }
                }}
            >
                {selectedProduct && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Drawer header */}
                        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827' }}>
                                    Cấu hình sản phẩm
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    {selectedProduct.name}
                                </Typography>
                            </Box>
                            <IconButton size="small" onClick={closeDrawer}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Drawer body */}
                        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

                            {/* Upload zone */}
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Hình ảnh sản phẩm
                            </Typography>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                            />

                            {previewUrl ? (
                                /* Preview mode */
                                <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb', mb: 1.5 }}>
                                    <img src={previewUrl} alt="preview"
                                         style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                                    <Box sx={{
                                        position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.2s',
                                        '&:hover': { opacity: 1 }
                                    }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{ color: '#fff', borderColor: '#fff', textTransform: 'none', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                                        >
                                            Thay ảnh
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                /* Drop zone */
                                <Box
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        border: `2px dashed ${isDragging ? '#10b981' : '#d1d5db'}`,
                                        borderRadius: 2,
                                        py: 4, px: 2,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        bgcolor: isDragging ? '#f0fdf4' : 'transparent',
                                        transition: 'all 0.2s',
                                        mb: 1.5,
                                        '&:hover': { borderColor: '#10b981', bgcolor: '#f0fdf4' }
                                    }}
                                >
                                    <CloudUploadIcon sx={{ fontSize: 36, color: '#9ca3af', mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        <span style={{ color: '#10b981', fontWeight: 600 }}>Nhấn để chọn ảnh</span>
                                        {' '}hoặc kéo thả vào đây
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                        JPG, PNG, WEBP — tối đa 5MB
                                    </Typography>
                                </Box>
                            )}

                            {pendingFile && (
                                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 2 }}>
                                    📎 {pendingFile.name} ({Math.round(pendingFile.size / 1024)} KB) — chờ lưu
                                </Typography>
                            )}
                            {!pendingFile && selectedProduct.imageUrl && (
                                <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mb: 2, wordBreak: 'break-all' }}>
                                    ✅ {selectedProduct.imageUrl}
                                </Typography>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* Product info */}
                            {[
                                { label: 'Tên sản phẩm', value: selectedProduct.name },
                                { label: 'Giá bán', value: selectedProduct.price.toLocaleString('vi-VN') + ' ₫' },
                                { label: 'Danh mục', value: selectedProduct.categoryName },
                                { label: 'Thời gian pha chế', value: selectedProduct.preparationTime + ' phút' },
                            ].map(f => (
                                <Box key={f.label} sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {f.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, color: '#111827', bgcolor: '#f9fafb', px: 1.5, py: 1, borderRadius: 1, border: '1px solid #e5e7eb' }}>
                                        {f.value}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Drawer footer */}
                        <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 1 }}>
                            <Button fullWidth variant="outlined" onClick={closeDrawer}
                                    sx={{ textTransform: 'none', color: '#6b7280', borderColor: '#d1d5db' }}>
                                Huỷ
                            </Button>
                            <Button
                                fullWidth variant="contained"
                                onClick={handleSave}
                                disabled={!pendingFile || uploading}
                                startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : null}
                                sx={{ textTransform: 'none', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, '&:disabled': { bgcolor: '#d1d5db' } }}
                            >
                                {uploading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Drawer>

            <ModalAddProduct open={openModal} handleClose={() => setOpenModal(false)} fetchProducts={fetchProducts} />
        </Box>
    );
};

export default QuanLySanPham;