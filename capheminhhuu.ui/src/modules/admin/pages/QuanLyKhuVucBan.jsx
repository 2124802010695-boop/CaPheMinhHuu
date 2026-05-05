import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Button, IconButton, Chip,
    Tabs, Tab, Grid, Card, CardContent, CardActions,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Switch, FormControlLabel, CircularProgress,
    Tooltip, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TableBarIcon from '@mui/icons-material/TableBar';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import toast from 'react-hot-toast';
import {
    getAreasAPI, createAreaAPI, updateAreaAPI, deleteAreaAPI
} from '../services/areaService';
import {
    getTablesAPI, createTableAPI, updateTableAPI, deleteTableAPI
} from '../services/adminTableService';

// ─── Constants ───────────────────────────────────────────
const STATUS_COLORS = {
    Empty:    { bg: '#f0fdf4', color: '#15803d', label: 'Trống' },
    Occupied: { bg: '#fff7ed', color: '#c2410c', label: 'Có khách' },
    Reserved: { bg: '#eff6ff', color: '#1d4ed8', label: 'Đặt trước' },
};

const INIT_AREA = { name: '', description: '', isActive: true, displayOrder: 0 };
const INIT_TABLE = { number: '', seats: 2, areaId: null };

// ─── Component ───────────────────────────────────────────
const QuanLyKhuVucBan = () => {
    // Data
    const [areas, setAreas]   = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tab
    const [activeTab, setActiveTab] = useState(0);

    // Modal Area
    const [areaModal, setAreaModal]     = useState(false);
    const [areaForm, setAreaForm]       = useState(INIT_AREA);
    const [editingArea, setEditingArea] = useState(null);
    const [savingArea, setSavingArea]   = useState(false);

    // Modal Table
    const [tableModal, setTableModal]     = useState(false);
    const [tableForm, setTableForm]       = useState(INIT_TABLE);
    const [editingTable, setEditingTable] = useState(null);
    const [savingTable, setSavingTable]   = useState(false);

    // Confirm Delete Dialog
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', item: null });

    // ── Fetch ──────────────────────────────────────────
    const fetchAll = async () => {
        setLoading(true);
        try {
            const [areasRes, tablesRes] = await Promise.all([
                getAreasAPI(),
                getTablesAPI()
            ]);
            setAreas(areasRes || []);
            setTables(tablesRes || []);
        } catch {
            toast.error('Không tải được dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // ── Derived ────────────────────────────────────────
    const currentArea = areas[activeTab] ?? null;
    const tablesInArea = currentArea
        ? tables.filter(t => t.areaId === currentArea.id)
        : [];

    // ── Area handlers ──────────────────────────────────
    const openAddArea = () => {
        setEditingArea(null);
        setAreaForm({ ...INIT_AREA, displayOrder: areas.length });
        setAreaModal(true);
    };

    const openEditArea = (area) => {
        setEditingArea(area);
        setAreaForm({
            name: area.name,
            description: area.description || '',
            isActive: area.isActive,
            displayOrder: area.displayOrder,
        });
        setAreaModal(true);
    };

    const handleSaveArea = async () => {
        if (!areaForm.name.trim()) { toast.error('Tên khu vực không được để trống'); return; }
        setSavingArea(true);
        try {
            if (editingArea) {
                await updateAreaAPI(editingArea.id, areaForm);
                toast.success('Đã cập nhật khu vực');
            } else {
                await createAreaAPI(areaForm);
                toast.success('Đã thêm khu vực mới');
            }
            setAreaModal(false);
            await fetchAll();
        } catch {
            toast.error('Lỗi lưu khu vực');
        } finally {
            setSavingArea(false);
        }
    };

    const confirmDeleteArea = (area) =>
        setConfirmDialog({ open: true, type: 'area', item: area });

    const handleDeleteArea = async () => {
        try {
            await deleteAreaAPI(confirmDialog.item.id);
            toast.success('Đã xóa khu vực');
            setActiveTab(0);
            await fetchAll();
        } catch {
            toast.error('Lỗi xóa khu vực');
        } finally {
            setConfirmDialog({ open: false, type: '', item: null });
        }
    };

    // ── Table handlers ─────────────────────────────────
    const openAddTable = () => {
        setEditingTable(null);
        setTableForm({ ...INIT_TABLE, areaId: currentArea?.id ?? null });
        setTableModal(true);
    };

    const openEditTable = (table) => {
        setEditingTable(table);
        setTableForm({
            number: table.number,
            seats: table.seats,
            areaId: table.areaId,
        });
        setTableModal(true);
    };

    const handleSaveTable = async () => {
        if (!tableForm.number) { toast.error('Số bàn không được để trống'); return; }
        if (tableForm.seats < 1) { toast.error('Số chỗ phải lớn hơn 0'); return; }
        setSavingTable(true);
        try {
            if (editingTable) {
                await updateTableAPI(editingTable.id, {
                    number: Number(tableForm.number),
                    seats: Number(tableForm.seats),
                    status: editingTable.status,
                    areaId: tableForm.areaId,
                });
                toast.success('Đã cập nhật bàn');
            } else {
                await createTableAPI({
                    number: Number(tableForm.number),
                    seats: Number(tableForm.seats),
                    areaId: tableForm.areaId,
                });
                toast.success('Đã thêm bàn mới');
            }
            setTableModal(false);
            await fetchAll();
        } catch {
            toast.error('Lỗi lưu bàn');
        } finally {
            setSavingTable(false);
        }
    };

    const confirmDeleteTable = (table) =>
        setConfirmDialog({ open: true, type: 'table', item: table });

    const handleDeleteTable = async () => {
        try {
            await deleteTableAPI(confirmDialog.item.id);
            toast.success('Đã xóa bàn');
            await fetchAll();
        } catch {
            toast.error('Lỗi xóa bàn');
        } finally {
            setConfirmDialog({ open: false, type: '', item: null });
        }
    };

    const handleConfirmDelete = () =>
        confirmDialog.type === 'area' ? handleDeleteArea() : handleDeleteTable();

    // ── Render ─────────────────────────────────────────
    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress sx={{ color: '#10b981' }} />
        </Box>
    );

    return (
        <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>

            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ bgcolor: '#f3f4f6', borderRadius: 2, p: 1.5, display: 'flex' }}>
                            <MeetingRoomIcon sx={{ color: '#10b981', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', mb: 0.5 }}>
                                Quản Lý Khu Vực & Bàn
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                {areas.length} khu vực · {tables.length} bàn
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openAddArea}
                        sx={{ bgcolor: '#10b981', textTransform: 'none', fontWeight: 500, px: 3, '&:hover': { bgcolor: '#059669' } }}
                    >
                        Thêm Khu Vực
                    </Button>
                </Box>
            </Paper>

            {/* Tabs */}
            {areas.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                    <MeetingRoomIcon sx={{ fontSize: 56, color: '#d1d5db', mb: 2 }} />
                    <Typography sx={{ color: '#9ca3af', mb: 2 }}>Chưa có khu vực nào</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={openAddArea}
                        sx={{ textTransform: 'none', borderColor: '#10b981', color: '#10b981' }}>
                        Thêm khu vực đầu tiên
                    </Button>
                </Paper>
            ) : (
                <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    {/* Tab bar */}
                    <Box sx={{ borderBottom: '1px solid #e5e7eb', bgcolor: '#fff', px: 2 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, v) => setActiveTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 48 },
                                '& .Mui-selected': { color: '#10b981 !important' },
                                '& .MuiTabs-indicator': { bgcolor: '#10b981' },
                            }}
                        >
                            {areas.map((area, idx) => (
                                <Tab
                                    key={area.id}
                                    value={idx}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {area.name}
                                            <Chip
                                                label={tables.filter(t => t.areaId === area.id).length}
                                                size="small"
                                                sx={{ height: 18, fontSize: '0.65rem',
                                                    bgcolor: activeTab === idx ? '#d1fae5' : '#f3f4f6',
                                                    color: activeTab === idx ? '#065f46' : '#6b7280' }}
                                            />
                                            {!area.isActive && (
                                                <Chip label="Tắt" size="small"
                                                    sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#fee2e2', color: '#dc2626' }} />
                                            )}
                                        </Box>
                                    }
                                />
                            ))}
                        </Tabs>
                    </Box>

                    {/* Tab Panel */}
                    {currentArea && (
                        <Box sx={{ p: 3, bgcolor: '#fff' }}>
                            {/* Area info bar */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                                            {currentArea.name}
                                        </Typography>
                                        <Chip
                                            label={currentArea.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                                            size="small"
                                            sx={{
                                                bgcolor: currentArea.isActive ? '#d1fae5' : '#fee2e2',
                                                color: currentArea.isActive ? '#065f46' : '#dc2626',
                                                fontWeight: 500
                                            }}
                                        />
                                    </Box>
                                    {currentArea.description && (
                                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                                            {currentArea.description}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" startIcon={<EditIcon />} onClick={() => openEditArea(currentArea)}
                                        sx={{ textTransform: 'none', color: '#6b7280', borderColor: '#e5e7eb' }} variant="outlined">
                                        Sửa khu vực
                                    </Button>
                                    <Button size="small" startIcon={<DeleteIcon />} onClick={() => confirmDeleteArea(currentArea)}
                                        sx={{ textTransform: 'none', color: '#ef4444', borderColor: '#fecaca' }} variant="outlined">
                                        Xóa
                                    </Button>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            {/* Tables Grid */}
                            <Grid container spacing={2}>
                                {tablesInArea.map(table => {
                                    const s = STATUS_COLORS[table.status] ?? STATUS_COLORS.Empty;
                                    return (
                                        <Grid item xs={6} sm={4} md={3} lg={2} key={table.id}>
                                            <Card elevation={0} sx={{
                                                border: '1px solid #e5e7eb', borderRadius: 2,
                                                bgcolor: s.bg, transition: 'box-shadow 0.15s',
                                                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                                            }}>
                                                <CardContent sx={{ pb: 1, pt: 2, px: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', lineHeight: 1 }}>
                                                                Bàn {table.number}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                                                {table.seats} chỗ
                                                            </Typography>
                                                        </Box>
                                                        <TableBarIcon sx={{ color: s.color, fontSize: 22, mt: 0.5 }} />
                                                    </Box>
                                                    <Chip label={s.label} size="small" sx={{
                                                        mt: 1.5, bgcolor: 'transparent',
                                                        border: `1px solid ${s.color}`,
                                                        color: s.color, fontWeight: 500, fontSize: '0.7rem'
                                                    }} />
                                                </CardContent>
                                                <CardActions sx={{ px: 2, pb: 1.5, pt: 0, gap: 0.5 }}>
                                                    <Tooltip title="Sửa bàn">
                                                        <IconButton size="small" onClick={() => openEditTable(table)}
                                                            sx={{ '&:hover': { bgcolor: '#fffbeb', color: '#f59e0b' } }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa bàn">
                                                        <IconButton size="small" onClick={() => confirmDeleteTable(table)}
                                                            sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    );
                                })}

                                {/* Add Table card */}
                                <Grid item xs={6} sm={4} md={3} lg={2}>
                                    <Card elevation={0} onClick={openAddTable} sx={{
                                        border: '2px dashed #d1d5db', borderRadius: 2,
                                        cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        minHeight: 110,
                                        transition: 'all 0.15s',
                                        '&:hover': { borderColor: '#10b981', bgcolor: '#f0fdf4' }
                                    }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <AddIcon sx={{ color: '#9ca3af', fontSize: 28 }} />
                                            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.5 }}>
                                                Thêm bàn
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>
            )}

            {/* ── Modal Khu Vực ── */}
            <Dialog open={areaModal} onClose={() => setAreaModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    {editingArea ? 'Sửa Khu Vực' : 'Thêm Khu Vực'}
                </DialogTitle>
                <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Tên khu vực *" fullWidth size="small"
                        value={areaForm.name}
                        onChange={e => setAreaForm(p => ({ ...p, name: e.target.value }))}
                    />
                    <TextField
                        label="Mô tả" fullWidth size="small" multiline rows={2}
                        value={areaForm.description}
                        onChange={e => setAreaForm(p => ({ ...p, description: e.target.value }))}
                    />
                    <TextField
                        label="Thứ tự hiển thị" fullWidth size="small" type="number"
                        value={areaForm.displayOrder}
                        onChange={e => setAreaForm(p => ({ ...p, displayOrder: Number(e.target.value) }))}
                    />
                    <FormControlLabel
                        control={
                            <Switch checked={areaForm.isActive}
                                onChange={e => setAreaForm(p => ({ ...p, isActive: e.target.checked }))}
                                sx={{ '& .Mui-checked': { color: '#10b981' }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981' } }}
                            />
                        }
                        label="Đang hoạt động"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setAreaModal(false)} sx={{ textTransform: 'none', color: '#6b7280' }}>
                        Huỷ
                    </Button>
                    <Button variant="contained" onClick={handleSaveArea} disabled={savingArea}
                        startIcon={savingArea ? <CircularProgress size={14} color="inherit" /> : null}
                        sx={{ textTransform: 'none', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                        {savingArea ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Modal Bàn ── */}
            <Dialog open={tableModal} onClose={() => setTableModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                    {editingTable ? 'Sửa Bàn' : 'Thêm Bàn'}
                </DialogTitle>
                <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Số bàn *" fullWidth size="small" type="number"
                        value={tableForm.number}
                        onChange={e => setTableForm(p => ({ ...p, number: e.target.value }))}
                    />
                    <TextField
                        label="Số chỗ ngồi *" fullWidth size="small" type="number"
                        value={tableForm.seats}
                        onChange={e => setTableForm(p => ({ ...p, seats: e.target.value }))}
                        inputProps={{ min: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setTableModal(false)} sx={{ textTransform: 'none', color: '#6b7280' }}>
                        Huỷ
                    </Button>
                    <Button variant="contained" onClick={handleSaveTable} disabled={savingTable}
                        startIcon={savingTable ? <CircularProgress size={14} color="inherit" /> : null}
                        sx={{ textTransform: 'none', bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                        {savingTable ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Confirm Delete Dialog ── */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: '', item: null })} maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.type === 'area'
                            ? `Xóa khu vực "${confirmDialog.item?.name}"? Các bàn trong khu vực này sẽ mất liên kết.`
                            : `Xóa bàn số ${confirmDialog.item?.number}?`
                        }
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button onClick={() => setConfirmDialog({ open: false, type: '', item: null })}
                        sx={{ textTransform: 'none', color: '#6b7280' }}>
                        Huỷ
                    </Button>
                    <Button variant="contained" onClick={handleConfirmDelete}
                        sx={{ textTransform: 'none', bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default QuanLyKhuVucBan;