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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { getIngredientsAPI, deleteIngredientAPI, getIngredientByIdAPI } from '../services/ingredientService';
import ModalAddIngredient from '../components/ModalAddIngredient';
import ModalEditIngredient from '../components/ModalEditIngredient';
import ModalIngredientDetail from '../components/ModalIngredientDetail';
import ModalAddBatch from '../components/ModalAddBatch';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('vi-VN');
    } catch { return '-'; }
};

const checkExpiry = (expiryDate) => {
    if (!expiryDate) return 'default';
    const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'warning';
    return 'good';
};

// ── BatchesDetail ─────────────────────────────────────────────
const BatchesDetail = ({ batches, baseUnit }) => {
    if (!batches || batches.length === 0) return (
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="caption" color="text.secondary">Chưa có lô hàng nào</Typography>
        </Box>
    );
    return (
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {['Mã lô', 'Tồn hiện tại', 'Nhập ban đầu', 'Giá vốn', 'Ngày nhập', 'HSD', 'Trạng thái'].map(h => (
                            <TableCell key={h}><Typography variant="caption" fontWeight="bold">{h}</Typography></TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {batches.map((batch) => {
                        const status = checkExpiry(batch.expiryDate);
                        return (
                            <TableRow key={batch.id}>
                                <TableCell>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                        {batch.batchCode || `#${batch.id}`}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {/* ✅ Dùng currentQuantity thay vì quantity */}
                                    <Typography variant="caption" fontWeight="bold">
                                        {(batch.currentQuantity ?? 0).toLocaleString()} {baseUnit}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {(batch.initialQuantity ?? 0).toLocaleString()} {baseUnit}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">
                                        {(batch.importPricePerBaseUnit ?? 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} đ/{baseUnit}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">{formatDate(batch.importDate)}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption">{formatDate(batch.expiryDate)}</Typography>
                                </TableCell>
                                <TableCell>
                                    {status === 'expired' && <Chip icon={<ErrorIcon />} label="Hết hạn" color="error" size="small" />}
                                    {status === 'warning' && <Chip icon={<WarningIcon />} label="Sắp hết" color="warning" size="small" />}
                                    {status === 'good' && <Chip icon={<CheckCircleIcon />} label="Còn hạn" color="success" size="small" variant="outlined" />}
                                    {status === 'default' && <Typography variant="caption" color="text.secondary">-</Typography>}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
};

// ── IngredientRow ─────────────────────────────────────────────
const IngredientRow = ({ ingredient, onEdit, onDelete, onDetail, onAddBatch }) => {
    const [open, setOpen] = useState(false);

    // ✅ Dùng currentQuantity
    const totalStock = (ingredient.batches || []).reduce((sum, b) => sum + (b.currentQuantity ?? 0), 0);
    const avgCostPrice = ingredient.batches?.length > 0
        ? ingredient.batches.reduce((sum, b) => sum + (b.importPricePerBaseUnit ?? 0), 0) / ingredient.batches.length
        : 0;

    const hasExpiredBatches = (ingredient.batches || []).some(b => b.expiryDate && new Date(b.expiryDate) < new Date());
    const hasExpiringBatches = (ingredient.batches || []).some(b => {
        if (!b.expiryDate) return false;
        const daysLeft = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft >= 0 && daysLeft <= 7;
    });
    const isLowStock = ingredient.minStock > 0 && totalStock < ingredient.minStock;

    return (
        <>
            <TableRow sx={{
                '&:hover': { bgcolor: 'action.hover' },
                bgcolor: hasExpiredBatches ? '#fef2f2' : 'inherit'
            }}>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}
                        disabled={!ingredient.batches?.length}>
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
                    <Chip label={ingredient.baseUnit || 'g'} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={totalStock.toLocaleString()}
                            color={isLowStock ? "error" : totalStock === 0 ? "default" : "success"}
                            size="small" sx={{ minWidth: 60, fontWeight: 600 }}
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
                    <Typography variant="caption" color="text.secondary">/{ingredient.baseUnit || 'g'}</Typography>
                </TableCell>
                <TableCell>
                    <Chip
                        label={`${ingredient.batches?.length || 0} lô`}
                        size="small" variant="outlined"
                        color={ingredient.batches?.length > 0 ? "primary" : "default"}
                    />
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {hasExpiredBatches && <Chip icon={<ErrorIcon />} label="Hết hạn" color="error" size="small" />}
                        {hasExpiringBatches && !hasExpiredBatches && <Chip icon={<WarningIcon />} label="Sắp hết" color="warning" size="small" />}
                        {!hasExpiredBatches && !hasExpiringBatches && ingredient.batches?.length > 0 && (
                            <Chip icon={<CheckCircleIcon />} label="Tốt" color="success" size="small" variant="outlined" />
                        )}
                    </Box>
                </TableCell>
                <TableCell align="right">
                    {/* ✅ Thêm nút nhập thêm lô */}
                    <Tooltip title="Nhập thêm lô hàng">
                        <IconButton color="success" onClick={() => onAddBatch(ingredient)} size="small" sx={{ mr: 0.5 }}>
                            <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chi tiết">
                        <IconButton color="info" onClick={() => onDetail(ingredient.id)} size="small" sx={{ mr: 0.5 }}>
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <IconButton color="primary" onClick={() => onEdit(ingredient.id)} size="small" sx={{ mr: 0.5 }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <IconButton color="error" onClick={() => onDelete(ingredient.id)} size="small">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
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

// ── Main ──────────────────────────────────────────────────────
const QuanLyKho = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openBatchModal, setOpenBatchModal] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null); // null | 'expiring' | 'expired' | 'lowStock'

    const fetchIngredients = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getIngredientsAPI();
            setIngredients(Array.isArray(res) ? res : res?.data || []);
        } catch (err) {
            setError('Không thể tải danh sách nguyên liệu');
            setIngredients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIngredients(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa nguyên liệu này? Toàn bộ lô hàng và đơn vị quy đổi sẽ bị xóa.")) return;
        try {
            await deleteIngredientAPI(id);
            await fetchIngredients();
        } catch { alert("Không thể xóa nguyên liệu"); }
    };

    const handleEdit = async (id) => {
        try {
            const res = await getIngredientByIdAPI(id);
            if (res) { setSelectedIngredient(res); setOpenEditModal(true); }
        } catch { alert("Không thể tải thông tin nguyên liệu"); }
    };

    const handleDetail = async (id) => {
        try {
            const res = await getIngredientByIdAPI(id);
            if (res) { setSelectedIngredient(res); setOpenDetailModal(true); }
        } catch { alert("Không thể tải thông tin nguyên liệu"); }
    };

    const handleAddBatch = (ingredient) => {
        setSelectedIngredient(ingredient);
        setOpenBatchModal(true);
    };

    // ✅ Dùng currentQuantity trong stats
    const stats = {
        total: ingredients.length,
        expiring: ingredients.filter(i => (i.batches || []).some(b => {
            if (!b.expiryDate) return false;
            const d = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return d > 0 && d <= 7;
        })).length,
        expired: ingredients.filter(i => (i.batches || []).some(b =>
            b.expiryDate && new Date(b.expiryDate) < new Date()
        )).length,
        lowStock: ingredients.filter(i => {
            const total = (i.batches || []).reduce((s, b) => s + (b.currentQuantity ?? 0), 0);
            return i.minStock > 0 && total < i.minStock;
        }).length
    };

    const filteredIngredients = ingredients.filter(i => {
        if (!activeFilter) return true;
        if (activeFilter === 'expiring') return (i.batches || []).some(b => {
            if (!b.expiryDate) return false;
            const d = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return d > 0 && d <= 7;
        });
        if (activeFilter === 'expired') return (i.batches || []).some(b =>
            b.expiryDate && new Date(b.expiryDate) < new Date()
        );
        if (activeFilter === 'lowStock') {
            const total = (i.batches || []).reduce((s, b) => s + (b.currentQuantity ?? 0), 0);
            return i.minStock > 0 && total < i.minStock;
        }
        return true;
    });

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        📦 Quản Lý Kho Nguyên Liệu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Theo dõi tồn kho, lô hàng và hạn sử dụng nguyên liệu
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddBoxIcon />}
                    onClick={() => setOpenAddModal(true)}
                    sx={{ bgcolor: '#10b981', textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}>
                    Nhập Hàng Mới
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                {[
                    { key: null,        label: 'Tổng nguyên liệu', value: stats.total,     icon: <InventoryIcon />,    color: '#3b82f6', bg: '#eff6ff' },
                    { key: 'expiring',  label: 'Sắp hết hạn',      value: stats.expiring,  icon: <WarningIcon />,      color: '#f59e0b', bg: '#fef3c7' },
                    { key: 'expired',   label: 'Đã hết hạn',        value: stats.expired,   icon: <ErrorIcon />,        color: '#ef4444', bg: '#fee2e2' },
                    { key: 'lowStock',  label: 'Tồn kho thấp',      value: stats.lowStock,  icon: <TrendingDownIcon />, color: '#ef4444', bg: '#fee2e2' },
                ].map((s, i) => (
                    <Paper key={i}
                        onClick={() => setActiveFilter(activeFilter === s.key ? null : s.key)}
                        sx={{
                            p: 2.5, borderRadius: 2,
                            border: activeFilter === s.key
                                ? `2px solid ${s.color}`
                                : '1px solid #e5e7eb',
                            cursor: s.key ? 'pointer' : 'default',
                            transition: 'all .15s',
                            bgcolor: activeFilter === s.key ? s.bg : 'background.paper',
                            '&:hover': s.key ? { borderColor: s.color, bgcolor: s.bg } : {},
                            boxShadow: activeFilter === s.key ? `0 0 0 3px ${s.color}20` : 'none',
                        }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {React.cloneElement(s.icon, { sx: { color: s.color, fontSize: 20 } })}
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{s.label}</Typography>
                                <Typography variant="h5" fontWeight="bold" color={i > 0 && s.value > 0 ? s.color : 'text.primary'}>
                                    {s.value}
                                </Typography>
                            </Box>
                        </Box>
                        {activeFilter === s.key && s.key && (
                            <Chip label="Đang lọc" size="small" sx={{ mt: 1, bgcolor: s.color, color: 'white', fontSize: 10 }} />
                        )}
                    </Paper>
                ))}
            </Box>


            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell sx={{ width: 50 }} />
                            {['Tên nguyên liệu', 'Nhóm & Đơn vị', 'Tồn kho', 'Giá vốn TB', 'Số lô hàng', 'Tình trạng', 'Thao tác'].map(h => (
                                <TableCell key={h}><Typography variant="subtitle2" fontWeight="bold">{h}</Typography></TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredIngredients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {activeFilter
                                            ? `Không có nguyên liệu nào trong bộ lọc này`
                                            : 'Chưa có nguyên liệu nào'}
                                    </Typography>
                                    {activeFilter && (
                                        <Button size="small" onClick={() => setActiveFilter(null)} sx={{ mt: 1 }}>
                                            Xóa bộ lọc
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : filteredIngredients.map(ing => (
                            <IngredientRow key={ing.id} ingredient={ing}
                                onEdit={handleEdit} onDelete={handleDelete}
                                onDetail={handleDetail} onAddBatch={handleAddBatch} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ModalAddIngredient open={openAddModal} handleClose={() => setOpenAddModal(false)} fetchIngredients={fetchIngredients} />
            <ModalEditIngredient open={openEditModal} handleClose={() => setOpenEditModal(false)} ingredient={selectedIngredient} fetchIngredients={fetchIngredients} />
            <ModalIngredientDetail open={openDetailModal} handleClose={() => setOpenDetailModal(false)} ingredient={selectedIngredient} />
            <ModalAddBatch open={openBatchModal} handleClose={() => setOpenBatchModal(false)} ingredient={selectedIngredient} fetchIngredients={fetchIngredients} />
        </Box>
    );
};

export default QuanLyKho;