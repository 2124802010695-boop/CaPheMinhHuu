import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Box, IconButton,
    Select, MenuItem, InputAdornment,
    Typography, Paper, Alert, CircularProgress,
    ToggleButton, ToggleButtonGroup, Checkbox, FormControlLabel, Chip, Stack, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from '../../utils/axiosCustomize'; // Dùng axios đã config sẵn token

import { createIngredientAPI } from '../../services/ingredientService';
import { getIngredientCategoriesAPI } from '../../services/ingredientCategoryService';

// --- SUB-COMPONENTS CHO GIAO DIỆN TĨNH ---

// 1. Label Tĩnh (Nằm trên ô input)
const FieldLabel = ({ children, required }) => (
    <Typography
        variant="caption"
        fontWeight="700"
        sx={{
            mb: 0.5,
            display: 'block',
            color: '#475569',
            fontSize: '0.75rem',
            textTransform: 'uppercase'
        }}
    >
        {children} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </Typography>
);

// 2. Custom Input Style (Để đồng bộ height và bỏ border thừa)
const inputStyle = {
    '& .MuiOutlinedInput-root': {
        bgcolor: 'white',
        fontSize: '0.875rem',
        '& fieldset': { borderColor: '#e2e8f0' },
        '&:hover fieldset': { borderColor: '#cbd5e1' },
        '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: '1px' }, // Border mỏng khi focus
    },
    '& .MuiInputBase-input': { padding: '8px 12px' } // Padding nhỏ gọn
};

// Helper: Danh sách gợi ý chọn nhanh
const QUICK_UNITS = {
    solid: ['bao', 'túi', 'hộp', 'thùng'],
    liquid: ['thùng', 'chai', 'can', 'bình']
};

const ModalAddIngredient = ({ open, handleClose, fetchIngredients }) => {
    // --- STATE & LOGIC GIỮ NGUYÊN ---
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [type, setType] = useState('solid');

    const getCurrentDate = () => new Date().toISOString().split('T')[0];

    const [formValues, setFormValues] = useState({
        name: '', sku: '', ingredientCategoryId: '', baseUnit: 'g',
        minStock: 0, maxStock: 0, defaultShelfLifeDays: 180,
        packagingUnit: 'thùng', capacity: '', hasInnerUnit: false,
        innerCount: '', weightPerInner: '', importQuantity: 1,
        costPricePerUnit: '', importDate: getCurrentDate(), expiryDate: ''
    });

    // SKU Generation
    const [generatingSKU, setGeneratingSKU] = useState(false);

    const generateSKU = async () => {
        if (!formValues.name || formValues.name.length < 2) return;

        setGeneratingSKU(true);
        try {
            const response = await axios.post('/Ingredient/generate-sku', {
                name: formValues.name
            });
            setFormValues(prev => ({ ...prev, sku: response.sku }));
        } catch (error) {
            console.error('Error generating SKU:', error);
        } finally {
            setGeneratingSKU(false);
        }
    };

    useEffect(() => {
        if (open) {
            getIngredientCategoriesAPI().then(res => setCategories(res || [])).catch(() => { });
        }
    }, [open]);

    useEffect(() => {
        const count = formValues.hasInnerUnit ? (Number(formValues.innerCount) || 0) : 1;
        const weight = Number(formValues.weightPerInner) || 0;
        const total = count * weight;
        if (weight > 0) setFormValues(prev => ({ ...prev, capacity: total > 0 ? total : '' }));
    }, [formValues.innerCount, formValues.weightPerInner, formValues.hasInnerUnit]);

    const handleTypeChange = (event, newType) => {
        if (newType !== null) {
            setType(newType);
            setFormValues(prev => ({
                ...prev, baseUnit: newType === 'solid' ? 'g' : 'ml',
                packagingUnit: newType === 'solid' ? 'bao' : 'thùng',
                capacity: '', hasInnerUnit: false, innerCount: '', weightPerInner: ''
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        if (inputType === 'checkbox' && name === 'hasInnerUnit') {
            setFormValues(prev => ({ ...prev, hasInnerUnit: checked, innerCount: checked ? prev.innerCount : '' }));
        } else {
            setFormValues(prev => ({ ...prev, [name]: value }));
        }
        setError('');
    };

    const handleQuickUnitSelect = (unitVal) => {
        setFormValues(prev => ({ ...prev, packagingUnit: unitVal }));
    };

    const calculateTotalCapacity = () => Number(formValues.capacity) || 0;

    const validateForm = () => {
        if (!formValues.name.trim()) { setError('Tên nguyên liệu không được để trống'); return false; }
        if (!formValues.ingredientCategoryId) { setError('Vui lòng chọn nhóm lưu trữ'); return false; }
        if (!formValues.capacity || Number(formValues.capacity) <= 0) {
            setError(formValues.hasInnerUnit ? 'Vui lòng nhập đủ số lượng và trọng lượng gói' : 'Vui lòng nhập dung tích/trọng lượng');
            return false;
        }
        if (!formValues.importQuantity || Number(formValues.importQuantity) <= 0) { setError('Số lượng nhập phải lớn hơn 0'); return false; }
        if (!formValues.costPricePerUnit || Number(formValues.costPricePerUnit) <= 0) { setError('Giá vốn phải lớn hơn 0'); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError('');
        try {
            const capacityPerUnit = calculateTotalCapacity();
            const totalStock = Number(formValues.importQuantity) * capacityPerUnit;
            const importPricePerBaseUnit = Number(formValues.costPricePerUnit) / capacityPerUnit;

            const payload = {
                name: formValues.name.trim(),
                sku: formValues.sku.trim() || null,
                baseUnit: formValues.baseUnit,
                ingredientCategoryId: Number(formValues.ingredientCategoryId),
                minStock: Number(formValues.minStock),
                maxStock: Number(formValues.maxStock),
                defaultShelfLifeDays: Number(formValues.defaultShelfLifeDays),
                units: capacityPerUnit > 1 ? [{
                    unitName: formValues.packagingUnit,
                    conversionRate: capacityPerUnit,
                    isBaseUnit: false
                }] : null,
                initialBatch: {
                    batchCode: null, quantity: totalStock,
                    importPricePerBaseUnit: importPricePerBaseUnit,
                    importDate: formValues.importDate,
                    manufactureDate: null,
                    expiryDate: formValues.expiryDate || null,
                    locationId: null
                }
            };

            await createIngredientAPI(payload);
            await fetchIngredients();
            handleClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Không thể tạo nguyên liệu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xl"
            PaperProps={{ sx: { borderRadius: 2, height: 'auto', maxHeight: '95vh' } }}>

            {/* HEADER */}
            <DialogTitle sx={{ bgcolor: '#667eea', color: 'white', py: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <LocalShippingIcon />
                        <Typography variant="h6" fontWeight="bold">Nhập Kho Nguyên Liệu</Typography>
                    </Box>
                    <IconButton onClick={handleClose} disabled={loading} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: '#f1f5f9', overflowX: 'hidden' }}>
                <Box sx={{ p: 3, display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>

                    {/* --- CỘT TRÁI --- */}
                    <Box sx={{ flex: { xs: '100%', md: '0 0 35%' }, minWidth: 0 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid #e2e8f0' }}>
                            <Typography variant="subtitle2" fontWeight="800" color="primary" sx={{ mb: 3 }}>
                                1. THÔNG TIN CƠ BẢN
                            </Typography>

                            <Stack spacing={2}>
                                {/* Field Tên */}
                                <Box>
                                    <FieldLabel required>Tên nguyên liệu</FieldLabel>
                                    <TextField
                                        fullWidth placeholder="VD: Cà phê, Đường..."
                                        name="name" value={formValues.name} onChange={handleChange} disabled={loading}
                                        sx={inputStyle}
                                    />
                                </Box>

                                {/* Field SKU & Category */}
                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ flex: 1 }}>
                                        <FieldLabel>Mã SKU</FieldLabel>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Tự động tạo từ tên"
                                                value={formValues.sku}
                                                disabled
                                                sx={{
                                                    ...inputStyle,
                                                    '& .MuiInputBase-input.Mui-disabled': {
                                                        WebkitTextFillColor: '#1976d2',
                                                        fontWeight: 600,
                                                        bgcolor: '#f0f7ff'
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: generatingSKU && (
                                                        <InputAdornment position="end">
                                                            <CircularProgress size={16} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                            <IconButton
                                                color="primary"
                                                onClick={generateSKU}
                                                disabled={!formValues.name || formValues.name.length < 2 || generatingSKU || loading}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#e3f2fd',
                                                    '&:hover': { bgcolor: '#bbdefb' },
                                                    '&.Mui-disabled': { bgcolor: '#f5f5f5' },
                                                    height: '37px',
                                                    width: '37px'
                                                }}
                                            >
                                                <RefreshIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <FieldLabel required>Nhóm hàng</FieldLabel>
                                        <Select
                                            fullWidth displayEmpty
                                            name="ingredientCategoryId" value={formValues.ingredientCategoryId} onChange={handleChange} disabled={loading}
                                            sx={{ ...inputStyle['& .MuiOutlinedInput-root'], height: '37px' }} // Fix height match textfield
                                        >
                                            <MenuItem value="" disabled><span style={{ color: '#9ca3af' }}>Chọn nhóm</span></MenuItem>
                                            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                                        </Select>
                                    </Box>
                                </Stack>

                                <Divider sx={{ borderStyle: 'dashed' }} />

                                {/* Loại vật lý */}
                                <Box>
                                    <FieldLabel>Loại vật lý</FieldLabel>
                                    <ToggleButtonGroup
                                        value={type} exclusive onChange={handleTypeChange}
                                        fullWidth size="small" color="primary" disabled={loading}
                                        sx={{ bgcolor: 'white' }}
                                    >
                                        <ToggleButton value="solid" sx={{ py: 0.8, textTransform: 'none', fontWeight: 600 }}>⚖️ Rắn (g)</ToggleButton>
                                        <ToggleButton value="liquid" sx={{ py: 0.8, textTransform: 'none', fontWeight: 600 }}>💧 Lỏng (ml)</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>

                                {/* Cảnh báo tồn kho */}
                                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}>
                                    <FieldLabel>Cảnh báo tồn kho (Min - Max)</FieldLabel>
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            placeholder="Min" name="minStock" type="number" size="small" fullWidth
                                            value={formValues.minStock} onChange={handleChange} disabled={loading}
                                            sx={inputStyle}
                                        />
                                        <TextField
                                            placeholder="Max" name="maxStock" type="number" size="small" fullWidth
                                            value={formValues.maxStock} onChange={handleChange} disabled={loading}
                                            sx={inputStyle}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>

                    {/* --- CỘT PHẢI --- */}
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* QUY CÁCH */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight="800" color="primary">
                                    2. QUY CÁCH NHẬP HÀNG
                                </Typography>
                                <Chip label={`Cơ sở: ${formValues.baseUnit}`} size="small" sx={{ borderRadius: 1, fontWeight: 600, bgcolor: '#e0e7ff', color: '#4338ca' }} />
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <FieldLabel>Đơn vị tính</FieldLabel>
                                <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                                    {QUICK_UNITS[type].map(u => (
                                        <Chip
                                            key={u}
                                            label={u.charAt(0).toUpperCase() + u.slice(1)}
                                            onClick={() => !loading && handleQuickUnitSelect(u)}
                                            color={formValues.packagingUnit === u ? 'primary' : 'default'}
                                            variant={formValues.packagingUnit === u ? 'filled' : 'outlined'}
                                            sx={{ borderRadius: 1.5, px: 2, fontWeight: 500, cursor: 'pointer' }}
                                        />
                                    ))}
                                    <Box sx={{ width: 120 }}>
                                        <TextField
                                            placeholder="Nhập..." size="small" fullWidth
                                            name="packagingUnit" value={formValues.packagingUnit} onChange={handleChange} disabled={loading}
                                            sx={inputStyle}
                                        />
                                    </Box>
                                </Stack>
                            </Box>

                            {/* BẢNG TÍNH QUY ĐỔI CỨNG (FIXED) */}
                            <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px dashed #94a3b8' }}>
                                <FormControlLabel
                                    control={<Checkbox checked={formValues.hasInnerUnit} onChange={handleChange} name="hasInnerUnit" disabled={loading} size="small" />}
                                    label={<Typography variant="body2" fontWeight="700" color="#334155">Định lượng thành phần (Chia gói)</Typography>}
                                    sx={{ mb: 1.5 }}
                                />

                                <Grid container spacing={1} alignItems="flex-end">
                                    {/* Cột 1: Số lượng */}
                                    <Grid item xs={3}>
                                        <FieldLabel>{formValues.hasInnerUnit ? "Số gói" : "Số lượng"}</FieldLabel>
                                        <TextField
                                            size="small" type="number" fullWidth
                                            name="innerCount"
                                            value={formValues.hasInnerUnit ? formValues.innerCount : 1}
                                            onChange={handleChange}
                                            disabled={!formValues.hasInnerUnit || loading}
                                            sx={{ ...inputStyle, bgcolor: formValues.hasInnerUnit ? 'white' : '#e2e8f0' }}
                                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                        />
                                    </Grid>

                                    <Grid item xs={1} sx={{ textAlign: 'center', pb: 1 }}>
                                        <Typography variant="body1" fontWeight="bold" color="text.secondary">×</Typography>
                                    </Grid>

                                    {/* Cột 2: Trọng lượng */}
                                    <Grid item xs={4}>
                                        <FieldLabel>{formValues.hasInnerUnit ? "TL/Gói" : `Dung tích`}</FieldLabel>
                                        <TextField
                                            size="small" type="number" fullWidth
                                            name="weightPerInner"
                                            value={formValues.weightPerInner} onChange={handleChange} disabled={loading}
                                            sx={inputStyle}
                                            placeholder="VD: 500"
                                            InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption">{formValues.baseUnit}</Typography></InputAdornment> }}
                                        />
                                    </Grid>

                                    <Grid item xs={1} sx={{ textAlign: 'center', pb: 1 }}>
                                        <ArrowRightAltIcon color="action" />
                                    </Grid>

                                    {/* Cột 3: Tổng */}
                                    <Grid item xs={3}>
                                        <FieldLabel>Tổng</FieldLabel>
                                        <TextField
                                            size="small" disabled value={formValues.capacity} fullWidth
                                            InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" fontWeight="bold">{formValues.baseUnit}</Typography></InputAdornment> }}
                                            sx={{ ...inputStyle, '& .MuiInputBase-root': { bgcolor: '#e2e8f0' }, '& input': { fontWeight: 'bold', color: '#1e293b' } }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>

                        {/* NHẬP HÀNG */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #10b981', bgcolor: '#f0fdf4' }}>
                            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 2, color: '#059669' }}>
                                3. LÔ HÀNG ĐẦU TIÊN
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <FieldLabel required>Số lượng nhập</FieldLabel>
                                    <TextField
                                        type="number" fullWidth size="small"
                                        name="importQuantity" value={formValues.importQuantity} onChange={handleChange} disabled={loading}
                                        sx={inputStyle}
                                        InputProps={{ endAdornment: <Typography variant="caption" sx={{ ml: 1, whiteSpace: 'nowrap' }}>{formValues.packagingUnit}</Typography> }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FieldLabel required>Giá nhập</FieldLabel>
                                    <TextField
                                        type="number" fullWidth size="small"
                                        name="costPricePerUnit" value={formValues.costPricePerUnit} onChange={handleChange} disabled={loading}
                                        sx={inputStyle}
                                        InputProps={{ endAdornment: <Typography variant="caption">₫</Typography> }}
                                    />
                                    <Typography variant="caption" color="success.main" fontWeight="bold" sx={{ mt: 0.5, display: 'block' }}>
                                        ~ {((Number(formValues.costPricePerUnit) || 0) / (calculateTotalCapacity() || 1)).toLocaleString()} ₫/{formValues.baseUnit}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <FieldLabel>Ngày nhập</FieldLabel>
                                    <TextField
                                        type="date" fullWidth size="small"
                                        name="importDate" value={formValues.importDate} onChange={handleChange} disabled={loading}
                                        sx={inputStyle}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FieldLabel>Hạn sử dụng</FieldLabel>
                                    <TextField
                                        type="date" fullWidth size="small"
                                        name="expiryDate" value={formValues.expiryDate} onChange={handleChange} disabled={loading}
                                        sx={inputStyle}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 4, py: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={handleClose} disabled={loading} variant="outlined" color="inherit" sx={{ mr: 1, textTransform: 'none' }}>Hủy bỏ</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} sx={{ bgcolor: '#667eea', px: 4, textTransform: 'none' }}>
                    {loading ? 'Đang lưu...' : 'Lưu Nguyên Liệu'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddIngredient;