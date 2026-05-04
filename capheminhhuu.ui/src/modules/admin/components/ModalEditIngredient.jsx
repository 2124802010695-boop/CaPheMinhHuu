import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Box, IconButton,
    FormControl, InputLabel, Select, MenuItem, InputAdornment,
    Typography, Paper, Alert, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from '../../../common/utils/axiosCustomize';
import { updateIngredientAPI } from '../services/ingredientService';
import { getIngredientCategoriesAPI } from '../services/ingredientCategoryService';

const ModalEditIngredient = ({ open, handleClose, ingredient, fetchIngredients }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    const [formValues, setFormValues] = useState({
        name: '',
        baseUnit: '',
        sku: '',
        ingredientCategoryId: '',
        minStock: 0,
        maxStock: 0,
        defaultShelfLifeDays: 180
    });

    const [initialValues, setInitialValues] = useState(null);
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

    // Load categories
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

    // Load ingredient data
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

    // Detect changes
    useEffect(() => {
        if (initialValues) {
            const changed = JSON.stringify(formValues) !== JSON.stringify(initialValues);
            setHasChanges(changed);
        }
    }, [formValues, initialValues]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateForm = () => {
        if (!formValues.name.trim()) {
            setError('Tên nguyên liệu không được để trống');
            return false;
        }

        if (!formValues.ingredientCategoryId) {
            setError('Vui lòng chọn nhóm lưu trữ');
            return false;
        }

        if (!formValues.baseUnit.trim()) {
            setError('Đơn vị cơ bản không được để trống');
            return false;
        }

        const minStock = Number(formValues.minStock);
        const maxStock = Number(formValues.maxStock);

        if (minStock < 0 || maxStock < 0) {
            setError('Tồn kho không được âm');
            return false;
        }

        if (maxStock > 0 && minStock > maxStock) {
            setError('Tồn tối thiểu không được lớn hơn tồn tối đa');
            return false;
        }

        if (formValues.defaultShelfLifeDays <= 0) {
            setError('Hạn sử dụng mặc định phải lớn hơn 0');
            return false;
        }

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

    const handleCloseWithConfirm = () => {
        if (hasChanges) {
            if (window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng?')) {
                handleClose();
            }
        } else {
            handleClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleCloseWithConfirm}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{
                bgcolor: '#fff',
                borderBottom: '1px solid #e5e7eb',
                py: 2.5,
                px: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
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
                    <IconButton
                        onClick={handleCloseWithConfirm}
                        disabled={loading}
                        sx={{
                            color: '#9ca3af',
                            '&:hover': { bgcolor: '#f3f4f6', color: '#6b7280' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ p: 3, bgcolor: '#fafafa' }}>
                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2.5 }}
                        icon={<WarningAmberIcon />}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2.5}>
                    {/* Section 1: Thông tin cơ bản */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{
                            p: 2.5,
                            bgcolor: '#fff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                <CategoryIcon sx={{ fontSize: 20, color: '#6366f1' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                                    Thông tin cơ bản
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        fullWidth
                                        label="Tên Nguyên Liệu"
                                        name="name"
                                        value={formValues.name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        size="small"
                                        placeholder="VD: Cà phê Robusta"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: loading ? '#f9fafb' : '#fafafa',
                                                '&:hover': { bgcolor: '#fff' },
                                                '&.Mui-focused': { bgcolor: '#fff' }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth required size="small">
                                        <InputLabel>Nhóm Lưu Trữ</InputLabel>
                                        <Select
                                            name="ingredientCategoryId"
                                            value={formValues.ingredientCategoryId}
                                            label="Nhóm Lưu Trữ"
                                            onChange={handleChange}
                                            disabled={loading}
                                            sx={{
                                                bgcolor: loading ? '#f9fafb' : '#fafafa',
                                                '&:hover': { bgcolor: '#fff' },
                                                '&.Mui-focused': { bgcolor: '#fff' }
                                            }}
                                        >
                                            {categories.map((cat) => (
                                                <MenuItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                        <TextField
                                            fullWidth
                                            label="Mã SKU"
                                            name="sku"
                                            value={formValues.sku}
                                            onChange={handleChange}
                                            disabled={loading}
                                            size="small"
                                            placeholder="CF-ROB-001"
                                            helperText="Mã định danh duy nhất (tùy chọn)"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    bgcolor: loading ? '#f9fafb' : '#fafafa',
                                                    '&:hover': { bgcolor: '#fff' },
                                                    '&.Mui-focused': { bgcolor: '#fff' }
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
                                            title="Tạo mã SKU tự động"
                                            sx={{
                                                mt: '1px',
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
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Đơn Vị Cơ Bản"
                                        name="baseUnit"
                                        value={formValues.baseUnit}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        size="small"
                                        placeholder="g, ml, kg, lít..."
                                        helperText="Đơn vị nhỏ nhất để tính toán"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: loading ? '#f9fafb' : '#fafafa',
                                                '&:hover': { bgcolor: '#fff' },
                                                '&.Mui-focused': { bgcolor: '#fff' }
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Section 2: Quản lý tồn kho */}
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{
                            p: 2.5,
                            bgcolor: '#fff',
                            borderRadius: 2,
                            border: '1px solid #e5e7eb'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                <InventoryIcon sx={{ fontSize: 20, color: '#10b981' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                                    Quản lý tồn kho
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Tồn Tối Thiểu"
                                        name="minStock"
                                        type="number"
                                        value={formValues.minStock}
                                        onChange={handleChange}
                                        disabled={loading}
                                        size="small"
                                        inputProps={{ min: 0, step: 1 }}
                                        helperText="Cảnh báo khi dưới mức này"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: loading ? '#f9fafb' : '#fafafa',
                                                '&:hover': { bgcolor: '#fff' },
                                                '&.Mui-focused': { bgcolor: '#fff' }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="Tồn Tối Đa"
                                        name="maxStock"
                                        type="number"
                                        value={formValues.maxStock}
                                        onChange={handleChange}
                                        disabled={loading}
                                        size="small"
                                        inputProps={{ min: 0, step: 1 }}
                                        helperText="Cảnh báo khi vượt mức này"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: loading ? '#f9fafb' : '#fafafa',
                                                '&:hover': { bgcolor: '#fff' },
                                                '&.Mui-focused': { bgcolor: '#fff' }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth
                                        label="HSD Mặc Định (ngày)"
                                        name="defaultShelfLifeDays"
                                        type="number"
                                        value={formValues.defaultShelfLifeDays}
                                        onChange={handleChange}
                                        disabled={loading}
                                        size="small"
                                        inputProps={{ min: 1, step: 1 }}
                                        helperText="Thời hạn sử dụng tiêu chuẩn"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: loading ? '#f9fafb' : '#fafafa',
                                                '&:hover': { bgcolor: '#fff' },
                                                '&.Mui-focused': { bgcolor: '#fff' }
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            {/* Footer */}
            <DialogActions sx={{
                p: 3,
                bgcolor: '#fff',
                borderTop: '1px solid #e5e7eb',
                gap: 1.5
            }}>
                <Button
                    onClick={handleCloseWithConfirm}
                    variant="outlined"
                    size="medium"
                    disabled={loading}
                    sx={{
                        borderColor: '#d1d5db',
                        color: '#6b7280',
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                            borderColor: '#9ca3af',
                            bgcolor: '#f9fafb'
                        }
                    }}
                >
                    Hủy Bỏ
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    size="medium"
                    disabled={loading || !hasChanges}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    sx={{
                        bgcolor: '#6366f1',
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                        '&:hover': {
                            bgcolor: '#4f46e5',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        },
                        '&.Mui-disabled': {
                            bgcolor: '#e5e7eb',
                            color: '#9ca3af'
                        }
                    }}
                >
                    {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalEditIngredient;