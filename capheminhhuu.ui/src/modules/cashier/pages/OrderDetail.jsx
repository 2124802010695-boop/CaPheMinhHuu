import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus, markAsPaid } from '../services/orderService';

const statusConfig = {
    'Pending':    { label: 'Chờ xử lý',   color: 'text-[#ffb95f]', bg: 'bg-[#e29100]/20', icon: 'schedule' },
    'Preparing':  { label: 'Đang pha',     color: 'text-[#60a5fa]', bg: 'bg-[#2563eb]/20', icon: 'blender' },
    'Ready':      { label: 'Sẵn sàng',     color: 'text-[#4edea3]', bg: 'bg-[#10b981]/20', icon: 'check_circle' },
    'Served':     { label: 'Đã phục vụ',   color: 'text-[#a78bfa]', bg: 'bg-[#7c3aed]/20', icon: 'room_service' },
    'Completed':  { label: 'Hoàn thành',   color: 'text-[#86948a]', bg: 'bg-[#3c4a42]/20', icon: 'task_alt' },
    'Cancelled':  { label: 'Đã hủy',       color: 'text-[#ffb4ab]', bg: 'bg-[#93000a]/20', icon: 'cancel' },
};

const statusFlow = ['Pending', 'Preparing', 'Ready', 'Served', 'Completed'];

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBill, setShowBill] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await getOrderById(id);
            setOrder(data);
        } catch (err) {
            console.error('Lỗi tải chi tiết đơn:', err);
        }
        setLoading(false);
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await updateOrderStatus(order.id, newStatus);
            fetchOrder();
        } catch (err) {
            alert('Lỗi: ' + (err?.response?.data?.message || err.message));
        }
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

    const formatDateTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="h-full bg-[#131313] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="h-full bg-[#131313] flex flex-col items-center justify-center text-[#86948a]">
                <span className="material-symbols-outlined text-6xl mb-4">error</span>
                <p className="text-lg font-medium mb-4">Không tìm thấy đơn hàng</p>
                <button onClick={() => navigate('/cashier/orders')}
                    className="px-5 py-2 rounded-xl bg-[#1c1b1b] text-[#e5e2e1] text-sm font-bold hover:bg-[#393939]">
                    ← Quay lại
                </button>
            </div>
        );
    }

    const cfg = statusConfig[order.status] || statusConfig['Pending'];
    const currentIdx = statusFlow.indexOf(order.status);
    const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;
    const nextCfg = nextStatus ? statusConfig[nextStatus] : null;

    return (
        <div className="h-full bg-[#131313] overflow-y-auto">
            <div className="p-8 max-w-[900px] mx-auto">

                {/* Back Button */}
                <button onClick={() => navigate('/cashier/orders')}
                    className="flex items-center gap-2 text-[#86948a] hover:text-[#e5e2e1] text-sm font-medium mb-6 transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Quay lại danh sách
                </button>

                {/* Order Header Card */}
                <div className="bg-[#1c1b1b] rounded-2xl p-6 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-extrabold text-[#e5e2e1]">Đơn #{String(order.id).padStart(4, '0')}</h2>
                            <p className="text-sm text-[#86948a] mt-1">{formatDateTime(order.orderDate)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {order.isPaid ? (
                                <span className="px-3 py-1.5 rounded-full bg-[#10b981]/20 text-[#4edea3] text-xs font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Đã thanh toán
                                </span>
                            ) : (
                                <span className="px-3 py-1.5 rounded-full bg-[#e29100]/20 text-[#ffb95f] text-xs font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">pending</span>
                                    Chưa thanh toán
                                </span>
                            )}
                            <span className={`px-4 py-2 rounded-full ${cfg.bg} ${cfg.color} text-xs font-bold uppercase tracking-wider flex items-center gap-2`}>
                                <span className="material-symbols-outlined text-base">{cfg.icon}</span>
                                {cfg.label}
                            </span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[#131313] rounded-xl p-4">
                            <p className="text-[10px] text-[#86948a] uppercase tracking-widest font-bold mb-1">Khách hàng</p>
                            <p className="text-sm text-[#e5e2e1] font-semibold">{order.customerName || 'Khách lẻ'}</p>
                        </div>
                        <div className="bg-[#131313] rounded-xl p-4">
                            <p className="text-[10px] text-[#86948a] uppercase tracking-widest font-bold mb-1">SĐT</p>
                            <p className="text-sm text-[#e5e2e1] font-semibold">{order.phone || 'N/A'}</p>
                        </div>
                        <div className="bg-[#131313] rounded-xl p-4">
                            <p className="text-[10px] text-[#86948a] uppercase tracking-widest font-bold mb-1">Bàn</p>
                            <p className="text-sm text-[#e5e2e1] font-semibold">{order.tableNumber > 0 ? `Bàn ${order.tableNumber}` : 'Mang đi'}</p>
                        </div>
                        <div className="bg-[#131313] rounded-xl p-4">
                            <p className="text-[10px] text-[#86948a] uppercase tracking-widest font-bold mb-1">Thanh toán</p>
                            <p className="text-sm text-[#e5e2e1] font-semibold">{order.paymentMethod}</p>
                        </div>
                    </div>
                </div>

                {/* Status Progress */}
                <div className="bg-[#1c1b1b] rounded-2xl p-6 mb-6">
                    <h3 className="text-sm font-bold text-[#e5e2e1] mb-4 uppercase tracking-wider">Tiến trình</h3>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {statusFlow.map((status, idx) => {
                            const sCfg = statusConfig[status];
                            const isActive = idx <= currentIdx;
                            const isCurrent = status === order.status;
                            return (
                                <React.Fragment key={status}>
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-bold ${isCurrent ? `${sCfg.bg} ${sCfg.color} ring-1 ring-current` : isActive ? 'text-[#4edea3] bg-[#10b981]/10' : 'text-[#86948a]/40 bg-[#131313]'}`}>
                                        <span className="material-symbols-outlined text-sm">{sCfg.icon}</span>
                                        {sCfg.label}
                                    </div>
                                    {idx < statusFlow.length - 1 && (
                                        <div className={`w-6 h-0.5 ${idx < currentIdx ? 'bg-[#4edea3]' : 'bg-[#3c4a42]/20'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-[#1c1b1b] rounded-2xl p-6 mb-6">
                    <h3 className="text-sm font-bold text-[#e5e2e1] mb-4 uppercase tracking-wider">Chi tiết đơn hàng</h3>
                    <div className="space-y-3">
                        {(order.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[#131313] rounded-xl">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-[#e5e2e1]">{item.productName}</p>
                                    <p className="text-xs text-[#86948a] mt-0.5">{fmt(item.priceAtOrder)} x {item.quantity}</p>
                                </div>
                                <span className="text-sm font-bold text-[#4edea3]">{fmt(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t border-[#3c4a42]/10 flex justify-between items-end">
                        <p className="text-[10px] text-[#86948a] uppercase tracking-widest font-bold">Tổng cộng</p>
                        <p className="text-3xl font-extrabold text-[#4edea3]">{fmt(order.totalAmount)}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap">
                    {nextStatus && order.status !== 'Cancelled' && (
                        <button onClick={() => handleStatusChange(nextStatus)}
                            className="flex-1 h-14 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform hover:brightness-110">
                            <span className="material-symbols-outlined">{nextCfg?.icon}</span>
                            Chuyển sang: {nextCfg?.label}
                        </button>
                    )}
                    <button onClick={() => setShowBill(true)}
                        className="px-6 h-14 rounded-xl bg-[#1c1b1b] border border-[#3c4a42]/20 text-[#e5e2e1] font-bold text-sm hover:bg-[#393939] transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">print</span>
                        In bill
                    </button>
                    {order.status === 'Pending' && (
                        <button onClick={() => handleStatusChange('Cancelled')}
                            className="px-6 h-14 rounded-xl bg-[#93000a]/20 text-[#ffb4ab] font-bold text-sm hover:bg-[#93000a]/30 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined">cancel</span>
                            Hủy đơn
                        </button>
                    )}
                </div>
            </div>
            {showBill && (
                <BillModal order={order} onClose={() => setShowBill(false)} />
            )}
        </div>
    );
}

function BillModal({ order, onClose }) {
    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

    const handlePrint = () => {
        const printContent = document.getElementById('bill-print-area-detail');
        const win = window.open('', '_blank', 'width=400,height=600');
        win.document.write(`
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Bill - ${order.orderCode}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 8px; }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .line { border-top: 1px dashed #000; margin: 6px 0; }
                    .row { display: flex; justify-content: space-between; margin: 2px 0; }
                    .indent { padding-left: 12px; color: #555; }
                    .total { font-size: 14px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 8px; font-size: 11px; }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-[400px] max-h-[90vh] overflow-y-auto text-black flex flex-col">
                <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Xem trước hóa đơn</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div id="bill-print-area-detail" className="px-6 py-4 font-mono text-xs flex-1">
                    <div className="center bold" style={{fontSize: 14}}>CÀ PHÊ MINH HỮU</div>
                    <div className="center" style={{color:'#555'}}>Phú Hòa, Thủ Dầu Một, Bình Dương</div>
                    <div className="center" style={{color:'#555'}}>Hotline: 0357 058 801</div>
                    <div className="line" />
                    <div className="row"><span>Bill:</span><span className="bold">{order.orderCode}</span></div>
                    <div className="row"><span>Ngày:</span><span>{new Date(order.orderDate).toLocaleString('vi-VN')}</span></div>
                    <div className="row"><span>Thu ngân:</span><span>{order.cashierName || 'N/A'}</span></div>
                    <div className="row"><span>Bàn:</span><span>{order.tableName ? `Bàn ${order.tableName}` : 'Mang đi'}</span></div>
                    <div className="line" />
                    {(order.items || []).map((item, idx) => (
                        <div key={idx} style={{marginBottom: 6}}>
                            <div className="row bold">
                                <span>{item.productName}{item.sizeLabel ? ` (${item.sizeLabel})` : ''} ×{item.quantity}</span>
                                <span>{fmt((item.priceAtOrder + (item.sizeExtraPrice ?? 0)) * item.quantity)}</span>
                            </div>
                            {(item.toppings || []).map((t, ti) => (
                                <div key={ti} className="row indent">
                                    <span>+ {t.toppingName} ×{t.quantity}</span>
                                    <span>{fmt(t.lineTotal)}</span>
                                </div>
                            ))}
                            {item.note && <div className="indent" style={{color:'#888'}}>📝 {item.note}</div>}
                        </div>
                    ))}
                    <div className="line" />
                    <div className="row total">
                        <span>TỔNG CỘNG</span>
                        <span>{fmt(order.totalAmount)}</span>
                    </div>
                    <div className="row" style={{color:'#555', marginTop:2}}>
                        <span>Phương thức:</span>
                        <span>{order.paymentMethod}</span>
                    </div>
                    <div className="line" />
                    <div className="footer">Cảm ơn quý khách! Hẹn gặp lại ☕</div>
                </div>
                <div className="flex gap-2 p-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">
                        Đóng
                    </button>
                    <button onClick={handlePrint}
                        className="flex-1 py-2.5 rounded-xl bg-[#10b981] text-white text-sm font-bold hover:brightness-110 flex items-center justify-center gap-2">
                        <span>🖨️</span> In bill
                    </button>
                </div>
            </div>
        </div>
    );
}