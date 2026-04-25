import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, IconButton
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { createCategoryAPI } from '../../services/categoryService';

const ModalAddCategory = ({ open, handleClose, fetchCategories }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    const handleSubmit = async () => {
        try {
            if (!name) {
                alert("Vui lòng nhập tên danh mục!");
                return;
            }

            await createCategoryAPI({ name, description: desc });
            alert("Thêm danh mục thành công!");
            handleClose();
            fetchCategories();
            setName('');
            setDesc('');
        } catch (error) {
            alert("Lỗi thêm danh mục!");
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    py: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CategoryIcon sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Thêm Danh Mục Mới
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Tạo nhóm phân loại sản phẩm
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ py: 3 }}>
                <TextField
                    fullWidth
                    label="Tên Danh Mục *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    placeholder="VD: Cà phê, Trà sữa, Sinh tố..."
                    required
                />
                <TextField
                    fullWidth
                    label="Mô tả"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    multiline
                    rows={3}
                    placeholder="Mô tả chi tiết về danh mục này..."
                />
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
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                        }
                    }}
                >
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalAddCategory;