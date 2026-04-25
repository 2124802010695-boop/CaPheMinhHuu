import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TextField, IconButton,
    Grid, FormControl, InputLabel, Select, MenuItem, Typography, Box, Chip, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloseIcon from '@mui/icons-material/Close';

// API
import { getRecipesByProductAPI, createRecipeAPI, deleteRecipeAPI } from '../../services/recipeService';
import { getIngredientsAPI } from '../../services/ingredientService';

// --- 1. LOGIC QUY ĐỔI (ĐÃ THÊM VÀO) ---
const UNIT_CONVERSION = {
    'kg': [ { label: 'Kilogram (kg)', value: 'kg', rate: 1 }, { label: 'Gram (g)', value: 'g', rate: 0.001 } ],
    'g':  [ { label: 'Gram (g)', value: 'g', rate: 1 }, { label: 'Kilogram (kg)', value: 'kg', rate: 1000 } ],
    'l':  [ { label: 'Lít (l)', value: 'l', rate: 1 }, { label: 'Mililit (ml)', value: 'ml', rate: 0.001 } ],
    'ml': [ { label: 'Mililit (ml)', value: 'ml', rate: 1 }, { label: 'Lít (l)', value: 'l', rate: 1000 } ]
};

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

    useEffect(() => {
        if (open && product) {
            fetchRecipes();
            fetchInventory();
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

    // --- 3. HÀM XỬ LÝ CHỌN NGUYÊN LIỆU (THÔNG MINH HƠN) ---
    const handleIngredientChange = (ingId) => {
        setSelectedIngId(ingId);
        const ing = ingredients.find(i => i.id === ingId);
        
        if (ing) {
            const baseUnit = ing.unit ? ing.unit.toLowerCase() : '';
            // Tự động nhận diện đơn vị để hiện dropdown phù hợp
            if (UNIT_CONVERSION[baseUnit]) {
                setCurrentUnitOptions(UNIT_CONVERSION[baseUnit]);
                // Mặc định chọn đơn vị nhỏ (g/ml) cho dễ nhập
                const defaultOpt = UNIT_CONVERSION[baseUnit].find(u => u.value === 'g' || u.value === 'ml') || UNIT_CONVERSION[baseUnit][0];
                setSelectedUnitRate(defaultOpt.rate);
                setDisplayUnitLabel(defaultOpt.value);
            } else {
                // Nếu là lon, chai, hộp -> Rate = 1
                setCurrentUnitOptions([{ label: ing.unit, value: ing.unit, rate: 1 }]);
                setSelectedUnitRate(1);
                setDisplayUnitLabel(ing.unit);
            }
        }
    };

    const handleAdd = async () => {
        if (!selectedIngId || !inputQuantity) return alert("Vui lòng nhập đủ thông tin!");

        // Tính toán số lượng thực tế lưu kho
        const finalQuantity = Number(inputQuantity) * selectedUnitRate;

        try {
            await createRecipeAPI({
                productId: product.id,
                ingredientId: selectedIngId,
                quantityRequired: finalQuantity 
            });
            setInputQuantity('');
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
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>(Kho: {ing.unit})</Typography>
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
                                >
                                    {currentUnitOptions.length > 0 ? (
                                        currentUnitOptions.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.rate} onClick={() => setDisplayUnitLabel(opt.value)}>
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

                    {/* DÒNG GỢI Ý TÍNH TOÁN (ĐÃ THÊM MỚI) */}
                    {inputQuantity && selectedIngId && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: '#fff3e0', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalculateIcon fontSize="small" sx={{ color: '#f57c00' }}/>
                            <Typography variant="body2" sx={{ color: '#e65100' }}>
                                Hệ thống sẽ trừ kho: <b>{(inputQuantity * selectedUnitRate).toLocaleString()} {ingredients.find(i => i.id === selectedIngId)?.unit}</b>
                            </Typography>
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
                                <TableCell align="right"><b>Xóa</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recipes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'gray' }}>Chưa cấu hình công thức nào.</TableCell>
                                </TableRow>
                            ) : (
                                recipes.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.ingredientName}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>{row.quantityRequired}</TableCell>
                                        <TableCell><Chip label={row.unit} size="small" /></TableCell>
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