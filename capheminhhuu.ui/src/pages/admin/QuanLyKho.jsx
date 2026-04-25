import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton,
    Chip, Tooltip, Alert, CircularProgress, Collapse
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddBoxIcon from '@mui/icons-material/AddBox';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoIcon from '@mui/icons-material/Info';

import { getIngredientsAPI, deleteIngredientAPI, getIngredientByIdAPI } from '../../services/ingredientService';
import ModalAddIngredient from '../../components/admin/ModalAddIngredient';
import ModalEditIngredient from '../../components/admin/ModalEditIngredient';
import ModalIngredientDetail from '../../components/admin/ModalIngredientDetail';

// Component để hiển thị chi tiết batches
const BatchesDetail = ({ batches, baseUnit }) => {
    if (!batches || batches.length === 0) {
        return (
            <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Chưa có lô hàng nào
                </Typography>
            </Box>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('vi-VN');
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

    return (
        <Box sx={{ p: 2, bgcolor: '#f9fafb' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><Typography variant="caption" fontWeight="bold">Mã lô</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight="bold">Số lượng</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight="bold">Giá vốn</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight="bold">Ngày nhập</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight="bold">HSD</Typography></TableCell>
                        <TableCell><Typography variant="caption" fontWeight="bold">Trạng thái</Typography></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {batches.map((batch) => {
                        const expiryStatus = checkExpiry(batch.expiryDate);
                        return (
                            <TableRow key={batch.id}>
                                <TableCell>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                        {batch.batchCode || `#${batch.id}`}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {(batch.quantity || 0).toLocaleString()} {baseUnit}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {(batch.importPricePerBaseUnit || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} đ/{baseUnit}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {formatDate(batch.importDate)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {formatDate(batch.expiryDate)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {expiryStatus === 'expired' && (
                                        <Chip
                                            icon={<ErrorIcon />}
                                            label="Hết hạn"
                                            color="error"
                                            size="small"
                                            variant="filled"
                                        />
                                    )}
                                    {expiryStatus === 'warning' && (
                                        <Chip
                                            icon={<WarningIcon />}
                                            label="Sắp hết hạn"
                                            color="warning"
                                            size="small"
                                        />
                                    )}
                                    {expiryStatus === 'good' && (
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="Còn hạn"
                                            color="success"
                                            size="small"
                                            variant="outlined"
                                        />
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
        </Box>
    );
};

// Component row với expand
const IngredientRow = ({ ingredient, onEdit, onDelete, onDetail }) => {
    const [open, setOpen] = useState(false);

    // Tính tổng tồn kho từ tất cả batches
    const totalStock = (ingredient.batches || []).reduce((sum, batch) => sum + (batch.quantity || 0), 0);

    // Tính giá vốn trung bình
    const avgCostPrice = ingredient.batches && ingredient.batches.length > 0
        ? ingredient.batches.reduce((sum, batch) => sum + (batch.importPricePerBaseUnit || 0), 0) / ingredient.batches.length
        : 0;

    // Kiểm tra có batch nào sắp hết hạn/hết hạn không
    const hasExpiringBatches = (ingredient.batches || []).some(batch => {
        if (!batch.expiryDate) return false;
        const daysLeft = Math.ceil((new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 7;
    });

    const hasExpiredBatches = (ingredient.batches || []).some(batch => {
        if (!batch.expiryDate) return false;
        return new Date(batch.expiryDate) < new Date();
    });

    // Kiểm tra tồn kho thấp
    const isLowStock = ingredient.minStock > 0 && totalStock < ingredient.minStock;

    return (
        <>
            <TableRow
                sx={{
                    '&:hover': { bgcolor: '#f9fafb' },
                    bgcolor: hasExpiredBatches ? '#fef2f2' : 'inherit'
                }}
            >
                <TableCell>
                    <IconButton
                        size="small"
                        onClick={() => setOpen(!open)}
                        disabled={!ingredient.batches || ingredient.batches.length === 0}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                <TableCell>
                    <Typography variant="body2" fontWeight="600" color="primary">
                        {ingredient.name || 'Không tên'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        SKU: {ingredient.sku || '-'}
                    </Typography>
                </TableCell>

                <TableCell>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {ingredient.categoryName || '-'}
                    </Typography>
                    <Chip
                        label={ingredient.baseUnit || 'g'}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 11 }}
                    />
                </TableCell>

                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={totalStock.toLocaleString()}
                            color={isLowStock ? "error" : totalStock === 0 ? "default" : "success"}
                            size="small"
                            sx={{ minWidth: 60, fontWeight: 600 }}
                        />
                        {isLowStock && (
                            <Tooltip title={`Dưới mức tối thiểu (${ingredient.minStock})`}>
                                <TrendingDownIcon color="error" sx={{ fontSize: 18 }} />
                            </Tooltip>
                        )}
                    </Box>
                </TableCell>

                <TableCell>
                    <Typography variant="body2" fontWeight="500">
                        {avgCostPrice.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} đ
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        /{ingredient.baseUnit || 'g'}
                    </Typography>
                </TableCell>

                <TableCell>
                    <Chip
                        label={`${ingredient.batches?.length || 0} lô`}
                        size="small"
                        variant="outlined"
                        color={ingredient.batches?.length > 0 ? "primary" : "default"}
                    />
                </TableCell>

                <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {hasExpiredBatches && (
                            <Tooltip title="Có lô hàng đã hết hạn">
                                <Chip
                                    icon={<ErrorIcon />}
                                    label="Hết hạn"
                                    color="error"
                                    size="small"
                                    variant="filled"
                                />
                            </Tooltip>
                        )}
                        {hasExpiringBatches && !hasExpiredBatches && (
                            <Tooltip title="Có lô hàng sắp hết hạn">
                                <Chip
                                    icon={<WarningIcon />}
                                    label="Sắp hết"
                                    color="warning"
                                    size="small"
                                />
                            </Tooltip>
                        )}
                        {!hasExpiredBatches && !hasExpiringBatches && ingredient.batches?.length > 0 && (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Tốt"
                                color="success"
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>
                </TableCell>

                <TableCell align="right">
                    <Tooltip title="Chi tiết">
                        <IconButton
                            color="info"
                            onClick={() => onDetail(ingredient.id)}
                            size="small"
                            sx={{ mr: 0.5 }}
                        >
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <IconButton
                            color="primary"
                            onClick={() => onEdit(ingredient.id)}
                            size="small"
                            sx={{ mr: 0.5 }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <IconButton
                            color="error"
                            onClick={() => onDelete(ingredient.id)}
                            size="small"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>

            {/* Expanded row - Batches detail */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <BatchesDetail batches={ingredient.batches} baseUnit={ingredient.baseUnit} />
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

const QuanLyKho = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    const fetchIngredients = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getIngredientsAPI();
            if (res && Array.isArray(res)) {
                setIngredients(res);
            } else if (res && res.data && Array.isArray(res.data)) {
                setIngredients(res.data);
            } else {
                setIngredients([]);
            }
        } catch (err) {
            console.error("Lỗi fetch API:", err);
            setError('Không thể tải danh sách nguyên liệu');
            setIngredients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Xóa nguyên liệu này? Toàn bộ lô hàng và đơn vị quy đổi sẽ bị xóa.")) {
            try {
                await deleteIngredientAPI(id);
                await fetchIngredients();
            } catch (err) {
                console.error("Lỗi xóa:", err);
                alert("Không thể xóa nguyên liệu");
            }
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await getIngredientByIdAPI(id);
            if (res) {
                setSelectedIngredient(res);
                setOpenEditModal(true);
            }
        } catch (err) {
            console.error("Lỗi load ingredient:", err);
            alert("Không thể tải thông tin nguyên liệu");
        }
    };

    const handleDetail = async (id) => {
        try {
            const res = await getIngredientByIdAPI(id);
            if (res) {
                setSelectedIngredient(res);
                setOpenDetailModal(true);
            }
        } catch (err) {
            console.error("Lỗi load ingredient:", err);
            alert("Không thể tải thông tin nguyên liệu");
        }
    };

    // Tính toán statistics
    const stats = {
        total: ingredients.length,
        expiring: ingredients.filter(i =>
            (i.batches || []).some(b => {
                if (!b.expiryDate) return false;
                const daysLeft = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                return daysLeft > 0 && daysLeft <= 7;
            })
        ).length,
        expired: ingredients.filter(i =>
            (i.batches || []).some(b => {
                if (!b.expiryDate) return false;
                return new Date(b.expiryDate) < new Date();
            })
        ).length,
        lowStock: ingredients.filter(i => {
            const totalStock = (i.batches || []).reduce((sum, batch) => sum + (batch.quantity || 0), 0);
            return i.minStock > 0 && totalStock < i.minStock;
        }).length
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: '#111827' }}>
                        📦 Quản Lý Kho Nguyên Liệu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Theo dõi tồn kho, lô hàng và hạn sử dụng nguyên liệu
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddBoxIcon />}
                    onClick={() => setOpenAddModal(true)}
                    sx={{
                        bgcolor: '#10b981',
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3,
                        '&:hover': { bgcolor: '#059669' }
                    }}
                >
                    Nhập Hàng
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Statistics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <InventoryIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Tổng nguyên liệu
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {stats.total}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Sắp hết hạn
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="warning.main">
                                {stats.expiring}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Đã hết hạn
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="error.main">
                                {stats.expired}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Tồn kho thấp
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="error.main">
                                {stats.lowStock}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}
            >
                <Table>
                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                        <TableRow>
                            <TableCell sx={{ width: 50 }} />
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Tên nguyên liệu</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Nhóm & Đơn vị</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Tồn kho</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Giá vốn TB</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Số lô hàng</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">Tình trạng</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Thao tác</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ingredients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Chưa có nguyên liệu nào. Nhấn "Nhập Hàng" để thêm mới.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            ingredients.map((ingredient) => (
                                <IngredientRow
                                    key={ingredient.id}
                                    ingredient={ingredient}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onDetail={handleDetail}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modals */}
            <ModalAddIngredient
                open={openAddModal}
                handleClose={() => setOpenAddModal(false)}
                fetchIngredients={fetchIngredients}
            />

            <ModalEditIngredient
                open={openEditModal}
                handleClose={() => setOpenEditModal(false)}
                ingredient={selectedIngredient}
                fetchIngredients={fetchIngredients}
            />

            <ModalIngredientDetail
                open={openDetailModal}
                handleClose={() => setOpenDetailModal(false)}
                ingredient={selectedIngredient}
            />
        </Box>
    );
};

export default QuanLyKho;