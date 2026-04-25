import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, FormControl, InputLabel,
    Select, MenuItem, Box, Typography, IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Import API
import { createProductAPI } from '../../services/productService';
import { getCategoriesAPI } from '../../services/categoryService';

const ModalAddProduct = ({ open, handleClose, fetchProducts }) => {
    // State form
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [time, setTime] = useState('');
    const [catId, setCatId] = useState('');

    // State dữ liệu danh mục (để đổ vào dropdown)
    const [categories, setCategories] = useState([]);

    // State xử lý ảnh
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // Mỗi khi mở Modal -> Gọi API lấy danh sách danh mục ngay
    useEffect(() => {
        if (open) {
            const fetchCats = async () => {
                try {
                    const res = await getCategoriesAPI();
                    if (res && Array.isArray(res)) {
                        setCategories(res);
                    } else {
                        setCategories([]);
                    }
                } catch (error) {
                    console.error("Lỗi lấy danh mục:", error);
                }
            };
            fetchCats();
        }
    }, [open]);

    // Xử lý chọn ảnh
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        try {
            // Validate cơ bản
            if (!name || !price || !time || !catId) {
                alert("Vui lòng điền đủ thông tin bắt buộc (*)");
                return;
            }

            const formData = new FormData();
            formData.append('Name', name);
            formData.append('Price', price);
            formData.append('Description', desc);
            formData.append('PreparationTime', time);
            formData.append('CategoryId', catId);

            if (selectedImage) {
                formData.append('ImageFile', selectedImage);
            }

            await createProductAPI(formData);
            alert("Thêm món thành công!");

            // Reset form
            setName(''); setPrice(''); setDesc(''); setTime(''); setCatId('');
            setSelectedImage(null); setPreviewUrl('');

            handleClose();
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert("Lỗi thêm món! Vui lòng kiểm tra lại.");
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    py: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocalCafeIcon sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Thêm Sản Phẩm Mới
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Tạo món mới cho menu quán
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                    {/* CỘT TRÁI: ẢNH ĐẠI DIỆN */}
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                        <Box sx={{
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minHeight: '250px',
                            justifyContent: 'center',
                            bgcolor: '#f9f9f9',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: '#f5576c',
                                bgcolor: '#fff5f7'
                            }
                        }}>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <CloudUploadIcon sx={{ fontSize: 60, color: '#ccc' }} />
                                    <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                                        Chưa có ảnh
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                component="label"
                                variant="contained"
                                size="small"
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    mt: 2,
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                                    }
                                }}
                            >
                                Tải ảnh lên
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Box>
                    </Grid>

                    {/* CỘT PHẢI: THÔNG TIN */}
                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth label="Tên Sản Phẩm *"
                            value={name} onChange={(e) => setName(e.target.value)}
                            margin="dense"
                            variant="outlined"
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth label="Giá (VND) *" type="number"
                                    value={price} onChange={(e) => setPrice(e.target.value)}
                                    margin="dense"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth label="Thời gian (phút) *" type="number"
                                    value={time} onChange={(e) => setTime(e.target.value)}
                                    margin="dense"
                                />
                            </Grid>
                        </Grid>

                        <FormControl fullWidth margin="dense">
                            <InputLabel>Danh Mục *</InputLabel>
                            <Select
                                value={catId}
                                label="Danh Mục *"
                                onChange={(e) => setCatId(e.target.value)}
                            >
                                {categories.length > 0 ? (
                                    categories.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled><em>Không có danh mục nào</em></MenuItem>
                                )}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth label="Mô tả" multiline rows={3}
                            value={desc} onChange={(e) => setDesc(e.target.value)}
                            margin="dense"
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                <Button onClick={handleClose} variant="outlined" color="error" startIcon={<CancelIcon />}>
                    Hủy Bỏ
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                        }
                    }}
                >
                    Thêm Món
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddProduct;