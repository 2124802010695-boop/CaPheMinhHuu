import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Box, IconButton,
    FormControl, InputLabel, Select, MenuItem, InputAdornment,
    Typography, Paper, Alert, CircularProgress,
    Chip, Tooltip, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { updateIngredientAPI, generateSkuAPI, addUnitAPI, deleteUnitAPI } from '../services/ingredientService';
import { getIngredientCategoriesAPI } from '../services/ingredientCategoryService';

const ModalEditIngredient = ({ open, handleClose, ingredient, fetchIngredients }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [formValues, setFormValues] = useState({
        name: '', baseUnit: '', sku: '',
        ingredientCategoryId: '', minStock: 0, maxStock: 0, defaultShelfLifeDays: 180
    });
    const [initialValues, setInitialValues] = useState(null);
    const [generatingSKU, setGeneratingSKU] = useState(false);
    const [unitForm, setUnitForm] = useState({ unitName: '', conversionRate: '' });
    const [unitLoading, setUnitLoading] = useState(false);
    const [unitError, setUnitError] = useState('');
    const [deletingUnitId, setDeletingUnitId] = useState(null);

    const generateSKU = async () => {
        if (!formValues.name || formValues.name.length < 2) return;
        setGeneratingSKU(true);
        try {
            const res = await generateSkuAPI(formValues.name);
            setFormValues(prev => ({ ...prev, sku: res.sku || res }));
        } catch (err) {
            console.error('Error generating SKU:', err);
        } finally {
            setGeneratingSKU(false);
        }
    };

    useEffect(() => {
        if (open) {
            const loadCategories = async () => {
                try {
                    const res = await getIngredientCategoriesAPI();
                    setCategories(res || []);
                } catch (err) {
                    console.error('Failed to load categories:', err);
                    setError('Không thể tải danh sách nhóm lưu trữ');
                }
            };
            loadCategories();
        }
    }, [open]);

    useEffect(() => {
        if (ingredient && open) {
            const values = {
                name: ingredient.name || '',
                baseUnit: ingredient.baseUnit || '',
                sku: ingredient.sku || '',
                ingredientCategoryId: ingredient.ingredientCategoryId || '',
                minStock: ingredient.minStock || 0,
                maxStock: ingredient.maxStock || 0,
                defaultShelfLifeDays: ingredient.defaultShelfLifeDays || 180
            };
            setFormValues(values);
            setInitialValues(values);
            setError('');
            setHasChanges(false);
        }
    }, [ingredient, open]);

    useEffect(() => {
        if (initialValues) {
            setHasChanges(JSON.stringify(formValues) !== JSON.stringify(initialValues));
        }
    }, [formValues, initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateForm = () => {
        if (!formValues.name.trim()) { setError('Tên nguyên liệu không được để trống'); return false; }
        if (!formValues.ingredientCategoryId) { setError('Vui lòng chọn nhóm lưu trữ'); return false; }
        if (!formValues.baseUnit.trim()) { setError('Đơn vị cơ bản không được để trống'); return false; }
        const minStock = Number(formValues.minStock);
        const maxStock = Number(formValues.maxStock);
        if (minStock < 0 || maxStock < 0) { setError('Tồn kho không được âm'); return false; }
        if (maxStock > 0 && minStock > maxStock) { setError('Tồn tối thiểu không được lớn hơn tồn tối đa'); return false; }
        if (formValues.defaultShelfLifeDays <= 0) { setError('Hạn sử dụng mặc định phải lớn hơn 0'); return false; }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        setError('');
        try {
            await updateIngredientAPI(ingredient.id, {
                name: formValues.name.trim(),
                sku: formValues.sku.trim() || null,
                baseUnit: formValues.baseUnit.trim(),
                ingredientCategoryId: Number(formValues.ingredientCategoryId),
                minStock: Number(formValues.minStock),
                maxStock: Number(formValues.maxStock),
                defaultShelfLifeDays: Number(formValues.defaultShelfLifeDays)
            });
            await fetchIngredients();
            handleClose();
        } catch (error) {
            console.error('Update failed:', error);
            setError(error.response?.data?.message || 'Không thể cập nhật nguyên liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUnit = async () => {
        if (!unitForm.unitName.trim()) { setUnitError('Tên đơn vị không được để trống'); return; }
        const rate = Number(unitForm.conversionRate);
        if (!rate || rate <= 0) { setUnitError('Tỷ lệ quy đổi phải lớn hơn 0'); return; }
        setUnitLoading(true);
        setUnitError('');
        try {
            await addUnitAPI(ingredient.id, { unitName: unitForm.unitName.trim(), conversionRate: rate });
            setUnitForm({ unitName: '', conversionRate: '' });
            await fetchIngredients();
        } catch (err) {
            setUnitError(err?.response?.data?.message || 'Không thể thêm đơn vị');
        } finally {
            setUnitLoading(false);
        }
    };

    const handleDeleteUnit = async (unitId) => {
        setDeletingUnitId(unitId);
        setUnitError('');
        try {
            await deleteUnitAPI(ingredient.id, unitId);
            await fetchIngredients();
        } catch (err) {
            setUnitError(err?.response?.data?.message || 'Không thể xóa đơn vị');
        } finally {
            setDeletingUnitId(null);
        }
    };

    const handleCloseWithConfirm = () => {
        if (hasChanges) {
            if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?')) handleClose();
        } else {
            handleClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseWithConfirm} fullWidth maxWidth="md"
            PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' } }}>

            <DialogTitle sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', py: 2.5, px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LocalOfferIcon sx={{ fontSize: 22, color: '#6366f1' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', mb: 0.3 }}>
                                Chỉnh Sửa Nguyên Liệu
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                Cập nhật thông tin cơ bản nguyên liệu
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleCloseWithConfirm} disabled={loading}
                        sx={{ color: '#9ca3af', '&:hover': { bgcolor: '#f3f4f6', color: '#6b7280' } }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#fafafa' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2.5 }} icon={<WarningAmberIcon />} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2.5}>

                    {/* Section 1 */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                <CategoryIcon sx={{ fontSize: 20, color: '#6366f1' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>Thông tin cơ bản</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <TextField fullWidth label="Tên Nguyên Liệu" name="name"
                                        value={formValues.name} onChange={handleChange}
                                        required disabled={loading} size="small" placeholder="VD: Cà phê Robusta"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: loading ? '#f9fafb' : '#fafafa', '&:hover': { bgcolor: '#fff' }, '&.Mui-focused': { bgcolor: '#fff' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth required size="small">
                                        <InputLabel>Nhóm Lưu Trữ</InputLabel>
                                        <Select name="ingredientCategoryId" value={formValues.ingredientCategoryId}
                                            label="Nhóm Lưu Trữ" onChange={handleChange} disabled={loading}
                                            sx={{ bgcolor: loading ? '#f9fafb' : '#fafafa' }}>
                                            {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                        <TextField fullWidth label="Mã SKU" name="sku"
                                            value={formValues.sku} onChange={handleChange}
                                            disabled={loading} size="small" placeholder="CF-ROB-001"
                                            helperText="Mã định danh duy nhất (tùy chọn)"
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: loading ? '#f9fafb' : '#fafafa', '&:hover': { bgcolor: '#fff' }, '&.Mui-focused': { bgcolor: '#fff' } } }}
                                            InputProps={{ endAdornment: generatingSKU && <InputAdornment position="end"><CircularProgress size={16} /></InputAdornment> }}
                                        />
                                        <IconButton color="primary" onClick={generateSKU}
                                            disabled={!formValues.name || formValues.name.length < 2 || generatingSKU || loading}
                                            size="small" title="Tạo mã SKU tự động"
                                            sx={{ mt: '1px', bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' }, '&.Mui-disabled': { bgcolor: '#f5f5f5' }, height: '37px', width: '37px' }}>
                                            <RefreshIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Đơn Vị Cơ Bản" name="baseUnit"
                                        value={formValues.baseUnit} required disabled size="small"
                                        helperText="⚠️ Không thể thay đổi sau khi đã có lô hàng"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f3f4f6' }, '& .MuiFormHelperText-root': { color: '#f59e0b', fontWeight: 500 } }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Section 2 */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                <InventoryIcon sx={{ fontSize: 20, color: '#10b981' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>Quản lý tồn kho</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth label="Tồn Tối Thiểu" name="minStock" type="number"
                                        value={formValues.minStock} onChange={handleChange} disabled={loading} size="small"
                                        inputProps={{ min: 0, step: 1 }} helperText="Cảnh báo khi dưới mức này"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: loading ? '#f9fafb' : '#fafafa', '&:hover': { bgcolor: '#fff' }, '&.Mui-focused': { bgcolor: '#fff' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth label="Tồn Tối Đa" name="maxStock" type="number"
                                        value={formValues.maxStock} onChange={handleChange} disabled={loading} size="small"
                                        inputProps={{ min: 0, step: 1 }} helperText="Cảnh báo khi vượt mức này"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: loading ? '#f9fafb' : '#fafafa', '&:hover': { bgcolor: '#fff' }, '&.Mui-focused': { bgcolor: '#fff' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth label="HSD Mặc Định (ngày)" name="defaultShelfLifeDays" type="number"
                                        value={formValues.defaultShelfLifeDays} onChange={handleChange} disabled={loading} size="small"
                                        inputProps={{ min: 1, step: 1 }} helperText="Thời hạn sử dụng tiêu chuẩn"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: loading ? '#f9fafb' : '#fafafa', '&:hover': { bgcolor: '#fff' }, '&.Mui-focused': { bgcolor: '#fff' } } }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Section 3 */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <SyncAltIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>Đơn vị quy đổi</Typography>
                                <Typography variant="caption" sx={{ color: '#9ca3af', ml: 0.5 }}>
                                    (BaseUnit: <strong>{ingredient?.baseUnit}</strong>)
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {(ingredient?.units || []).map(unit => (
                                    <Chip key={unit.id}
                                        label={unit.isBaseUnit ? `${unit.unitName} (gốc)` : `${unit.unitName} = ${unit.conversionRate} ${ingredient.baseUnit}`}
                                        color={unit.isBaseUnit ? 'primary' : 'default'}
                                        variant={unit.isBaseUnit ? 'filled' : 'outlined'}
                                        size="small"
                                        onDelete={unit.isBaseUnit ? undefined : () => handleDeleteUnit(unit.id)}
                                        deleteIcon={deletingUnitId === unit.id ? <CircularProgress size={14} /> : <DeleteOutlineIcon />}
                                        disabled={deletingUnitId === unit.id}
                                        sx={{ fontWeight: unit.isBaseUnit ? 600 : 400, '& .MuiChip-deleteIcon': { color: '#ef4444' } }}
                                    />
                                ))}
                                {(ingredient?.units || []).length === 0 && (
                                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>Chưa có đơn vị quy đổi</Typography>
                                )}
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {unitError && (
                                <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setUnitError('')}>{unitError}</Alert>
                            )}
                            <Grid container spacing={1.5} alignItems="flex-start">
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth size="small" label="Tên đơn vị"
                                        placeholder="VD: kg, bao, thùng"
                                        value={unitForm.unitName}
                                        onChange={e => setUnitForm(prev => ({ ...prev, unitName: e.target.value }))}
                                        disabled={unitLoading} sx={{ bgcolor: '#fafafa' }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth size="small" label="Tỷ lệ quy đổi" type="number"
                                        placeholder={`VD: 1000 (1 ${unitForm.unitName || '?'} = 1000 ${ingredient?.baseUnit})`}
                                        value={unitForm.conversionRate}
                                        onChange={e => setUnitForm(prev => ({ ...prev, conversionRate: e.target.value }))}
                                        disabled={unitLoading} inputProps={{ min: 0.001, step: 'any' }}
                                        sx={{ bgcolor: '#fafafa' }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Button fullWidth variant="contained" size="medium"
                                        onClick={handleAddUnit}
                                        disabled={unitLoading || !unitForm.unitName || !unitForm.conversionRate}
                                        startIcon={unitLoading ? <CircularProgress size={16} color="inherit" /> : <AddCircleOutlineIcon />}
                                        sx={{ bgcolor: '#f59e0b', textTransform: 'none', fontWeight: 500, height: '40px', '&:hover': { bgcolor: '#d97706' }, '&.Mui-disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' } }}>
                                        {unitLoading ? 'Đang thêm...' : 'Thêm đơn vị'}
                                    </Button>
                                </Grid>
                                {unitForm.unitName && unitForm.conversionRate && Number(unitForm.conversionRate) > 0 && (
                                    <Grid item xs={12}>
                                        <Box sx={{
                                            p: 1.5, bgcolor: '#fffbeb',
                                            borderRadius: 1, border: '1px solid #fde68a',
                                            display: 'flex', alignItems: 'center', gap: 1,
                                            flexWrap: 'wrap'
                                        }}>
                                            <Typography variant="body2" color="#92400e">
                                                📐{' '}
                                                <strong>1 {unitForm.unitName}</strong>
                                                {' = '}
                                                <strong>{Number(unitForm.conversionRate).toLocaleString('vi-VN', { maximumFractionDigits: 6 })} {ingredient?.baseUnit}</strong>
                                                <Typography component="span" variant="body2"
                                                    color="#b45309" sx={{ mx: 1 }}>—</Typography>
                                                <strong>1 {ingredient?.baseUnit}</strong>
                                                {' = '}
                                                <strong>
                                                    {(1 / Number(unitForm.conversionRate)).toLocaleString('vi-VN', { maximumFractionDigits: 6 })} {unitForm.unitName}
                                                </strong>
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #e5e7eb', gap: 1.5 }}>
                <Button onClick={handleCloseWithConfirm} variant="outlined" size="medium" disabled={loading}
                    sx={{ borderColor: '#d1d5db', color: '#6b7280', px: 3, textTransform: 'none', fontWeight: 500, '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' } }}>
                    Hủy Bỏ
                </Button>
                <Button onClick={handleSubmit} variant="contained" size="medium"
                    disabled={loading || !hasChanges}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    sx={{ bgcolor: '#6366f1', px: 3, textTransform: 'none', fontWeight: 500, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }, '&.Mui-disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' } }}>
                    {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalEditIngredient;