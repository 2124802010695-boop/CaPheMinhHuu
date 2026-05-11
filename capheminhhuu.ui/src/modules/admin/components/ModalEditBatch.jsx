import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, IconButton, Typography,
    Grid, InputAdornment, Alert, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { updateBatchAPI } from '../services/batchService';

const ModalEditBatch = ({ open, handleClose, batch, ingredient, fetchIngredients }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try { return new Date(dateStr).toISOString().split('T')[0]; } catch { return ''; }
    };

    const [form, setForm] = useState({
        quantity: '',
        importPricePerBaseUnit: '',
        importDate: '',
        manufactureDate: '',
        expiryDate: '',
        batchCode: '',
    });

    useEffect(() => {
        if (open && batch) {
            setForm({
                quantity: batch.currentQuantity?.toString() || '',
                importPricePerBaseUnit: batch.importPricePerBaseUnit?.toString() || '',
                importDate: formatDateForInput(batch.importDate),
                manufactureDate: formatDateForInput(batch.manufactureDate),
                expiryDate: formatDateForInput(batch.expiryDate),
                batchCode: batch.batchCode || '',
            });
            setError('');
        }
    }, [open, batch]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const validate = () => {
        if (!form.quantity || Number(form.quantity) < 0) { setError('Số lượng không hợp lệ'); return false; }
        if (form.importPricePerBaseUnit === '' || form.importPricePerBaseUnit === null || form.importPricePerBaseUnit === undefined || Number(form.importPricePerBaseUnit) < 0) { setError('Giá nhập không hợp lệ'); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await updateBatchAPI(ingredient.id, batch.id, {
                batchCode: form.batchCode || null,
                quantity: Number(form.quantity),
                importPricePerBaseUnit: Number(form.importPricePerBaseUnit),
                importDate: form.importDate || null,
                manufactureDate: form.manufactureDate || null,
                expiryDate: form.expiryDate || null,
            });
            await fetchIngredients();
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể cập nhật lô hàng');
        } finally {
            setLoading(false);
        }
    };

    if (!batch || !ingredient) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ bgcolor: '#f59e0b', color: 'white', py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <EditIcon />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Chỉnh Sửa Lô Hàng</Typography>
                            <Typography variant="caption" sx={{ opacity: .85 }}>
                                {ingredient.name} — Lô: {batch.batchCode || batch.id}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleClose} disabled={loading} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            SỐ LƯỢNG HIỆN TẠI *
                        </Typography>
                        <TextField fullWidth size="small" type="number" name="quantity"
                            value={form.quantity} onChange={handleChange} disabled={loading}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <Typography variant="caption">{ingredient.baseUnit}</Typography>
                                </InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            GIÁ NHẬP *
                        </Typography>
                        <TextField fullWidth size="small" type="number" name="importPricePerBaseUnit"
                            value={form.importPricePerBaseUnit} onChange={handleChange} disabled={loading}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <Typography variant="caption">đ/{ingredient.baseUnit}</Typography>
                                </InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            MÃ LÔ HÀNG
                        </Typography>
                        <TextField fullWidth size="small" name="batchCode"
                            value={form.batchCode} onChange={handleChange} disabled={loading} />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            NGÀY NHẬP
                        </Typography>
                        <TextField fullWidth size="small" type="date" name="importDate"
                            value={form.importDate} onChange={handleChange} disabled={loading} />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            NGÀY SẢN XUẤT
                        </Typography>
                        <TextField fullWidth size="small" type="date" name="manufactureDate"
                            value={form.manufactureDate} onChange={handleChange} disabled={loading} />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            HẠN SỬ DỤNG
                        </Typography>
                        <TextField fullWidth size="small" type="date" name="expiryDate"
                            value={form.expiryDate} onChange={handleChange} disabled={loading} />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #e5e7eb' }}>
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

export default ModalEditBatch;
