import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, IconButton, Divider,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const ModalIngredientDetail = ({ open, handleClose, ingredient }) => {
    if (!ingredient) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    const checkExpiry = (expiryDate) => {
        if (!expiryDate) return 'default';
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return 'expired';
        if (daysLeft <= 7) return 'warning';
        return 'good';
    };

    const totalStock = (ingredient.batches || []).reduce((sum, batch) => sum + (batch.quantity || 0), 0);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
            {/* Header */}
            <DialogTitle sx={{
                bgcolor: '#667eea',
                color: 'white',
                py: 2.5,
                px: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <InfoIcon sx={{ fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.3 }}>
                                Chi Tiết Nguyên Liệu
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                Thông tin đầy đủ về nguyên liệu và lịch sử nhập kho
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>
                {/* Thông Tin Cơ Bản */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e5e7eb' }}>
                    <Typography variant="subtitle1" fontWeight="700" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalOfferIcon fontSize="small" />
                        Thông Tin Cơ Bản
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Tên Nguyên Liệu
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {ingredient.name}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Mã SKU
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {ingredient.sku || '-'}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Nhóm Hàng
                                </Typography>
                                <Chip label={ingredient.categoryName || '-'} size="small" color="primary" variant="outlined" />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Đơn Vị Cơ Sở
                                </Typography>
                                <Chip label={ingredient.baseUnit || 'g'} size="small" />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Tổng Tồn Kho
                                </Typography>
                                <Typography variant="h6" color="success.main" fontWeight="700">
                                    {totalStock.toLocaleString()} {ingredient.baseUnit || 'g'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Tồn Tối Thiểu</Typography>
                            <Typography variant="body2" fontWeight="600">{ingredient.minStock || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Tồn Tối Đa</Typography>
                            <Typography variant="body2" fontWeight="600">{ingredient.maxStock || 0}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">HSD Mặc Định</Typography>
                            <Typography variant="body2" fontWeight="600">{ingredient.defaultShelfLifeDays || 180} ngày</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Ngày Tạo</Typography>
                            <Typography variant="body2" fontWeight="600">{formatDate(ingredient.createdDate)}</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Đơn Vị Quy Đổi */}
                {ingredient.units && ingredient.units.length > 0 && (
                    <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e5e7eb' }}>
                        <Typography variant="subtitle1" fontWeight="700" color="primary" sx={{ mb: 2 }}>
                            Đơn Vị Quy Đổi
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {ingredient.units.map((unit, index) => (
                                <Chip
                                    key={index}
                                    label={`1 ${unit.unitName} = ${unit.conversionRate} ${ingredient.baseUnit}`}
                                    color={unit.isBaseUnit ? "primary" : "default"}
                                    variant={unit.isBaseUnit ? "filled" : "outlined"}
                                />
                            ))}
                        </Box>
                    </Paper>
                )}

                {/* Lịch Sử Nhập Kho */}
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb' }}>
                    <Typography variant="subtitle1" fontWeight="700" color="primary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon fontSize="small" />
                        Lịch Sử Nhập Kho ({ingredient.batches?.length || 0} lô hàng)
                    </Typography>

                    {!ingredient.batches || ingredient.batches.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                Chưa có lô hàng nào
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                                        <TableCell><Typography variant="caption" fontWeight="bold">Mã Lô</Typography></TableCell>
                                        <TableCell><Typography variant="caption" fontWeight="bold">Số Lượng</Typography></TableCell>
                                        <TableCell><Typography variant="caption" fontWeight="bold">Giá Vốn</Typography></TableCell>
                                        <TableCell><Typography variant="caption" fontWeight="bold">Ngày Nhập</Typography></TableCell>
                                        <TableCell><Typography variant="caption" fontWeight="bold">Người Nhập</Typography></TableCell>
                                        <TableCell><Typography variant="caption" fontWeight="bold">HSD</Typography></TableCell>
                                        <TableCell><Typography variant="caption" fontWeight="bold">Trạng Thái</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {ingredient.batches.map((batch) => {
                                        const expiryStatus = checkExpiry(batch.expiryDate);
                                        return (
                                            <TableRow key={batch.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                                <TableCell>
                                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                        {batch.batchCode || `#${batch.id}`}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {(batch.quantity || 0).toLocaleString()} {ingredient.baseUnit}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {(batch.importPricePerBaseUnit || 0).toLocaleString('vi-VN')} đ/{ingredient.baseUnit}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption">
                                                            {formatDate(batch.importDate)}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption">
                                                            {batch.createdBy || 'Admin'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption">
                                                        {formatDate(batch.expiryDate)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {expiryStatus === 'expired' && (
                                                        <Chip label="Hết hạn" color="error" size="small" variant="filled" />
                                                    )}
                                                    {expiryStatus === 'warning' && (
                                                        <Chip label="Sắp hết" color="warning" size="small" />
                                                    )}
                                                    {expiryStatus === 'good' && (
                                                        <Chip label="Còn hạn" color="success" size="small" variant="outlined" />
                                                    )}
                                                    {expiryStatus === 'default' && (
                                                        <Typography variant="caption" color="text.secondary">-</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #e5e7eb' }}>
                <Button onClick={handleClose} variant="contained" sx={{ bgcolor: '#667eea' }}>
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalIngredientDetail;
