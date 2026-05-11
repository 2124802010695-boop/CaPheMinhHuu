import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Stack, Box, Typography, MenuItem, Select, FormControl, IconButton,
    CircularProgress, Alert, Stepper, Step, StepLabel, ToggleButtonGroup,
    ToggleButton, Paper, Chip, InputAdornment, Grid, Divider
} from '@mui/material';
import {
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Info as InfoIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

// Services
import { createIngredientAPI, generateSkuAPI } from '../services/ingredientService';
import { getIngredientCategoriesAPI } from '../services/ingredientCategoryService';

// Sub-components for styling
const FieldLabel = ({ children, required }) => (
    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#4a5568' }}>
        {children} {required && <span style={{ color: '#f56565' }}>*</span>}
    </Typography>
);

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '&:hover fieldset': { borderColor: '#667eea' },
        '&.Mui-focused fieldset': { borderColor: '#667eea' },
    }
};

const ModalAddIngredient = ({ open, handleClose, fetchIngredients }) => {
    // --- STATE ---
    const [activeStep, setActiveStep] = useState(0);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatingSKU, setGeneratingSKU] = useState(false);

    // Step 1: Thông tin cơ bản
    const [masterData, setMasterData] = useState({
        name: '',
        sku: '',
        ingredientCategoryId: '',
        baseUnit: 'g',
        minStock: 0,
        maxStock: 0,
        defaultShelfLifeDays: 180
    });
    const [type, setType] = useState('solid'); // solid | liquid | unit

    // Step 2: Đơn vị quy đổi
    const [units, setUnits] = useState([]); // { unitName, conversionRate }
    const [newUnit, setNewUnit] = useState({ unitName: '', conversionRate: '' });

    // Step 3: Lô hàng đầu tiên
    const [batchData, setBatchData] = useState({
        importMode: 'purchase', // 'purchase' | 'base'
        purchaseUnitIndex: 0,
        purchaseQuantity: '',
        costPricePerUnit: '',
        importDate: new Date().toISOString().split('T')[0],
        expiryDate: ''
    });

    // --- EFFECTS ---
    useEffect(() => {
        if (open) {
            loadCategories();
        } else {
            resetForm();
        }
    }, [open]);

    const loadCategories = async () => {
        try {
            const res = await getIngredientCategoriesAPI();
            // Đã fix Bug 2: getIngredientCategoriesAPI trả về res trực tiếp
            setCategories(res || []);
        } catch (err) {
            console.error("Lỗi tải nhóm hàng:", err);
        }
    };

    const resetForm = () => {
        setActiveStep(0);
        setError('');
        setMasterData({
            name: '', sku: '', ingredientCategoryId: '',
            baseUnit: 'g', minStock: 0, maxStock: 0, defaultShelfLifeDays: 180
        });
        setType('solid');
        setUnits([]);
        setNewUnit({ unitName: '', conversionRate: '' });
        setBatchData({
            importMode: 'purchase', purchaseUnitIndex: 0,
            purchaseQuantity: '', costPricePerUnit: '',
            importDate: new Date().toISOString().split('T')[0], expiryDate: ''
        });
    };

    // Wrapper close để đảm bảo reset trước khi thoát
    const handleCloseModal = () => {
        resetForm();
        handleClose();
    };

    // --- LOGIC HANDLERS ---
    const handleGenerateSKU = async () => {
        if (masterData.name.trim().length < 2) return;
        setGeneratingSKU(true);
        try {
            const res = await generateSkuAPI(masterData.name);
            // Đã fix Bug 1: nhận đúng object { sku } hoặc string
            setMasterData(prev => ({ ...prev, sku: res.data?.sku || res.data || '' }));
        } catch (err) {
            console.error("Lỗi gen SKU:", err);
        } finally {
            setGeneratingSKU(false);
        }
    };

    const handleAddUnit = () => {
        setError('');
        if (!newUnit.unitName.trim()) {
            setError('Tên đơn vị quy đổi không được để trống');
            return;
        }
        if (Number(newUnit.conversionRate) <= 0) {
            setError('Tỷ lệ quy đổi phải lớn hơn 0');
            return;
        }
        if (units.some(u => u.unitName.toLowerCase() === newUnit.unitName.trim().toLowerCase())) {
            setError('Đơn vị này đã tồn tại trong danh sách');
            return;
        }
        setUnits([...units, { 
            unitName: newUnit.unitName.trim(), 
            conversionRate: Number(newUnit.conversionRate) 
        }]);
        setNewUnit({ unitName: '', conversionRate: '' });
    };

    const handleRemoveUnit = (index) => {
        const updated = units.filter((_, i) => i !== index);
        setUnits(updated);
    };

    const handleNext = () => {
        setError('');
        if (activeStep === 0) {
            if (!masterData.name.trim()) {
                setError('Tên nguyên liệu không được để trống');
                return;
            }
            if (!masterData.ingredientCategoryId) {
                setError('Vui lòng chọn nhóm hàng');
                return;
            }
        }
        setActiveStep(prev => prev + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const selectedUnit = units[batchData.purchaseUnitIndex];
            let initialBatch = null;
            const qty = Number(batchData.purchaseQuantity);
            const price = Number(batchData.costPricePerUnit);

            if (qty > 0) {
                if (batchData.importMode === 'purchase' && selectedUnit) {
                    const convRate = Number(selectedUnit.conversionRate);
                    initialBatch = {
                        batchCode: null,
                        quantity: qty * convRate,
                        importPricePerBaseUnit: price / convRate,
                        importDate: batchData.importDate,
                        manufactureDate: null,
                        expiryDate: batchData.expiryDate || null,
                        locationId: null,
                        purchaseUnitId: null,
                        purchaseQuantity: null
                    };
                } else {
                    initialBatch = {
                        batchCode: null,
                        quantity: qty,
                        importPricePerBaseUnit: price,
                        importDate: batchData.importDate,
                        manufactureDate: null,
                        expiryDate: batchData.expiryDate || null,
                        locationId: null,
                        purchaseUnitId: null,
                        purchaseQuantity: null
                    };
                }
            }

            const payload = {
                name: masterData.name.trim(),
                sku: masterData.sku.trim() || null,
                baseUnit: masterData.baseUnit,
                ingredientCategoryId: Number(masterData.ingredientCategoryId),
                minStock: Number(masterData.minStock),
                maxStock: Number(masterData.maxStock),
                defaultShelfLifeDays: Number(masterData.defaultShelfLifeDays),
                units: units.length > 0
                    ? units.map(u => ({
                        unitName: u.unitName,
                        conversionRate: Number(u.conversionRate),
                        isBaseUnit: false
                    }))
                    : null,
                initialBatch
            };

            await createIngredientAPI(payload);
            await fetchIngredients();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nguyên liệu');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP RENDERS ---

    const renderStep1 = () => (
        <Stack spacing={2.5}>
            <Box>
                <FieldLabel required>Tên nguyên liệu</FieldLabel>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="VD: Sữa đặc Ngôi Sao Phương Nam"
                    value={masterData.name}
                    onChange={(e) => {
                        setMasterData({ ...masterData, name: e.target.value });
                        setError('');
                    }}
                    sx={inputStyle}
                />
            </Box>

            <Box>
                <FieldLabel>Mã SKU <Typography component="span" variant="caption" color="text.secondary">(để trống hệ thống tự tạo)</Typography></FieldLabel>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Nhập tay hoặc bấm Tạo SKU"
                        value={masterData.sku}
                        onChange={(e) => setMasterData({ ...masterData, sku: e.target.value })}
                        sx={inputStyle}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleGenerateSKU}
                        disabled={masterData.name.length < 2 || generatingSKU}
                        sx={{ whiteSpace: 'nowrap', borderRadius: '8px', textTransform: 'none', minWidth: 'fit-content' }}
                        startIcon={generatingSKU ? <CircularProgress size={16} /> : <RefreshIcon />}
                    >
                        Tạo SKU
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <FieldLabel required>Nhóm hàng</FieldLabel>
                    <FormControl fullWidth size="small" sx={inputStyle}>
                        <Select
                            value={masterData.ingredientCategoryId}
                            onChange={(e) => setMasterData({ ...masterData, ingredientCategoryId: e.target.value })}
                            displayEmpty
                        >
                            <MenuItem value="" disabled>Chọn nhóm</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FieldLabel>Hạn sử dụng mặc định</FieldLabel>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={masterData.defaultShelfLifeDays}
                        onChange={(e) => setMasterData({ ...masterData, defaultShelfLifeDays: e.target.value })}
                        InputProps={{ endAdornment: <InputAdornment position="end">ngày</InputAdornment> }}
                        sx={inputStyle}
                    />
                </Grid>
            </Grid>

            <Box>
                <FieldLabel>Loại vật lý (Đơn vị cơ bản)</FieldLabel>
                <ToggleButtonGroup
                    value={type}
                    exclusive
                    onChange={(e, next) => {
                        if (next) {
                            setType(next);
                            setMasterData(prev => ({ 
                                ...prev, 
                                baseUnit: next === 'solid' ? 'g' : (next === 'liquid' ? 'ml' : 'cái') 
                            }));
                        }
                    }}
                    size="small"
                    fullWidth
                    color="primary"
                >
                    <ToggleButton value="solid">Rắn (gram)</ToggleButton>
                    <ToggleButton value="liquid">Lỏng (ml)</ToggleButton>
                    <ToggleButton value="unit">Đếm được (cái)</ToggleButton>
                </ToggleButtonGroup>
                <Alert icon={<InfoIcon fontSize="inherit" />} severity="info" sx={{ mt: 1, py: 0, fontSize: '0.75rem' }}>
                    BaseUnit ({masterData.baseUnit}) là đơn vị nhỏ nhất, dùng để tính giá vốn và trừ kho khi bán.
                </Alert>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <FieldLabel>Tồn tối thiểu</FieldLabel>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="0 = không giới hạn"
                        value={masterData.minStock}
                        onChange={(e) => setMasterData({ ...masterData, minStock: e.target.value })}
                        sx={inputStyle}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FieldLabel>Tồn tối đa</FieldLabel>
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="0 = không giới hạn"
                        value={masterData.maxStock}
                        onChange={(e) => setMasterData({ ...masterData, maxStock: e.target.value })}
                        sx={inputStyle}
                    />
                </Grid>
            </Grid>
        </Stack>
    );

    const renderStep2 = () => (
        <Stack spacing={2}>
            <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                    Định nghĩa các đơn vị nhập kho lớn hơn {masterData.baseUnit}
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                    Bỏ qua bước này nếu bạn chỉ nhập và quản lý theo đơn vị {masterData.baseUnit}.
                </Alert>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, borderStyle: 'dashed', bgcolor: '#f8fafc' }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={5}>
                        <FieldLabel>Tên đơn vị mới</FieldLabel>
                        <TextField
                            fullWidth size="small" placeholder="VD: Hộp, Thùng, Kg"
                            value={newUnit.unitName}
                            onChange={(e) => setNewUnit({ ...newUnit, unitName: e.target.value })}
                            sx={{ bgcolor: 'white', ...inputStyle }}
                        />
                    </Grid>
                    <Grid item xs={5}>
                        <FieldLabel>Gấp bao nhiêu lần {masterData.baseUnit}?</FieldLabel>
                        <TextField
                            fullWidth size="small" type="number" placeholder="VD: 500"
                            value={newUnit.conversionRate}
                            onChange={(e) => setNewUnit({ ...newUnit, conversionRate: e.target.value })}
                            sx={{ bgcolor: 'white', ...inputStyle }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Button
                            fullWidth variant="contained"
                            onClick={handleAddUnit}
                            sx={{ height: '40px', borderRadius: '8px', bgcolor: '#667eea', '&:hover': { bgcolor: '#5a67d8' } }}
                        >
                            <AddIcon />
                        </Button>
                    </Grid>
                </Grid>

                {newUnit.unitName && newUnit.conversionRate > 0 && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#718096' }}>
                        Xem trước: 1 {newUnit.unitName} = {newUnit.conversionRate} {masterData.baseUnit} | 1 {masterData.baseUnit} = {(1 / newUnit.conversionRate).toFixed(6)} {newUnit.unitName}
                    </Typography>
                )}
            </Paper>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Danh sách quy đổi:</Typography>
                {units.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>Chưa có đơn vị quy đổi nào.</Typography>
                ) : (
                    // Đã bỏ prop useFlexGap
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {units.map((u, index) => (
                            <Chip
                                key={index}
                                label={`1 ${u.unitName} = ${u.conversionRate} ${masterData.baseUnit}`}
                                onDelete={() => handleRemoveUnit(index)}
                                color="primary"
                                variant="outlined"
                                sx={{ borderRadius: '8px', mb: 1 }} // Thêm mb: 1 để thay thế flexGap khi wrap
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </Stack>
    );

    const renderStep3 = () => {
        const selectedUnit = units[batchData.purchaseUnitIndex];
        const isPurchaseMode = units.length > 0 && batchData.importMode === 'purchase';

        // Đã fix Bug 4: Bọc Number() để tránh lỗi NaN khi tính toán preview
        const previewQty = Number(batchData.purchaseQuantity) || 0;
        const previewPrice = Number(batchData.costPricePerUnit) || 0;

        return (
            <Stack spacing={2.5}>
                <Alert severity="info" sx={{ py: 0.5 }}>
                    Bỏ qua nếu chưa có hàng thực tế. Bạn có thể nhập lô hàng sau tại màn hình Quản lý kho.
                </Alert>

                {units.length > 0 && (
                    <ToggleButtonGroup
                        value={batchData.importMode}
                        exclusive
                        onChange={(e, next) => next && setBatchData({ ...batchData, importMode: next })}
                        size="small"
                        color="secondary"
                    >
                        <ToggleButton value="purchase">Theo đơn vị nhập</ToggleButton>
                        <ToggleButton value="base">Theo {masterData.baseUnit}</ToggleButton>
                    </ToggleButtonGroup>
                )}

                <Grid container spacing={2}>
                    {isPurchaseMode ? (
                        <>
                            <Grid item xs={12}>
                                <FieldLabel>Chọn đơn vị nhập</FieldLabel>
                                <Select
                                    fullWidth size="small"
                                    value={batchData.purchaseUnitIndex}
                                    onChange={(e) => setBatchData({ ...batchData, purchaseUnitIndex: e.target.value })}
                                    sx={inputStyle}
                                >
                                    {units.map((u, i) => (
                                        <MenuItem key={i} value={i}>{u.unitName} (1 {u.unitName} = {u.conversionRate} {masterData.baseUnit})</MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item xs={6}>
                                <FieldLabel>Số lượng nhập ({selectedUnit?.unitName})</FieldLabel>
                                <TextField
                                    fullWidth size="small" type="number"
                                    value={batchData.purchaseQuantity}
                                    onChange={(e) => setBatchData({ ...batchData, purchaseQuantity: e.target.value })}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FieldLabel>Giá nhập / {selectedUnit?.unitName}</FieldLabel>
                                <TextField
                                    fullWidth size="small" type="number"
                                    value={batchData.costPricePerUnit}
                                    onChange={(e) => setBatchData({ ...batchData, costPricePerUnit: e.target.value })}
                                    InputProps={{ endAdornment: <InputAdornment position="end">₫</InputAdornment> }}
                                    sx={inputStyle}
                                />
                            </Grid>
                        </>
                    ) : (
                        <>
                            <Grid item xs={6}>
                                <FieldLabel>Số lượng ({masterData.baseUnit})</FieldLabel>
                                <TextField
                                    fullWidth size="small" type="number"
                                    value={batchData.purchaseQuantity}
                                    onChange={(e) => setBatchData({ ...batchData, purchaseQuantity: e.target.value })}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FieldLabel>Giá nhập / {masterData.baseUnit}</FieldLabel>
                                <TextField
                                    fullWidth size="small" type="number"
                                    value={batchData.costPricePerUnit}
                                    onChange={(e) => setBatchData({ ...batchData, costPricePerUnit: e.target.value })}
                                    InputProps={{ endAdornment: <InputAdornment position="end">₫</InputAdornment> }}
                                    sx={inputStyle}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>

                {previewQty > 0 && previewPrice > 0 && (
                    <Box sx={{ p: 1.5, bgcolor: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', fontWeight: 600 }}>
                            {isPurchaseMode ? (
                                <>
                                    → Tổng quy đổi: {(previewQty * selectedUnit.conversionRate).toLocaleString()} {masterData.baseUnit} <br />
                                    → Giá mỗi {masterData.baseUnit}: {(previewPrice / selectedUnit.conversionRate).toLocaleString()} ₫
                                </>
                            ) : (
                                <>→ Tổng giá trị lô: {(previewQty * previewPrice).toLocaleString()} ₫</>
                            )}
                        </Typography>
                    </Box>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FieldLabel>Ngày nhập</FieldLabel>
                        <TextField
                            fullWidth size="small" type="date"
                            value={batchData.importDate}
                            onChange={(e) => setBatchData({ ...batchData, importDate: e.target.value })}
                            sx={inputStyle}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FieldLabel>Hạn sử dụng</FieldLabel>
                        <TextField
                            fullWidth size="small" type="date"
                            value={batchData.expiryDate}
                            onChange={(e) => setBatchData({ ...batchData, expiryDate: e.target.value })}
                            sx={inputStyle}
                        />
                    </Grid>
                </Grid>
            </Stack>
        );
    };

    return (
        <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="md">
            <DialogTitle sx={{ bgcolor: '#667eea', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Thêm Nguyên Liệu Mới</Typography>
                <IconButton onClick={handleCloseModal} size="small" sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>

            <Box sx={{ mt: 2, px: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    <Step><StepLabel>Thông tin cơ bản</StepLabel></Step>
                    <Step><StepLabel>Đơn vị quy đổi</StepLabel></Step>
                    <Step><StepLabel>Lô hàng đầu tiên</StepLabel></Step>
                </Stepper>
            </Box>

            <DialogContent sx={{ minHeight: '420px', py: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {activeStep === 0 && renderStep1()}
                {activeStep === 1 && renderStep2()}
                {activeStep === 2 && renderStep3()}
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, px: 3 }}>
                <Button onClick={handleCloseModal} color="inherit" sx={{ borderRadius: '8px', textTransform: 'none' }}>
                    Hủy bỏ
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep > 0 && (
                    <Button
                        variant="outlined"
                        onClick={() => setActiveStep(prev => prev - 1)}
                        startIcon={<ArrowBackIcon />}
                        sx={{ borderRadius: '8px', textTransform: 'none', mr: 1 }}
                    >
                        Quay lại
                    </Button>
                )}
                {activeStep < 2 ? (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowForwardIcon />}
                        sx={{ borderRadius: '8px', textTransform: 'none', bgcolor: '#667eea', '&:hover': { bgcolor: '#5a67d8' } }}
                    >
                        Tiếp theo
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        disabled={loading}
                        onClick={handleSubmit}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ borderRadius: '8px', textTransform: 'none', bgcolor: '#667eea', '&:hover': { bgcolor: '#5a67d8' } }}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu Nguyên Liệu'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddIngredient;