import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, IconButton, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import { createIngredientCategoryAPI } from '../../services/ingredientCategoryService';

const ModalAddIngredientCategory = ({ open, handleClose, fetchCategories }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert('Vui lòng nhập tên danh mục!');
            return;
        }

        try {
            await createIngredientCategoryAPI(formData);
            alert('Thêm danh mục nguyên liệu thành công!');
            setFormData({ name: '', description: '' });
            fetchCategories();
            handleClose();
        } catch (error) {
            console.error('Lỗi thêm danh mục:', error);
            alert('Lỗi thêm danh mục nguyên liệu!');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 2,
                borderBottom: '1px solid #e5e7eb'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CategoryIcon sx={{ color: '#6366f1', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                        Thêm Danh Mục Nguyên Liệu
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                        label="Tên Danh Mục"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        placeholder="VD: Cà phê hạt & Bột, Trà & Hoa Khô..."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#6366f1',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#6366f1',
                                }
                            }
                        }}
                    />

                    <TextField
                        label="Mô Tả"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Mô tả chi tiết về danh mục nguyên liệu..."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#6366f1',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#6366f1',
                                }
                            }
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{
                px: 3,
                pb: 3,
                pt: 2,
                gap: 1.5,
                borderTop: '1px solid #e5e7eb'
            }}>
                <Button
                    onClick={handleClose}
                    sx={{
                        textTransform: 'none',
                        color: '#6b7280',
                        fontWeight: 500,
                        '&:hover': {
                            bgcolor: '#f3f4f6'
                        }
                    }}
                >
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                        textTransform: 'none',
                        bgcolor: '#6366f1',
                        fontWeight: 500,
                        px: 3,
                        '&:hover': {
                            bgcolor: '#4f46e5'
                        }
                    }}
                >
                    Thêm Danh Mục
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddIngredientCategory;
