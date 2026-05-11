import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TextField, IconButton,
    Typography, Box, Chip, Switch
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { getSizesByProductAPI, createSizeAPI, updateSizeAPI, deleteSizeAPI } from '../services/productSizeService';

const ModalManageSizes = ({ open, handleClose, product }) => {
    const [sizes, setSizes] = useState([]);
    const [label, setLabel] = useState('');
    const [priceExtra, setPriceExtra] = useState('');
    const [recipeMultiplier, setRecipeMultiplier] = useState('1.0');
    const [sortOrder, setSortOrder] = useState('0');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (open && product) fetchSizes();
    }, [open, product]);

    const fetchSizes = async () => {
        try {
            const res = await getSizesByProductAPI(product.id);
            if (res) setSizes(res);
        } catch (err) {
            console.error('Lỗi lấy sizes:', err);
        }
    };

    const SIZE_PRESETS = [
        { label: 'S', priceExtra: '0', recipeMultiplier: '0.8', sortOrder: '0' },
        { label: 'M', priceExtra: '0', recipeMultiplier: '1.0', sortOrder: '1' },
        { label: 'L', priceExtra: '5000', recipeMultiplier: '1.3', sortOrder: '2' },
        { label: 'XL', priceExtra: '10000', recipeMultiplier: '1.5', sortOrder: '3' },
    ];

    const applyPreset = (preset) => {
        setLabel(preset.label);
        setPriceExtra(preset.priceExtra);
        setRecipeMultiplier(preset.recipeMultiplier);
        setSortOrder(preset.sortOrder);
    };

    const resetForm = () => {
        setLabel('');
        setPriceExtra('');
        setRecipeMultiplier('1.0');
        setSortOrder('0');
    };

    const handleAdd = async () => {
        if (!label.trim()) return alert('Vui lòng nhập tên size!');
        const multiplier = parseFloat(recipeMultiplier);
        if (isNaN(multiplier) || multiplier < 0.1 || multiplier > 10)
            return alert('Hệ số công thức phải từ 0.1 đến 10!');
        setAdding(true);
        try {
            await createSizeAPI(product.id, {
                label: label.trim(),
                priceExtra: parseFloat(priceExtra) || 0,
                recipeMultiplier: multiplier,
                sortOrder: parseInt(sortOrder) || 0
            });
            resetForm();
            fetchSizes();
        } catch (err) {
            alert(err.response?.data || 'Lỗi thêm size!');
        } finally {
            setAdding(false);
        }
    };

    const handleToggleActive = async (size) => {
        try {
            await updateSizeAPI(product.id, size.id, { isActive: !size.isActive });
            fetchSizes();
        } catch (err) {
            alert('Lỗi cập nhật trạng thái!');
        }
    };

    const handleDelete = async (sizeId) => {
        if (!window.confirm('Xóa size này?')) return;
        try {
            await deleteSizeAPI(product.id, sizeId);
            fetchSizes();
        } catch (err) {
            alert('Lỗi xóa size!');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', py: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>QUẢN LÝ SIZE</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>— {product?.name}</Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Form thêm size mới */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', border: '1px dashed #ccc', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Thêm size mới</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: '#6b7280', alignSelf: 'center', mr: 0.5 }}>Chọn nhanh:</Typography>
                        {SIZE_PRESETS.map(p => (
                            <Chip
                                key={p.label}
                                label={p.label}
                                size="small"
                                onClick={() => applyPreset(p)}
                                sx={{ cursor: 'pointer', fontWeight: 700,
                                    bgcolor: label === p.label ? '#667eea' : '#f3f4f6',
                                    color: label === p.label ? 'white' : '#374151',
                                    '&:hover': { bgcolor: '#667eea', color: 'white' }
                                }}
                            />
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <TextField
                            label="Tên size *" size="small" value={label}
                            onChange={e => setLabel(e.target.value)}
                            placeholder="S, M, L, XL..." sx={{ width: 100 }}
                            inputProps={{ maxLength: 10 }}
                            helperText=" "
                        />
                        <TextField
                            label="Giá thêm (đ)" size="small" value={priceExtra}
                            onChange={e => setPriceExtra(e.target.value)}
                            placeholder="0" type="number" sx={{ width: 130 }}
                            inputProps={{ min: 0 }}
                            helperText=" "
                        />
                        <TextField
                            label="Hệ số công thức" size="small" value={recipeMultiplier}
                            onChange={e => setRecipeMultiplier(e.target.value)}
                            placeholder="1.0" type="number" sx={{ width: 150 }}
                            inputProps={{ min: 0.1, max: 10, step: 0.1 }}
                            helperText="0.1 – 10"
                        />
                        <TextField
                            label="Thứ tự" size="small" value={sortOrder}
                            onChange={e => setSortOrder(e.target.value)}
                            type="number" sx={{ width: 90 }}
                            inputProps={{ min: 0 }}
                            helperText=" "
                        />
                        <Button
                            variant="contained" startIcon={<AddCircleIcon />}
                            onClick={handleAdd} disabled={adding}
                            sx={{ height: 40, bgcolor: '#667eea', '&:hover': { bgcolor: '#5a6fd6' } }}
                        >
                            Thêm
                        </Button>
                    </Box>
                </Paper>

                {/* Danh sách sizes */}
                {sizes.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        Chưa có size nào. Thêm size đầu tiên ở trên.
                    </Typography>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb' }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Giá thêm</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Hệ số công thức</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thứ tự</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sizes.map(size => (
                                    <TableRow key={size.id} hover>
                                        <TableCell>
                                            <Chip label={size.label} size="small"
                                                sx={{ fontWeight: 700, bgcolor: '#667eea', color: 'white' }} />
                                        </TableCell>
                                        <TableCell>
                                            {size.priceExtra > 0
                                                ? `+${size.priceExtra.toLocaleString('vi-VN')}đ`
                                                : <Typography color="text.secondary" variant="body2">Không thêm</Typography>}
                                        </TableCell>
                                        <TableCell>×{size.recipeMultiplier}</TableCell>
                                        <TableCell>{size.sortOrder}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={size.isActive}
                                                onChange={() => handleToggleActive(size)}
                                                size="small"
                                                color="success"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="error"
                                                onClick={() => handleDelete(size.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} variant="outlined">Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalManageSizes;
