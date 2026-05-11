import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TextField, IconButton,
    Grid, FormControl, Select, MenuItem, Typography, Box, Chip, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloseIcon from '@mui/icons-material/Close';

// API
import { getRecipesByProductAPI, createRecipeAPI, deleteRecipeAPI } from '../services/recipeService';
import { getIngredientsAPI } from '../services/ingredientService';

// Không dùng hardcode UNIT_CONVERSION — lấy đơn vị từ ing.units (DB)

const ModalRecipe = ({ open, handleClose, product }) => {
    const [recipes, setRecipes] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    
    // State Form
    const [selectedIngId, setSelectedIngId] = useState('');
    const [inputQuantity, setInputQuantity] = useState('');
    
    // --- 2. STATE CHO LOGIC MỚI ---
    const [currentUnitOptions, setCurrentUnitOptions] = useState([]);
    const [selectedUnitRate, setSelectedUnitRate] = useState(1);
    const [displayUnitLabel, setDisplayUnitLabel] = useState('');
    const [yieldFactor, setYieldFactor] = useState(1.0);

    useEffect(() => {
        if (open && product) {
            fetchRecipes();
            fetchInventory();
        } else if (!open) {
            // Reset state khi đóng modal — tránh data cũ khi mở lại cho sản phẩm khác
            setSelectedIngId('');
            setInputQuantity('');
            setCurrentUnitOptions([]);
            setSelectedUnitRate(1);
            setDisplayUnitLabel('');
            setYieldFactor(1.0);
        }
    }, [open, product]);

    const fetchRecipes = async () => {
        try {
            const res = await getRecipesByProductAPI(product.id);
            setRecipes(res || []);
        } catch (error) { console.error(error); }
    };

    const fetchInventory = async () => {
        try {
            const res = await getIngredientsAPI();
            setIngredients(res || []);
        } catch (error) { console.error(error); }
    };

    // --- 3. HÀM XỬ LÝ CHỌN NGUYÊN LIỆU — dùng ing.units từ DB ---
    const handleIngredientChange = (ingId) => {
        setSelectedIngId(ingId);
        setInputQuantity('');
        const ing = ingredients.find(i => i.id === ingId);

        if (ing) {
            // Ưu tiên dùng Units từ DB (đã cấu hình trong Kho)
            if (ing.units && ing.units.length > 0) {
                // Sắp xếp: BaseUnit lên đầu, sau đó các đơn vị nhỏ hơn
                const sorted = [...ing.units].sort((a, b) => {
                    if (a.isBaseUnit) return 1;  // BaseUnit xuống cuối để admin thấy đơn vị nhỏ trước
                    if (b.isBaseUnit) return -1;
                    return a.conversionRate - b.conversionRate; // Đơn vị nhỏ hơn lên trước
                });
                const options = sorted.map(u => ({
                    label: u.unitName,
                    value: u.unitName,
                    rate: u.conversionRate
                }));
                setCurrentUnitOptions(options);
                // Mặc định chọn đơn vị nhỏ nhất (conversionRate nhỏ nhất = đơn vị nhỏ nhất)
                const defaultOpt = options[0];
                setSelectedUnitRate(defaultOpt.rate);
                setDisplayUnitLabel(defaultOpt.value);
            } else {
                // Fallback: không có Units cấu hình trong DB
                // Tự động generate đơn vị nhỏ hơn dựa vào BaseUnit
                const base = ing.baseUnit?.toLowerCase();
                let options = [];
                if (base === 'kg') {
                    options = [
                        { label: 'g', value: 'g', rate: 0.001 },
                        { label: 'kg', value: 'kg', rate: 1 }
                    ];
                } else if (base === 'l' || base === 'lít' || base === 'lit') {
                    options = [
                        { label: 'ml', value: 'ml', rate: 0.001 },
                        { label: 'l', value: 'l', rate: 1 }
                    ];
                } else {
                    // lon, chai, hộp, cái... → rate = 1
                    options = [{ label: ing.baseUnit, value: ing.baseUnit, rate: 1 }];
                }
                setCurrentUnitOptions(options);
                // Mặc định chọn đơn vị nhỏ nhất
                setSelectedUnitRate(options[0].rate);
                setDisplayUnitLabel(options[0].value);
            }
        }
    };

    const handleAdd = async () => {
        if (!selectedIngId || !inputQuantity) return alert("Vui lòng nhập đủ thông tin!");
        const qty = Number(inputQuantity);
        if (isNaN(qty) || qty <= 0) return alert("Số lượng phải lớn hơn 0!");
        const yf = Number(yieldFactor);
        if (isNaN(yf) || yf <= 0 || yf > 1) return alert("Hệ số hao hụt phải từ 0.01 đến 1.0!");

        // Tính định mức gốc lưu vào DB (theo BaseUnit):
        // finalQuantity = (qty × conversionRate) / yieldFactor
        // VD: nhập 200g (rate=0.001), yield=0.8 → lưu (200×0.001)/0.8 = 0.25 kg
        const finalQuantity = (qty * Number(selectedUnitRate)) / yf;

        try {
            await createRecipeAPI({
                productId: product.id,
                ingredientId: selectedIngId,
                quantityRequired: finalQuantity,
                yieldFactor: yf
            });
            setInputQuantity('');
            setYieldFactor(1.0);
            fetchRecipes();
        } catch (error) {
            alert(error.response?.data || "Lỗi thêm nguyên liệu!");
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Xóa nguyên liệu này?")) return;
        try {
            await deleteRecipeAPI(id);
            fetchRecipes();
        } catch (error) { alert("Lỗi xóa!"); }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            {/* HEADER MÀU CAM HỒNG CỦA BẠN */}
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    py: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalculateIcon sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            CẤU HÌNH ĐỊNH MỨC
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {product?.name}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                {/* --- KHUNG NHẬP LIỆU --- */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', border: '1px dashed #ccc' }}>
                    {/* SỬA LỖI UI: Dùng alignItems="center" thay vì flex-end để nút và ô nhập thẳng hàng */}
                    <Grid container spacing={2} alignItems="center">
                        
                        {/* DÒNG 1: NGUYÊN LIỆU (Full dòng để không bị mất chữ) */}
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: '#333' }}>
                                Chọn nguyên liệu kho gốc:
                            </Typography>
                            <FormControl fullWidth size="small" sx={{ bgcolor: 'white', borderRadius: 1 }}>
                                <Select
                                    value={selectedIngId}
                                    onChange={(e) => handleIngredientChange(e.target.value)}
                                    displayEmpty
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                                >
                                    <MenuItem value="" disabled><em>-- Chọn nguyên liệu --</em></MenuItem>
                                    {ingredients.map((ing) => (
                                        <MenuItem key={ing.id} value={ing.id}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <Typography variant="body2" fontWeight="bold">{ing.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>(Kho: {ing.baseUnit})</Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* DÒNG 2: SỐ LƯỢNG - ĐƠN VỊ - NÚT THÊM */}
                        <Grid item xs={5}>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: '#333' }}>Số lượng:</Typography>
                            <TextField 
                                fullWidth size="small" type="number" 
                                value={inputQuantity} onChange={(e) => setInputQuantity(e.target.value)}
                                placeholder="VD: 20" InputProps={{ inputProps: { min: 0 } }}
                                sx={{ bgcolor: 'white', borderRadius: 1 }}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: '#333' }}>Đơn vị:</Typography>
                            <FormControl fullWidth size="small" sx={{ bgcolor: 'white', borderRadius: 1 }}>
                                <Select
                                    value={selectedUnitRate}
                                    disabled={!selectedIngId}
                                    onChange={(e) => {
                                        const rate = Number(e.target.value);
                                        setSelectedUnitRate(rate);
                                        const opt = currentUnitOptions.find(o => Number(o.rate) === rate);
                                        if (opt) setDisplayUnitLabel(opt.value);
                                    }}
                                >
                                    {currentUnitOptions.length > 0 ? (
                                        currentUnitOptions.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.rate}>
                                                {opt.value}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value={1} disabled><em>--</em></MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={3}>
                            {/* Chỗ này không cần Label ở trên, nên ta dùng Box đẩy nó xuống cho bằng hàng */}
                            <Box sx={{ mt: 3 }}> 
                                <Button 
                                    variant="contained" fullWidth startIcon={<AddCircleIcon />}
                                    onClick={handleAdd} disabled={!selectedIngId}
                                    sx={{ 
                                        height: '40px', // Set cứng chiều cao để bằng TextField
                                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                        '&:hover': { background: 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)' }
                                    }}
                                >
                                    Thêm
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* YIELD FACTOR INPUT */}
                    {selectedIngId && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Tỷ lệ nguyên liệu thực sự dùng được sau sơ chế. VD: 0.8 = 80% dùng được, 20% hao hụt → hệ thống tự tính trừ kho nhiều hơn để bù hao." placement="top" arrow>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', cursor: 'help', textDecoration: 'underline dotted' }}>
                                    Hệ số hao hụt (Yield):
                                </Typography>
                            </Tooltip>
                            <TextField
                                size="small" type="number" value={yieldFactor}
                                onChange={e => setYieldFactor(e.target.value)}
                                inputProps={{ min: 0.01, max: 1.0, step: 0.01 }}
                                sx={{ width: 100, bgcolor: 'white' }}
                            />
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                (1.0 = không hao hụt · 0.8 = hao 20%)
                            </Typography>
                        </Box>
                    )}

                    {/* PREVIEW TÍNH TOÁN */}
                    {inputQuantity && selectedIngId && (
                        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#fff3e0', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <CalculateIcon fontSize="small" sx={{ color: '#f57c00' }}/>
                                <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 600 }}>
                                    Tính toán định mức:
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#555', ml: 3 }}>
                                Nhập: <b>{Number(inputQuantity).toLocaleString()} {displayUnitLabel}</b>
                                {' → '}Quy đổi: <b>{(Number(inputQuantity) * Number(selectedUnitRate)).toLocaleString()} {ingredients.find(i => i.id === selectedIngId)?.baseUnit}</b>
                            </Typography>
                            {Number(yieldFactor) < 1 && Number(yieldFactor) > 0 && (
                                <Typography variant="body2" sx={{ color: '#d97706', ml: 3, mt: 0.5 }}>
                                    Yield {(Number(yieldFactor) * 100).toFixed(0)}% → Thực trừ kho: <b>{((Number(inputQuantity) * Number(selectedUnitRate)) / Number(yieldFactor)).toLocaleString()} {ingredients.find(i => i.id === selectedIngId)?.baseUnit}</b>
                                </Typography>
                            )}
                        </Box>
                    )}
                </Paper>

                {/* BẢNG DANH SÁCH GIỮ NGUYÊN */}
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>📋 Danh sách thành phần hiện tại:</Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#eeeeee' }}>
                                <TableCell><b>Nguyên Liệu</b></TableCell>
                                <TableCell><b>Định Lượng (Gốc)</b></TableCell>
                                <TableCell><b>Đơn Vị Kho</b></TableCell>
                                <TableCell><b>Yield</b></TableCell>
                                <TableCell><b>Ver.</b></TableCell>
                                <TableCell align="right"><b>Xóa</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recipes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'gray' }}>Chưa cấu hình công thức nào.</TableCell>
                                </TableRow>
                            ) : (
                                recipes.map((row) => (
                                    <TableRow key={row.id} sx={{ opacity: row.isActive ? 1 : 0.45 }}>
                                        <TableCell>{row.ingredientName}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>{row.quantityRequired}</TableCell>
                                        <TableCell><Chip label={row.unit} size="small" /></TableCell>
                                        <TableCell>
                                            <Tooltip title={`Hao hụt: ${((1 - row.yieldFactor) * 100).toFixed(0)}%`} arrow>
                                                <Chip
                                                    label={`${(row.yieldFactor * 100).toFixed(0)}%`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: row.yieldFactor >= 1 ? '#f0fdf4' : '#fffbeb',
                                                        color: row.yieldFactor >= 1 ? '#15803d' : '#b45309',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>v{row.version}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton color="error" size="small" onClick={() => handleDelete(row.id)}><DeleteIcon fontSize="small" /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Button 
                    onClick={handleClose} variant="contained"
                    sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}
                >
                    Hoàn tất
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalRecipe;