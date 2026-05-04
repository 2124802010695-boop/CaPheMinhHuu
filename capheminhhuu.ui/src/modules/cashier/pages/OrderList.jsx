import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayOrders, updateOrderStatus } from '../services/orderService';

const statusConfig = {
    'Pending':    { label: 'Chờ xử lý',   color: 'text-[#ffb95f]', bg: 'bg-[#e29100]/20', icon: 'schedule' },
    'Preparing':  { label: 'Đang pha',     color: 'text-[#60a5fa]', bg: 'bg-[#2563eb]/20', icon: 'blender' },
    'Ready':      { label: 'Sẵn sàng',     color: 'text-[#4edea3]', bg: 'bg-[#10b981]/20', icon: 'check_circle' },
    'Served':     { label: 'Đã phục vụ',   color: 'text-[#a78bfa]', bg: 'bg-[#7c3aed]/20', icon: 'room_service' },
    'Completed':  { label: 'Hoàn thành',   color: 'text-[#86948a]', bg: 'bg-[#3c4a42]/20', icon: 'task_alt' },
    'Cancelled':  { label: 'Đã hủy',       color: 'text-[#ffb4ab]', bg: 'bg-[#93000a]/20', icon: 'cancel' },
};

export default function OrderList() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getTodayOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Lỗi tải đơn hàng:', err);
        }
        setLoading(false);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            fetchOrders();
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái:', err);
            alert('Lỗi cập nhật: ' + (err?.response?.data?.message || err.message));
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
            <div className="p-8 max-w-[1400px] mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[#e5e2e1] tracking-tight">Đơn hàng hôm nay</h2>
                        <p className="text-sm text-[#86948a] mt-1">Tổng: {orders.length} đơn</p>
                    </div>
                    <button onClick={fetchOrders}
                        className="px-5 py-2.5 rounded-xl bg-[#1c1b1b] border border-[#3c4a42]/20 text-[#e5e2e1] text-sm font-bold hover:bg-[#393939] transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Làm mới
                    </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 p-1 bg-[#1c1b1b] rounded-xl w-fit mb-8 flex-wrap">
                    <button onClick={() => setFilterStatus('all')}
                        className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${filterStatus === 'all' ? 'bg-[#4edea3] text-[#003824]' : 'text-[#86948a] hover:text-[#e5e2e1]'}`}>
                        Tất cả ({orders.length})
                    </button>
                    {Object.entries(statusConfig).map(([key, cfg]) => {
                        const count = orders.filter(o => o.status === key).length;
                        if (count === 0) return null;
                        return (
                            <button key={key} onClick={() => setFilterStatus(key)}
                                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${filterStatus === key ? 'bg-[#4edea3] text-[#003824]' : 'text-[#86948a] hover:text-[#e5e2e1]'}`}>
                                {cfg.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Order Cards */}
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-[#86948a]">
                        <span className="material-symbols-outlined text-6xl mb-4">receipt_long</span>
                        <p className="text-lg font-medium">Chưa có đơn nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredOrders.map(order => {
                            const cfg = statusConfig[order.status] || statusConfig['Pending'];
                            return (
                                <div key={order.id}
                                    className="bg-[#1c1b1b] rounded-2xl p-5 hover:bg-[#201f1f] transition-all duration-200 cursor-pointer group"
                                    onClick={() => navigate(`/cashier/orders/${order.id}`)}
                                >
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-[#e5e2e1] font-bold text-lg">#{String(order.id).padStart(4, '0')}</h3>
                                            <p className="text-xs text-[#86948a] mt-0.5">{formatTime(order.orderDate)}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full ${cfg.bg} ${cfg.color} text-[10px] font-bold uppercase tracking-wider flex items-center gap-1`}>
                                            <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Customer & Table */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-[#86948a]">
                                            <span className="material-symbols-outlined text-base">person</span>
                                            <span>{order.customerName || 'Khách lẻ'}</span>
                                        </div>
                                        {order.tableNumber > 0 && (
                                            <div className="flex items-center gap-2 text-sm text-[#86948a]">
                                                <span className="material-symbols-outlined text-base">table_restaurant</span>
                                                <span>Bàn {order.tableNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items Preview */}
                                    <div className="border-t border-[#3c4a42]/10 pt-3 mb-4">
                                        {(order.items || []).slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-[#86948a] py-1">
                                                <span className="truncate flex-1">{item.productName} x{item.quantity}</span>
                                                <span className="text-[#e5e2e1] font-medium ml-3">{fmt(item.subtotal)}</span>
                                            </div>
                                        ))}
                                        {(order.items || []).length > 3 && (
                                            <p className="text-[10px] text-[#86948a] mt-1">+{order.items.length - 3} sản phẩm khác...</p>
                                        )}
                                    </div>

                                    {/* Total & Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-[#3c4a42]/10">
                                        <span className="text-xl font-extrabold text-[#4edea3]">{fmt(order.totalAmount)}</span>
                                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                            {order.status === 'Ready' && (
                                                <button onClick={() => handleStatusChange(order.id, 'Served')}
                                                    className="px-3 py-1.5 rounded-lg bg-[#10b981]/20 text-[#4edea3] text-xs font-bold hover:bg-[#10b981]/30 transition-colors">
                                                    Phục vụ
                                                </button>
                                            )}
                                            {order.status === 'Served' && (
                                                <button onClick={() => handleStatusChange(order.id, 'Completed')}
                                                    className="px-3 py-1.5 rounded-lg bg-[#7c3aed]/20 text-[#a78bfa] text-xs font-bold hover:bg-[#7c3aed]/30 transition-colors">
                                                    Hoàn thành
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
