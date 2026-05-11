import React, { useState, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, IconButton, Typography,
    Grid, InputAdornment, Alert, CircularProgress,
    Chip, ToggleButton, ToggleButtonGroup, Divider,
    Paper, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { createBatchAPI } from '../services/batchService';

// ─── Helper ───────────────────────────────────────────
const formatNumber = (n) =>
    n != null && !isNaN(n)
        ? Number(n).toLocaleString('vi-VN', { maximumFractionDigits: 4 })
        : '—';

const getCurrentDate = () => new Date().toISOString().split('T')[0];

// ─── Component ────────────────────────────────────────
const ModalAddBatch = ({ open, handleClose, ingredient, fetchIngredients }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('purchase'); // 'purchase' | 'base'
    const [confirmed, setConfirmed] = useState(false);

    const [form, setForm] = useState({
        // Chung
        batchCode: '',
        importDate: getCurrentDate(),
        manufactureDate: '',
        expiryDate: '',
        // Mode purchase
        purchaseUnitId: '',
        purchaseQuantity: '',
        pricePerPurchaseUnit: '',
        // Mode base
        baseQuantity: '',
        pricePerBaseUnit: '',
    });

    // Units quy đổi (bỏ BaseUnit)
    const purchaseUnits = useMemo(() =>
        (ingredient?.units || []).filter(u => !u.isBaseUnit),
        [ingredient]);

    // Reset khi mở
    React.useEffect(() => {
        if (open) {
            // Nếu có purchaseUnits → mặc định mode purchase
            const hasUnits = purchaseUnits.length > 0;
            setMode(hasUnits ? 'purchase' : 'base');
            setForm({
                batchCode: '',
                importDate: getCurrentDate(),
                manufactureDate: '',
                expiryDate: '',
                purchaseUnitId: hasUnits ? purchaseUnits[0].id : '',
                purchaseQuantity: '',
                pricePerPurchaseUnit: '',
                baseQuantity: '',
                pricePerBaseUnit: '',
            });
            setError('');
            setConfirmed(false);
        }
    }, [open, purchaseUnits]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
        setConfirmed(false);
    };

    // Unit đang chọn
    const selectedUnit = useMemo(() =>
        purchaseUnits.find(u => u.id === Number(form.purchaseUnitId)),
        [purchaseUnits, form.purchaseUnitId]);

    // ── Preview tính toán realtime ──
    const preview = useMemo(() => {
        if (mode === 'purchase') {
            const qty = Number(form.purchaseQuantity);
            const price = Number(form.pricePerPurchaseUnit);
            const rate = selectedUnit?.conversionRate || 0;
            if (!qty || !rate) return null;
            const baseQty = qty * rate;
            const pricePerBase = price > 0 ? price / rate : 0;
            const total = price > 0 ? qty * price : 0;
            return { baseQty, pricePerBase, total, qty, unitName: selectedUnit?.unitName };
        } else {
            const qty = Number(form.baseQuantity);
            const price = Number(form.pricePerBaseUnit);
            if (!qty) return null;
            const total = price > 0 ? qty * price : 0;
            return { baseQty: qty, pricePerBase: price, total, qty, unitName: ingredient?.baseUnit };
        }
    }, [mode, form, selectedUnit, ingredient]);

    // ── Validate ──
    const validate = () => {
        if (mode === 'purchase') {
            if (!form.purchaseUnitId) { setError('Vui lòng chọn đơn vị nhập'); return false; }
            if (!form.purchaseQuantity || Number(form.purchaseQuantity) <= 0) {
                setError('Số lượng phải lớn hơn 0'); return false;
            }
            if (form.pricePerPurchaseUnit === '') {
                setError('Vui lòng nhập đơn giá (nhập 0 nếu là hàng tặng)'); return false;
            }
            if (Number(form.pricePerPurchaseUnit) < 0) {
                setError('Đơn giá không được âm'); return false;
            }
        } else {
            if (!form.baseQuantity || Number(form.baseQuantity) <= 0) {
                setError('Số lượng phải lớn hơn 0'); return false;
            }
            if (form.pricePerBaseUnit === '') {
                setError('Vui lòng nhập đơn giá (nhập 0 nếu là hàng tặng)'); return false;
            }
            if (Number(form.pricePerBaseUnit) < 0) {
                setError('Đơn giá không được âm'); return false;
            }
        }
        return true;
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!validate()) return;
        if (!confirmed) {
            setConfirmed(true);
            return;
        }
        setLoading(true);
        try {
            if (mode === 'purchase') {
                await createBatchAPI(ingredient.id, {
                    batchCode: form.batchCode || null,
                    quantity: preview.baseQty,
                    importPricePerBaseUnit: preview.pricePerBase,
                    importDate: form.importDate,
                    expiryDate: form.expiryDate || null,
                    manufactureDate: form.manufactureDate || null,
                    locationId: null,
                    purchaseUnitId: Number(form.purchaseUnitId),
                    purchaseQuantity: Number(form.purchaseQuantity),
                });
            } else {
                await createBatchAPI(ingredient.id, {
                    batchCode: form.batchCode || null,
                    quantity: Number(form.baseQuantity),
                    importPricePerBaseUnit: Number(form.pricePerBaseUnit),
                    importDate: form.importDate,
                    expiryDate: form.expiryDate || null,
                    manufactureDate: form.manufactureDate || null,
                    locationId: null,
                });
            }
            await fetchIngredients();
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.message || 'Không thể thêm lô hàng');
            setConfirmed(false);
        } finally {
            setLoading(false);
        }
    };

    if (!ingredient) return null;

    const currentStock = (ingredient.batches || [])
        .reduce((s, b) => s + (b.currentQuantity ?? 0), 0);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}>

            {/* Header */}
            <DialogTitle sx={{ bgcolor: '#10b981', color: 'white', py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AddCircleOutlineIcon />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                Nhập Thêm Lô Hàng
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: .85 }}>
                                {ingredient.name} — BaseUnit: {ingredient.baseUnit}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleClose} disabled={loading} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>

                {/* Chips thông tin */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                    <Chip label={`SKU: ${ingredient.sku || 'N/A'}`}
                        size="small" variant="outlined" />
                    <Chip label={`Tồn: ${formatNumber(currentStock)} ${ingredient.baseUnit}`}
                        size="small" color="success" variant="outlined" />
                    {purchaseUnits.length === 0 && (
                        <Chip
                            icon={<InfoOutlinedIcon fontSize="small" />}
                            label="Chưa có đơn vị quy đổi"
                            size="small" color="warning" variant="outlined"
                        />
                    )}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Toggle mode */}
                {purchaseUnits.length > 0 && (
                    <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" fontWeight="700"
                            color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            CÁCH NHẬP
                        </Typography>
                        <ToggleButtonGroup
                            value={mode}
                            exclusive
                            onChange={(_, val) => { if (val) { setMode(val); setConfirmed(false); setError(''); } }}
                            size="small" fullWidth
                        >
                            <ToggleButton value="purchase" sx={{ textTransform: 'none', fontWeight: 500 }}>
                                Theo đơn vị mua (kg, bao, thùng...)
                            </ToggleButton>
                            <ToggleButton value="base" sx={{ textTransform: 'none', fontWeight: 500 }}>
                                Theo {ingredient.baseUnit} (BaseUnit)
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}

                {/* Gợi ý khi không có PurchaseUnit */}
                {purchaseUnits.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }} icon={<InfoOutlinedIcon />}>
                        Bạn đang nhập theo <strong>{ingredient.baseUnit}</strong> (BaseUnit).
                        Để nhập theo kg/bao/thùng → thêm đơn vị quy đổi trong{' '}
                        <strong>Chỉnh Sửa Nguyên Liệu</strong> trước.
                    </Alert>
                )}

                <Paper elevation={0} sx={{
                    p: 2.5, bgcolor: '#fff',
                    borderRadius: 2, border: '1px solid #e5e7eb', mb: 2
                }}>

                    {/* MODE 1: Theo PurchaseUnit */}
                    {mode === 'purchase' && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small" required>
                                    <InputLabel>Đơn vị nhập</InputLabel>
                                    <Select
                                        name="purchaseUnitId"
                                        value={form.purchaseUnitId}
                                        label="Đơn vị nhập"
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {purchaseUnits.map(u => (
                                            <MenuItem key={u.id} value={u.id}>
                                                {u.unitName}
                                                <Typography variant="caption"
                                                    sx={{ ml: 1, color: '#6b7280' }}>
                                                    (1 {u.unitName} = {formatNumber(u.conversionRate)} {ingredient.baseUnit})
                                                </Typography>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" fontWeight="700"
                                    color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    SỐ LƯỢNG NHẬP *
                                </Typography>
                                <TextField fullWidth size="small" type="number"
                                    name="purchaseQuantity"
                                    value={form.purchaseQuantity}
                                    onChange={handleChange} disabled={loading}
                                    placeholder="VD: 2"
                                    inputProps={{ min: 0.001, step: 'any' }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography variant="caption">
                                                    {selectedUnit?.unitName || ''}
                                                </Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" fontWeight="700"
                                    color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    ĐƠN GIÁ *
                                </Typography>
                                <TextField fullWidth size="small" type="number"
                                    name="pricePerPurchaseUnit"
                                    value={form.pricePerPurchaseUnit}
                                    onChange={handleChange} disabled={loading}
                                    placeholder="0 = hàng tặng"
                                    inputProps={{ min: 0, step: 'any' }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography variant="caption">
                                                    đ/{selectedUnit?.unitName || ''}
                                                </Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {/* MODE 2: Theo BaseUnit */}
                    {mode === 'base' && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" fontWeight="700"
                                    color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    SỐ LƯỢNG NHẬP *
                                </Typography>
                                <TextField fullWidth size="small" type="number"
                                    name="baseQuantity"
                                    value={form.baseQuantity}
                                    onChange={handleChange} disabled={loading}
                                    placeholder="VD: 10000"
                                    inputProps={{ min: 0.001, step: 'any' }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography variant="caption">
                                                    {ingredient.baseUnit}
                                                </Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" fontWeight="700"
                                    color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    GIÁ / {ingredient.baseUnit.toUpperCase()} *
                                </Typography>
                                <TextField fullWidth size="small" type="number"
                                    name="pricePerBaseUnit"
                                    value={form.pricePerBaseUnit}
                                    onChange={handleChange} disabled={loading}
                                    placeholder="0 = hàng tặng"
                                    inputProps={{ min: 0, step: 'any' }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography variant="caption">
                                                    đ/{ingredient.baseUnit}
                                                </Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {/* Preview realtime */}
                    {preview && (
                        <Box sx={{
                            mt: 2, p: 1.5, bgcolor: '#f0fdf4',
                            borderRadius: 1.5, border: '1px solid #bbf7d0'
                        }}>
                            <Typography variant="caption" fontWeight="700"
                                color="#15803d" sx={{ display: 'block', mb: 0.5 }}>
                                QUY ĐỔI TỰ ĐỘNG
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {mode === 'purchase' && (
                                    <Typography variant="body2" color="#15803d">
                                        {formatNumber(preview.qty)} {preview.unitName}
                                        {' → '}
                                        <strong>{formatNumber(preview.baseQty)} {ingredient.baseUnit}</strong>
                                    </Typography>
                                )}
                                <Typography variant="body2" color="#15803d">
                                    Giá/{ingredient.baseUnit}:{' '}
                                    <strong>{formatNumber(preview.pricePerBase)}đ</strong>
                                </Typography>
                                {preview.total > 0 && (
                                    <Typography variant="body2" color="#15803d">
                                        Tổng tiền:{' '}
                                        <strong>{formatNumber(preview.total)}đ</strong>
                                    </Typography>
                                )}
                                {preview.total === 0 && (
                                    <Chip label="Hàng tặng / Mẫu thử"
                                        size="small" color="warning" variant="outlined" />
                                )}
                            </Box>
                        </Box>
                    )}
                </Paper>

                {/* Thông tin lô hàng */}
                <Paper elevation={0} sx={{
                    p: 2.5, bgcolor: '#fff',
                    borderRadius: 2, border: '1px solid #e5e7eb'
                }}>
                    <Typography variant="caption" fontWeight="700"
                        color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        THÔNG TIN LÔ HÀNG
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}>
                                Ngày nhập *
                            </Typography>
                            <TextField fullWidth size="small" type="date"
                                name="importDate" value={form.importDate}
                                onChange={handleChange} disabled={loading} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}>
                                Hạn sử dụng
                            </Typography>
                            <TextField fullWidth size="small" type="date"
                                name="expiryDate" value={form.expiryDate}
                                onChange={handleChange} disabled={loading} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}>
                                Ngày sản xuất
                            </Typography>
                            <TextField fullWidth size="small" type="date"
                                name="manufactureDate" value={form.manufactureDate}
                                onChange={handleChange} disabled={loading} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary"
                                sx={{ display: 'block', mb: 0.5 }}>
                                Mã lô (tùy chọn)
                            </Typography>
                            <TextField fullWidth size="small"
                                name="batchCode" value={form.batchCode}
                                onChange={handleChange} disabled={loading}
                                placeholder="Tự động nếu để trống" />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Confirm step */}
                {confirmed && preview && (
                    <Alert severity="warning" sx={{ mt: 2 }}
                        icon={<CheckCircleOutlineIcon />}>
                        <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
                            Xác nhận nhập kho?
                        </Typography>
                        <Typography variant="body2">
                            {mode === 'purchase'
                                ? `${formatNumber(preview.qty)} ${preview.unitName} = ${formatNumber(preview.baseQty)} ${ingredient.baseUnit}`
                                : `${formatNumber(preview.baseQty)} ${ingredient.baseUnit}`
                            }
                            {preview.total > 0
                                ? ` | Tổng: ${formatNumber(preview.total)}đ`
                                : ' | Hàng tặng'
                            }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Nhấn "Xác nhận nhập hàng" lần nữa để lưu
                        </Typography>
                    </Alert>
                )}

            </DialogContent>

            <DialogActions sx={{
                px: 3, py: 2, bgcolor: 'white',
                borderTop: '1px solid #e5e7eb', gap: 1
            }}>
                <Button onClick={handleClose} disabled={loading}
                    variant="outlined" color="inherit"
                    sx={{ textTransform: 'none' }}>
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !preview}
                    startIcon={loading
                        ? <CircularProgress size={18} />
                        : confirmed ? <CheckCircleOutlineIcon /> : <SaveIcon />
                    }
                    sx={{
                        bgcolor: confirmed ? '#059669' : '#10b981',
                        textTransform: 'none',
                        '&:hover': { bgcolor: confirmed ? '#047857' : '#059669' },
                        '&.Mui-disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' }
                    }}
                >
                    {loading
                        ? 'Đang lưu...'
                        : confirmed
                            ? 'Xác nhận nhập hàng'
                            : 'Kiểm tra & Xác nhận'
                    }
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddBatch;