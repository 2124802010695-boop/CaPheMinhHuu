import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, IconButton, Typography,
    Grid, InputAdornment, Alert, CircularProgress, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { createBatchAPI } from '../services/batchService';

const ModalAddBatch = ({ open, handleClose, ingredient, fetchIngredients }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getCurrentDate = () => new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({
        quantity: '',
        importPricePerBaseUnit: '',
        importDate: getCurrentDate(),
        expiryDate: '',
        batchCode: '',
    });

    // Reset khi mở
    React.useEffect(() => {
        if (open) {
            setForm({ quantity: '', importPricePerBaseUnit: '', importDate: getCurrentDate(), expiryDate: '', batchCode: '' });
            setError('');
        }
    }, [open]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const validate = () => {
        if (!form.quantity || Number(form.quantity) <= 0) { setError('Số lượng phải lớn hơn 0'); return false; }
        if (!form.importPricePerBaseUnit || Number(form.importPricePerBaseUnit) <= 0) { setError('Giá nhập phải lớn hơn 0'); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await createBatchAPI(ingredient.id, {
                batchCode: form.batchCode || null,
                quantity: Number(form.quantity),
                importPricePerBaseUnit: Number(form.importPricePerBaseUnit),
                importDate: form.importDate,
                expiryDate: form.expiryDate || null,
                manufactureDate: null,
                locationId: null,
            });
            await fetchIngredients();
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể thêm lô hàng');
        } finally {
            setLoading(false);
        }
    };

    if (!ingredient) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ bgcolor: '#10b981', color: 'white', py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AddCircleOutlineIcon />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Nhập Thêm Lô Hàng</Typography>
                            <Typography variant="caption" sx={{ opacity: .85 }}>
                                {ingredient.name} — {ingredient.baseUnit}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleClose} disabled={loading} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>
                {/* Thông tin nguyên liệu */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Chip label={`SKU: ${ingredient.sku || 'N/A'}`} size="small" variant="outlined" />
                    <Chip label={`Đơn vị: ${ingredient.baseUnit}`} size="small" color="primary" variant="outlined" />
                    <Chip
                        label={`Tồn hiện tại: ${(ingredient.batches || []).reduce((s, b) => s + (b.currentQuantity ?? 0), 0).toLocaleString()} ${ingredient.baseUnit}`}
                        size="small" color="success" variant="outlined"
                    />
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            SỐ LƯỢNG NHẬP *
                        </Typography>
                        <TextField fullWidth size="small" type="number" name="quantity"
                            value={form.quantity} onChange={handleChange} disabled={loading}
                            placeholder="VD: 10"
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
                            placeholder="VD: 50000"
                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <Typography variant="caption">đ/{ingredient.baseUnit}</Typography>
                                </InputAdornment>
                            }}
                        />
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
                            HẠN SỬ DỤNG
                        </Typography>
                        <TextField fullWidth size="small" type="date" name="expiryDate"
                            value={form.expiryDate} onChange={handleChange} disabled={loading} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            MÃ LÔ HÀNG (tùy chọn)
                        </Typography>
                        <TextField fullWidth size="small" name="batchCode"
                            value={form.batchCode} onChange={handleChange} disabled={loading}
                            placeholder="Để trống sẽ tự động tạo" />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #e5e7eb' }}>
                <Button onClick={handleClose} disabled={loading} variant="outlined" color="inherit"
                    sx={{ textTransform: 'none' }}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} /> : <SaveIcon />}
                    sx={{ bgcolor: '#10b981', textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}>
                    {loading ? 'Đang lưu...' : 'Xác nhận nhập hàng'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddBatch;