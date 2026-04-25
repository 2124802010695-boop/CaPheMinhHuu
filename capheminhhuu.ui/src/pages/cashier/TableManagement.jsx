import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTablesAPI, getTableQRCodeAPI, updateTableStatusAPI } from '../../services/tableService';

const statusConfig = {
    'Empty': { label: 'Available', color: 'text-[#4edea3]', bg: 'bg-[#10b981]/20', iconBg: 'bg-[#4edea3]/10', iconColor: 'text-[#4edea3]', border: '' },
    'Occupied': { label: 'Occupied', color: 'text-[#ffb4ab]', bg: 'bg-[#93000a]/20', iconBg: 'bg-[#93000a]/10', iconColor: 'text-[#ffb4ab]', border: 'border-l-4 border-[#93000a]' },
    'Reserved': { label: 'Reserved', color: 'text-[#ffb95f]', bg: 'bg-[#e29100]/20', iconBg: 'bg-[#e29100]/10', iconColor: 'text-[#ffb95f]', border: 'border-l-4 border-[#e29100]' },
};

export default function TableManagement() {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [activeZone, setActiveZone] = useState('All');
    const [selectedTable, setSelectedTable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // QR Modal state
    const [qrModal, setQrModal] = useState({ open: false, data: null });

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        setLoading(true);
        try {
            const data = await getTablesAPI();
            setTables(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu bàn:', error);
        }
        setLoading(false);
    };

    // ===== HANDLER: Mở bàn (Empty → Occupied) =====
    const handleOpenTable = async (table) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            await updateTableStatusAPI(table.id, 'Occupied');
            setSelectedTable(null);
            await fetchTables();
        } catch (err) {
            console.error('Lỗi mở bàn:', err);
            alert(err.response?.data?.message || 'Không thể mở bàn');
        }
        setActionLoading(false);
    };

    // ===== HANDLER: Trả bàn / Thanh toán (Occupied → Empty) =====
    const handleCloseTable = async (table) => {
        if (actionLoading) return;
        if (!window.confirm(`Xác nhận trả bàn ${table.number}?`)) return;
        setActionLoading(true);
        try {
            await updateTableStatusAPI(table.id, 'Empty');
            setSelectedTable(null);
            await fetchTables();
        } catch (err) {
            console.error('Lỗi trả bàn:', err);
            alert(err.response?.data?.message || 'Không thể trả bàn');
        }
        setActionLoading(false);
    };

    // ===== HANDLER: Xem QR Code =====
    const handleViewQR = async (table) => {
        try {
            const data = await getTableQRCodeAPI(table.id);
            setQrModal({ open: true, data });
        } catch (err) {
            console.error('Lỗi lấy QR:', err);
            alert('Không thể tải mã QR');
        }
    };

    // Derived logic
    const zones = ['All', ...new Set(tables.map(t => t.area || 'Khu vực chung'))];

    const filteredTables = activeZone === 'All' 
        ? tables 
        : tables.filter(t => (t.area || 'Khu vực chung') === activeZone);

    const totalActive = tables.filter(t => t.status === 'Occupied').length;

    const getSubtext = (table) => {
        if (table.status === 'Occupied') return `${table.seats} Chỗ • ${table.currentOrderId ? `Đơn ID: ${table.currentOrderId}` : 'Đang phục vụ'}`;
        if (table.status === 'Reserved') return `${table.seats} Chỗ • Đã đặt`;
        return `${table.seats} Chỗ • Trống`;
    };

    if (loading) {
        return (
            <div className="h-full bg-[#131313] flex items-center justify-center">
                 <div className="w-10 h-10 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full bg-[#131313] overflow-y-auto">
            <div className="p-8 max-w-[1600px] mx-auto pb-32">
                {/* Zone Tabs & Legend */}
                <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[#e5e2e1] tracking-tight mb-4">Floor Overview</h2>
                        <div className="flex gap-2 p-1 bg-[#1c1b1b] rounded-xl w-fit flex-wrap">
                            {zones.map(zone => (
                                <button key={zone} onClick={() => setActiveZone(zone)}
                                    className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-95 ${activeZone === zone ? 'bg-[#4edea3] text-[#003824] shadow-lg' : 'text-[#86948a] hover:text-[#e5e2e1] hover:bg-[#393939]'}`}>
                                    {zone}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-6 px-6 py-3 bg-[#1c1b1b] rounded-2xl border border-[#3c4a42]/10">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                            <span className="text-xs font-medium text-[#86948a]">Bàn trống ({tables.filter(t => t.status === 'Empty').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#93000a]"></div>
                            <span className="text-xs font-medium text-[#86948a]">Có khách ({tables.filter(t => t.status === 'Occupied').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#e29100]"></div>
                            <span className="text-xs font-medium text-[#86948a]">Đặt trước ({tables.filter(t => t.status === 'Reserved').length})</span>
                        </div>
                    </div>
                </div>

                {/* Table Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {filteredTables.map(table => {
                        const cfg = statusConfig[table.status] || statusConfig['Empty'];
                        const isSelected = selectedTable === table.id;
                        return (
                            <div key={table.id} onClick={() => setSelectedTable(isSelected ? null : table.id)}
                                className={`group relative bg-[#1c1b1b] rounded-3xl p-6 cursor-pointer hover:bg-[#201f1f] transition-all duration-200 active:scale-[0.98] ${cfg.border} ${isSelected ? 'ring-1 ring-[#4edea3]/40 shadow-[0_20px_40px_rgba(16,185,129,0.1)] scale-105 z-10' : ''}`}>
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-12 h-12 rounded-2xl ${cfg.iconBg} flex items-center justify-center ${cfg.iconColor}`}>
                                        <span className="material-symbols-outlined text-3xl" style={table.status === 'Reserved' ? {} : table.status === 'Occupied' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                            {table.status === 'Reserved' ? 'event_seat' : 'table_restaurant'}
                                        </span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full ${cfg.bg} ${cfg.color} text-[10px] font-bold uppercase tracking-wider`}>
                                        {isSelected ? 'Selected' : cfg.label}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-[#e5e2e1]">Bàn {table.number}</h3>
                                    <p className="text-xs text-[#86948a]">{getSubtext(table)}</p>
                                </div>
                                {/* Popover when selected */}
                                {isSelected && (
                                    <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-[#353534] rounded-2xl shadow-2xl z-20 border border-[#3c4a42]/20">
                                        <div className="flex flex-col gap-2">
                                            {table.status === 'Empty' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenTable(table); }}
                                                    disabled={actionLoading}
                                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#4edea3] text-[#003824] font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined">add_shopping_cart</span>
                                                    <span>{actionLoading ? 'Đang xử lý...' : 'Mở bàn'}</span>
                                                </button>
                                            )}
                                            {table.status === 'Occupied' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCloseTable(table); }}
                                                    disabled={actionLoading}
                                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-[#393939] text-[#e5e2e1] font-medium text-sm transition-colors border border-[#3c4a42]/20 disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined">payments</span>
                                                    <span>{actionLoading ? 'Đang xử lý...' : 'Thanh toán / Trả bàn'}</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleViewQR(table); }}
                                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-[#393939] text-[#e5e2e1] font-medium text-sm transition-colors"
                                            >
                                                <span className="material-symbols-outlined">qr_code</span>
                                                <span>Xem mã QR</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floor Summary Footer */}
            <div className="fixed bottom-0 right-0 w-[calc(100%-16rem)] p-6 z-30 pointer-events-none">
                <div className="max-w-4xl mx-auto rounded-full py-4 px-10 border border-[#3c4a42]/10 shadow-2xl pointer-events-auto flex items-center justify-between bg-[#201f1f]/70 backdrop-blur-xl">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#86948a] font-bold uppercase tracking-widest">Đang phục vụ</span>
                            <span className="text-xl font-bold text-[#e5e2e1]">{String(totalActive).padStart(2, '0')} / {tables.length}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-2.5 rounded-full bg-[#2a2a2a] border border-[#3c4a42]/20 text-[#e5e2e1] text-xs font-bold hover:bg-[#393939] transition-colors" onClick={() => fetchTables()}>
                            Làm mới Data
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {qrModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setQrModal({ open: false, data: null })}>
                    <div className="bg-[#1c1b1b] rounded-3xl p-8 max-w-sm w-full mx-4 border border-[#3c4a42]/20 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-[#e5e2e1] mb-2">
                                Mã QR — Bàn {qrModal.data?.tableNumber}
                            </h3>
                            <p className="text-xs text-[#86948a] mb-6">
                                Khách quét mã để xem menu & gọi món
                            </p>
                            {/* QR URL hiển thị */}
                            <div className="bg-white rounded-2xl p-6 mb-6 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="material-symbols-outlined text-7xl text-[#131313] mb-2 block">qr_code_2</span>
                                    <p className="text-xs text-gray-500 font-mono break-all">{qrModal.data?.qrUrl}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left bg-[#201f1f] rounded-xl p-4 mb-6">
                                <span className="material-symbols-outlined text-[#4edea3]">info</span>
                                <div>
                                    <p className="text-xs text-[#86948a]">Trạng thái: <span className="text-[#e5e2e1] font-medium">{qrModal.data?.status}</span></p>
                                    <p className="text-xs text-[#86948a]">Table ID: <span className="text-[#e5e2e1] font-medium">#{qrModal.data?.tableId}</span></p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { navigator.clipboard.writeText(qrModal.data?.qrUrl || ''); alert('Đã copy link!'); }}
                                    className="flex-1 px-4 py-3 bg-[#201f1f] text-[#e5e2e1] rounded-xl font-medium text-sm hover:bg-[#393939] transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                    Copy Link
                                </button>
                                <button
                                    onClick={() => setQrModal({ open: false, data: null })}
                                    className="flex-1 px-4 py-3 bg-[#4edea3] text-[#003824] rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
