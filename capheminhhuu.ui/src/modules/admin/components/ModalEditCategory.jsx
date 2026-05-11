import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, IconButton, Typography, Alert, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { updateCategoryAPI } from '../services/categoryService';

const ModalEditCategory = ({ open, handleClose, category, fetchCategories }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', description: '' });

    useEffect(() => {
        if (open && category) {
            setForm({ name: category.name || '', description: category.description || '' });
            setError('');
        }
    }, [open, category]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) { setError('Tên danh mục không được để trống'); return; }
        setLoading(true);
        try {
            await updateCategoryAPI(category.id, { name: form.name.trim(), description: form.description });
            await fetchCategories();
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể cập nhật danh mục');
        } finally {
            setLoading(false);
        }
    };

    if (!category) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ bgcolor: '#f59e0b', color: 'white', py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <EditIcon />
                        <Typography variant="h6" fontWeight="bold">Chỉnh Sửa Danh Mục</Typography>
                    </Box>
                    <IconButton onClick={handleClose} disabled={loading} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField fullWidth size="small" label="Tên danh mục *"
                        name="name" value={form.name} onChange={handleChange}
                        disabled={loading} inputProps={{ maxLength: 200 }} />
                    <TextField fullWidth size="small" label="Mô tả"
                        name="description" value={form.description} onChange={handleChange}
                        disabled={loading} multiline rows={3} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb' }}>
                <Button onClick={handleClose} disabled={loading} variant="outlined" color="inherit"
                    sx={{ textTransform: 'none' }}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} /> : <SaveIcon />}
                    sx={{ bgcolor: '#f59e0b', textTransform: 'none', '&:hover': { bgcolor: '#d97706' } }}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalEditCategory;
