import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Chip, Switch, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Avatar, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IcecreamIcon from '@mui/icons-material/Icecream';
import CloseIcon from '@mui/icons-material/Close';

import {
    getAllToppingsAdminAPI,
    createToppingAPI,
    updateToppingAPI,
    deleteToppingAPI,
    toggleToppingAPI
} from '../services/toppingService';
import { getIngredientsAPI } from '../services/ingredientService';

const emptyForm = { name: '', price: '', portionSize: '', portionUnit: '', ingredientId: '' };

const QuanLyTopping = () => {
    const [toppings, setToppings] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editTopping, setEditTopping] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [ingredients, setIngredients] = useState([]);

    const fetchToppings = async () => {
        try {
            const res = await getAllToppingsAdminAPI();
            if (res) setToppings(res);
        } catch (err) {
            console.error('Lỗi lấy topping:', err);
        }
    };

    const fetchIngredients = async () => {
        try {
            const res = await getIngredientsAPI();
            if (res) setIngredients(res);
        } catch (err) {
            console.error('Lỗi lấy nguyên liệu:', err);
        }
    };

    useEffect(() => { fetchToppings(); fetchIngredients(); }, []);

    const handleOpenAdd = () => {
        setEditTopping(null);
        setForm(emptyForm);
        setOpenModal(true);
    };

    const handleOpenEdit = (topping) => {
        setEditTopping(topping);
        setForm({
            name: topping.name,
            price: topping.price?.toString() || '0',
            portionSize: topping.portionSize?.toString() || '0',
            portionUnit: topping.portionUnit || '',
            ingredientId: topping.ingredientId || ''
        });
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setEditTopping(null);
        setForm(emptyForm);
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return alert('Vui lòng nhập tên topping!');
        const price = parseFloat(form.price);
        if (isNaN(price) || price < 0) return alert('Giá không hợp lệ!');

        const payload = {
            name: form.name.trim(),
            price,
            portionSize: parseFloat(form.portionSize) || 0,
            portionUnit: form.portionUnit || null,
            ingredientId: form.ingredientId || null
        };

        setSaving(true);
        try {
            if (editTopping) {
                await updateToppingAPI(editTopping.id, payload);
            } else {
                await createToppingAPI(payload);
            }
            handleClose();
            fetchToppings();
        } catch (err) {
            alert(err.response?.data || 'Lỗi lưu topping!');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleToppingAPI(id);
            fetchToppings();
        } catch (err) {
            alert('Lỗi cập nhật trạng thái!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa topping này?')) return;
        try {
            await deleteToppingAPI(id);
            fetchToppings();
        } catch (err) {
            alert('Lỗi xóa topping!');
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#fdf2f8', width: 48, height: 48 }}>
                            <IcecreamIcon sx={{ color: '#db2777', fontSize: 28 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                                Quản Lý Topping
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Quản lý topping và liên kết nguyên liệu
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained" startIcon={<AddIcon />}
                        onClick={handleOpenAdd}
                        sx={{ bgcolor: '#db2777', textTransform: 'none', fontWeight: 500, px: 3, '&:hover': { bgcolor: '#be185d' } }}
                    >
                        Thêm Topping
                    </Button>
                </Box>
            </Paper>

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tên Topping</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Giá</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Nguyên liệu</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Định mức</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Trạng thái</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {toppings.map((t) => (
                                <TableRow key={t.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                    <TableCell>
                                        <Chip label={`#${t.id}`} size="small" sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 500 }} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600, color: '#111827' }}>{t.name}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600, color: '#db2777' }}>
                                            {t.price === 0
                                                ? <Chip label="Miễn phí" size="small" sx={{ bgcolor: '#f0fdf4', color: '#15803d' }} />
                                                : `${t.price.toLocaleString('vi-VN')} ₫`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {t.ingredientName
                                            ? <Chip label={t.ingredientName} size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e' }} />
                                            : <Typography variant="body2" color="text.secondary">—</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        {t.portionSize > 0
                                            ? <Typography variant="body2">{t.portionSize} {t.portionUnit}</Typography>
                                            : <Typography variant="body2" color="text.secondary">—</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={t.isActive}
                                            onChange={() => handleToggle(t.id)}
                                            size="small"
                                            color="success"
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                        <IconButton size="small" onClick={() => handleOpenEdit(t)}
                                            sx={{ mr: 0.5, '&:hover': { bgcolor: '#fffbeb', color: '#f59e0b' } }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(t.id)}
                                            sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {toppings.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <IcecreamIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
                                        <Typography sx={{ color: '#9ca3af' }}>Chưa có topping nào</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modal thêm/sửa */}
            <Dialog open={openModal} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #db2777 0%, #f59e0b 100%)',
                    color: 'white', py: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {editTopping ? 'Chỉnh sửa Topping' : 'Thêm Topping mới'}
                    </Typography>
                    <IconButton onClick={handleClose} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Tên topping *" fullWidth size="small"
                            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            inputProps={{ maxLength: 200 }}
                        />
                        <TextField
                            label="Giá (đ)" fullWidth size="small" type="number"
                            value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                            inputProps={{ min: 0 }}
                            helperText="Nhập 0 nếu topping miễn phí"
                        />
                        <Divider><Typography variant="caption" color="text.secondary">Liên kết nguyên liệu (tuỳ chọn)</Typography></Divider>
                        <FormControl fullWidth size="small">
                            <InputLabel>Nguyên liệu liên kết</InputLabel>
                            <Select
                                value={form.ingredientId}
                                label="Nguyên liệu liên kết"
                                onChange={e => {
                                    const ing = ingredients.find(i => i.id === e.target.value);
                                    setForm(f => ({
                                        ...f,
                                        ingredientId: e.target.value,
                                        portionUnit: ing?.baseUnit || f.portionUnit
                                    }));
                                }}
                            >
                                <MenuItem value=""><em>Không liên kết</em></MenuItem>
                                {ingredients.map(ing => (
                                    <MenuItem key={ing.id} value={ing.id}>
                                        {ing.name} ({ing.baseUnit})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                                label="Định mức" size="small" type="number"
                                value={form.portionSize} onChange={e => setForm(f => ({ ...f, portionSize: e.target.value }))}
                                inputProps={{ min: 0 }} sx={{ flex: 1 }}
                            />
                            <TextField
                                label="Đơn vị" size="small"
                                value={form.portionUnit} onChange={e => setForm(f => ({ ...f, portionUnit: e.target.value }))}
                                placeholder="g, ml, cái..." sx={{ flex: 1 }}
                                inputProps={{ maxLength: 20 }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} variant="outlined">Huỷ</Button>
                    <Button
                        onClick={handleSubmit} variant="contained" disabled={saving}
                        sx={{ bgcolor: '#db2777', '&:hover': { bgcolor: '#be185d' } }}
                    >
                        {saving ? 'Đang lưu...' : editTopping ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuanLyTopping;
