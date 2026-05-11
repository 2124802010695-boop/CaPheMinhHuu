import React, { useState, useEffect, useRef } from 'react';
import { getTodayOrders, markAsPaid } from '../services/orderService';
import { onConnectionReady, onReceiveNewOrder, onOrderStatusUpdated, onOrderPaid } from '../../../common/utils/signalRConnection';

const statusConfig = {
    'Pending':   { label: 'Chờ xử lý',  color: 'text-[#ffb95f]', bg: 'bg-[#e29100]/20', icon: 'schedule' },
    'Preparing': { label: 'Đang pha',    color: 'text-[#60a5fa]', bg: 'bg-[#2563eb]/20', icon: 'blender' },
    'Ready':     { label: 'Sẵn sàng',   color: 'text-[#4edea3]', bg: 'bg-[#10b981]/20', icon: 'check_circle' },
    'Served':    { label: 'Đã phục vụ', color: 'text-[#a78bfa]', bg: 'bg-[#7c3aed]/20', icon: 'room_service' },
};

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

export default function PaymentPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cashReceived, setCashReceived] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [showBill, setShowBill] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const timerRef = useRef(null);

    const ACTIVE_STATUSES = ['Pending', 'Preparing', 'Ready', 'Served'];

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let offStatus = () => {};
        let offNew = () => {};
        let offPaid = () => {};

        const cleanup = onConnectionReady(() => {
            const debouncedFetch = () => {
                clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => fetchOrders(), 500);
            };
            offStatus = onOrderStatusUpdated(debouncedFetch) || (() => {});
            offNew = onReceiveNewOrder(debouncedFetch) || (() => {});
            offPaid = onOrderPaid(debouncedFetch) || (() => {});
        });

        return () => {
            clearTimeout(timerRef.current);
            offStatus();
            offNew();
            offPaid();
            cleanup();
        };
    }, []);


    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getTodayOrders();
            const active = (Array.isArray(data) ? data : [])
                .filter(o => ACTIVE_STATUSES.includes(o.status));
            setOrders(active);
            if (selectedOrder) {
                const updated = active.find(o => o.id === selectedOrder.id);
                if (updated) setSelectedOrder(updated);
            }
        } catch (err) {
            console.error('Lỗi tải đơn:', err);
        }
        setLoading(false);
    };

    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
        setCashReceived('');
        setError(null);
        setSelectedPaymentMethod(order.paymentMethod);
    };

    const handleConfirmPayment = async () => {
        if (!selectedOrder || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            await markAsPaid(selectedOrder.id);
            setShowBill(true);
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
        setSubmitting(false);
    };

    const cashValue = Number(cashReceived) || 0;
    const changeAmount = cashValue - (selectedOrder?.totalAmount || 0);

    const canConfirm = selectedOrder && !selectedOrder.isPaid && !submitting && selectedPaymentMethod && (
        selectedPaymentMethod !== 'Cash' || changeAmount >= 0
    );

    return (
        <div className="h-full bg-[#131313] flex overflow-hidden">

            {/* LEFT — Order List */}
            <div className="w-[340px] border-r border-[#3c4a42]/20 flex flex-col">
                <div className="p-4 border-b border-[#3c4a42]/20">
                    <h2 className="text-lg font-bold text-[#e5e2e1]">Đơn chờ thanh toán</h2>
                    <p className="text-xs text-[#86948a] mt-0.5">{orders.length} đơn đang hoạt động</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading ? (
                        <div className="flex justify-center pt-12">
                            <div className="w-8 h-8 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-16 text-[#86948a]">
                            <span className="material-symbols-outlined text-5xl mb-2">receipt_long</span>
                            <p className="text-sm">Không có đơn nào</p>
                        </div>
                    ) : orders.map(order => {
                        const cfg = statusConfig[order.status] || statusConfig['Pending'];
                        const isSelected = selectedOrder?.id === order.id;
                        return (
                            <div key={order.id}
                                onClick={() => handleSelectOrder(order)}
                                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                                    isSelected
                                        ? 'bg-[#1c2e24] border-[#10b981]/40'
                                        : 'bg-[#1c1b1b] border-transparent hover:border-[#3c4a42]/40'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[#e5e2e1] font-bold text-sm">{order.orderCode}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cfg.bg} ${cfg.color}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#86948a]">
                                        {order.tableName ? `Bàn ${order.tableName}` : 'Mang đi'} • {order.customerName || 'Khách lẻ'}
                                    </span>
                                    <span className="text-sm font-extrabold text-[#4edea3]">{fmt(order.totalAmount)}</span>
                                </div>
                                {order.isPaid && (
                                    <div className="mt-1 text-[10px] text-[#10b981] font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">check_circle</span>
                                        Đã thanh toán
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT — Detail + Payment */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {!selectedOrder ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#86948a]">
                        <span className="material-symbols-outlined text-7xl mb-4">point_of_sale</span>
                        <p className="text-lg font-medium">Chọn đơn để thanh toán</p>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">

                        {/* Order Summary */}
                        <div className="flex-1 overflow-y-auto p-6 border-r border-[#3c4a42]/20">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-[#e5e2e1]">{selectedOrder.orderCode}</h3>
                                <p className="text-sm text-[#86948a] mt-0.5">
                                    {selectedOrder.tableName ? `Bàn ${selectedOrder.tableName}` : 'Mang đi'} •
                                    {selectedOrder.customerName || ' Khách lẻ'} •
                                    {selectedOrder.cashierName}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {(selectedOrder.items || []).map((item, idx) => (
                                    <div key={idx} className="bg-[#1c1b1b] rounded-xl p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <span className="text-[#e5e2e1] font-semibold text-sm">
                                                    {item.productName}
                                                    {item.sizeLabel ? ` (${item.sizeLabel})` : ''}
                                                    {' '}×{item.quantity}
                                                </span>
                                                <div className="flex gap-2 mt-0.5 flex-wrap">
                                                    {item.sugarLevel && item.sugarLevel !== '100' && (
                                                        <span className="text-[10px] text-[#86948a]">Đường {item.sugarLevel}%</span>
                                                    )}
                                                    {item.iceLevel && item.iceLevel !== '100' && (
                                                        <span className="text-[10px] text-[#86948a]">Đá {item.iceLevel}%</span>
                                                    )}
                                                    {item.note && (
                                                        <span className="text-[10px] text-[#86948a]">📝 {item.note}</span>
                                                    )}
                                                </div>
                                                {(item.toppings || []).map((t, ti) => (
                                                    <div key={ti} className="text-[10px] text-[#86948a] mt-0.5">
                                                        + {t.toppingName} ×{t.quantity} {fmt(t.lineTotal)}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[#4edea3] font-bold text-sm ml-3">
                                                {fmt(item.subtotalFull ?? (item.priceAtOrder + item.sizeExtraPrice) * item.quantity + item.toppingTotal)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-[#3c4a42]/20 flex justify-between items-center">
                                <span className="text-[#86948a] font-bold">TỔNG CỘNG</span>
                                <span className="text-2xl font-extrabold text-[#10b981]">{fmt(selectedOrder.totalAmount)}</span>
                            </div>
                        </div>

                        {/* Payment Panel */}
                        <div className="w-[320px] flex flex-col p-5 gap-4 overflow-y-auto">

                            <div className="space-y-2">
                                <div className="text-xs text-[#86948a] uppercase tracking-wider font-bold">Phương thức thanh toán</div>
                                <div className="flex flex-wrap gap-2">
                                    {['Cash', 'Transfer', 'Card'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => {
                                                setSelectedPaymentMethod(method);
                                                setCashReceived('');
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                selectedPaymentMethod === method
                                                    ? 'bg-[#10b981] text-white'
                                                    : 'bg-[#1c1b1b] border border-[#3c4a42]/20 text-[#86948a] hover:text-[#e5e2e1]'
                                            }`}
                                        >
                                            {method === 'Cash' ? '💵 Tiền mặt' :
                                             method === 'Transfer' ? '🏦 Chuyển khoản' : '💳 Thẻ'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedOrder.isPaid ? (
                                <div className="flex flex-col items-center justify-center py-8 gap-3">
                                    <span className="material-symbols-outlined text-5xl text-[#10b981]">check_circle</span>
                                    <p className="text-[#10b981] font-bold text-lg">Đã thanh toán</p>
                                    <button
                                        onClick={() => setShowBill(true)}
                                        className="px-4 py-2 rounded-xl bg-[#1c1b1b] border border-[#3c4a42]/20 text-[#e5e2e1] text-sm font-bold hover:bg-[#393939] transition-colors"
                                    >
                                        In lại bill
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {selectedPaymentMethod === 'Cash' && (
                                        <div className="space-y-3">
                                            <label className="text-xs text-[#86948a]">Tiền khách đưa</label>
                                            <input
                                                type="number"
                                                placeholder="Nhập số tiền..."
                                                value={cashReceived}
                                                onChange={e => setCashReceived(e.target.value)}
                                                className="w-full py-2.5 px-3 rounded-xl bg-[#1c1b1b] text-[#e5e2e1] border border-[#3c4a42]/20 focus:border-[#10b981] focus:outline-none font-bold text-lg"
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {QUICK_AMOUNTS.map(amt => (
                                                    <button key={amt}
                                                        onClick={() => setCashReceived(String(amt))}
                                                        className="px-3 py-1.5 rounded-lg bg-[#1c1b1b] border border-[#3c4a42]/20 text-[#e5e2e1] text-xs font-bold hover:bg-[#393939] transition-colors"
                                                    >
                                                        {fmt(amt)}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setCashReceived(String(selectedOrder.totalAmount))}
                                                    className="px-3 py-1.5 rounded-lg bg-[#10b981]/20 border border-[#10b981]/30 text-[#4edea3] text-xs font-bold hover:bg-[#10b981]/30 transition-colors"
                                                >
                                                    Đúng tiền
                                                </button>
                                            </div>
                                            {cashReceived !== '' && (
                                                <div className="flex justify-between items-center p-3 rounded-xl bg-[#1c1b1b] border border-[#3c4a42]/10">
                                                    <span className="text-sm text-[#86948a]">Tiền thừa:</span>
                                                    <span className={`text-lg font-bold ${changeAmount >= 0 ? 'text-[#4edea3]' : 'text-red-400'}`}>
                                                        {fmt(changeAmount)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedPaymentMethod === 'Transfer' && (
                                        <div className="flex flex-col items-center gap-3 py-2">
                                            <img
                                                src={`https://img.vietqr.io/image/970436-1014907466-compact2.png?amount=${Math.round(selectedOrder.totalAmount)}&addInfo=${encodeURIComponent(selectedOrder.orderCode)}&accountName=${encodeURIComponent('NGUYEN HUU HANH')}`}
                                                alt="QR chuyển khoản"
                                                className="w-48 h-48 rounded-xl border border-[#3c4a42]/20 cursor-zoom-in hover:opacity-90 transition-opacity"
                                                onClick={() => setShowQR(true)}
                                                title="Bấm để phóng to"
                                            />
                                            <div className="text-center text-xs text-[#86948a] space-y-0.5">
                                                <p className="font-bold text-[#e5e2e1]">NGUYEN HUU HANH</p>
                                                <p>Vietcombank — 1014907466</p>
                                                <p className="text-[#4edea3] font-bold">{new Intl.NumberFormat('vi-VN').format(selectedOrder.totalAmount)}đ</p>
                                                <p className="text-[10px]">Nội dung: {selectedOrder.orderCode}</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedPaymentMethod === 'Card' && (
                                        <div className="flex flex-col items-center justify-center py-6 text-[#86948a]">
                                            <span className="material-symbols-outlined text-5xl mb-2 text-[#4edea3]">credit_card</span>
                                            <p className="text-center text-sm font-medium">Xác nhận sau khi khách quẹt thẻ qua máy POS</p>
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-red-400 text-sm text-center">{error}</p>
                                    )}

                                    <div className="flex gap-2 mt-auto">
                                        <button
                                            onClick={() => setShowBill(true)}
                                            disabled={!selectedOrder}
                                            className="px-4 py-3 rounded-xl bg-[#1c1b1b] border border-[#3c4a42]/20 text-[#e5e2e1] font-bold text-sm hover:bg-[#393939] transition-colors disabled:opacity-40 flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">print</span>
                                            In bill
                                        </button>
                                        <button
                                            onClick={handleConfirmPayment}
                                            disabled={!canConfirm}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐÃ THANH TOÁN'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bill Print Modal */}
            {showQR && selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out"
                    onClick={() => setShowQR(false)}
                >
                    <div className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
                        <img
                            src={`https://img.vietqr.io/image/970436-1014907466-qr_only.png?amount=${Math.round(selectedOrder.totalAmount)}&addInfo=${encodeURIComponent(selectedOrder.orderCode)}&accountName=${encodeURIComponent('NGUYEN HUU HANH')}`}
                            alt="QR chuyển khoản"
                            className="w-72 h-72 rounded-2xl bg-white p-3"
                        />
                        <div className="text-center text-white space-y-1">
                            <p className="font-bold text-lg">NGUYEN HUU HANH</p>
                            <p className="text-gray-300 text-sm">Vietcombank — 1014907466</p>
                            <p className="text-[#4edea3] font-extrabold text-xl">{new Intl.NumberFormat('vi-VN').format(selectedOrder.totalAmount)}đ</p>
                            <p className="text-gray-400 text-xs">Nội dung: {selectedOrder.orderCode}</p>
                        </div>
                        <button
                            onClick={() => setShowQR(false)}
                            className="px-6 py-2 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {showBill && selectedOrder && (
                <BillModal order={selectedOrder} onClose={() => setShowBill(false)} />
            )}
        </div>
    );
}

function BillModal({ order, onClose }) {
    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

    const handlePrint = () => {
        const printContent = document.getElementById('bill-print-area');
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

                {/* Header modal */}
                <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Xem trước hóa đơn</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Bill content */}
                <div id="bill-print-area" className="px-6 py-4 font-mono text-xs flex-1">
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

                {/* Actions */}
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
