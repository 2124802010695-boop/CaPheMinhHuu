import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { createOrder } from '../services/orderService';

const CartPanel = forwardRef(function CartPanel({ tables, onOrderCreated, onPaymentRequired }, ref) {
    const [cart, setCart] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [customerName, setCustomerName] = useState('Khách lẻ');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        clearTimeout(window._cartToastTimer);
        window._cartToastTimer = setTimeout(() => setToast(null), 2500);
    };

    const addToCart = (product) => {
        if (!product.isActive) return;
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1,
                imageUrl: product.imageUrl,
                note: ''
            }];
        });
    };

    useImperativeHandle(ref, () => ({ addToCart }));

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const updateNote = (productId, note) => {
        setCart(prev => prev.map(item =>
            item.productId === productId ? { ...item, note } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

    const handleSubmitOrder = async () => {
        if (cart.length === 0) {
            showToast('Chưa có sản phẩm trong đơn!', 'error');
            return;
        }
        setSubmitting(true);
        try {
            const dto = {
                customerName: customerName || 'Khách lẻ',
                phone: customerPhone || 'N/A',
                paymentMethod,
                tableId: selectedTable?.id || null,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    note: item.note || null
                }))
            };
            const order = await createOrder(dto);
            onOrderCreated();
            showToast('Tạo đơn thành công!', 'success');
            onPaymentRequired(order, paymentMethod, () => {
                clearCart();
                setCustomerName('Khách lẻ');
                setCustomerPhone('');
                setSelectedTable(null);
            });
        } catch (err) {
            console.error('Lỗi tạo đơn:', err);
            showToast(
                err?.response?.data?.message || err.message || 'Lỗi tạo đơn!',
                'error'
            );
        }
        setSubmitting(false);
    };

    return (
        <section className="w-72 flex-shrink-0 bg-[#1c1b1b] border-l border-[#3c4a42]/10 flex flex-col min-h-0 overflow-hidden">

            {/* Toast */}
            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <div className={`px-5 py-3 rounded-xl shadow-2xl text-white font-semibold min-w-[260px] ${
                        toast.type === 'success' ? 'bg-emerald-500'
                        : toast.type === 'error' ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}>
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Cart Header */}
            <div className="p-3 border-b border-[#3c4a42]/10 flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-base font-bold text-[#e5e2e1]">Đơn hiện tại</h2>
                    <p className="text-[10px] text-[#86948a]">
                        {selectedTable ? `Bàn ${selectedTable.number} • Tại quán` : 'Chưa chọn bàn • Mang đi'}
                    </p>
                </div>
                {cart.length > 0 && (
                    <button onClick={clearCart} className="text-[#86948a] hover:text-red-400 transition-colors">
                        <span className="material-symbols-outlined text-xl">delete_sweep</span>
                    </button>
                )}
            </div>

            {/* Table Selector */}
            <div className="px-3 py-2 border-b border-[#3c4a42]/10 flex-shrink-0">
                <select
                    value={selectedTable?.id || ''}
                    onChange={(e) => {
                        const t = tables.find(t => t.id === parseInt(e.target.value));
                        setSelectedTable(t || null);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#131313] text-[#e5e2e1] border border-[#3c4a42]/20 text-sm focus:border-[#10b981] focus:outline-none"
                >
                    <option value="">Mang đi (Không chọn bàn)</option>
                    {tables.filter(t => t.status === 'Empty').map(t => (
                        <option key={t.id} value={t.id}>
                            Bàn {t.number} — {t.areaName || 'Khu vực chung'} ({t.seats} chỗ)
                        </option>
                    ))}
                </select>
            </div>

            {/* Cart Items */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#86948a]">
                        <span className="material-symbols-outlined text-5xl mb-3">shopping_cart</span>
                        <p className="text-sm">Chọn sản phẩm để bắt đầu</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.productId} className="p-2.5 bg-[#131313] rounded-xl flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#2a2a2a] flex-shrink-0">
                                    {item.imageUrl ? (
                                        <img className="w-full h-full object-cover" src={item.imageUrl} alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#86948a] text-base">coffee</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-[#e5e2e1] truncate">{item.productName}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <button onClick={() => updateQuantity(item.productId, -1)}
                                            className="w-5 h-5 flex items-center justify-center rounded bg-[#2a2a2a] text-[#86948a] hover:bg-[#393939]">
                                            <span className="material-symbols-outlined text-xs">remove</span>
                                        </button>
                                        <span className="text-xs font-bold text-[#e5e2e1] px-1 min-w-[16px] text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)}
                                            className="w-5 h-5 flex items-center justify-center rounded bg-[#2a2a2a] text-[#86948a] hover:bg-[#393939]">
                                            <span className="material-symbols-outlined text-xs">add</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-bold text-[#4edea3]">{fmt(item.price * item.quantity)}</p>
                                    <button onClick={() => removeFromCart(item.productId)}
                                        className="mt-1 text-[#86948a]/30 hover:text-red-400 transition-colors">
                                        <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Ghi chú món..."
                                value={item.note || ''}
                                onChange={(e) => updateNote(item.productId, e.target.value)}
                                className="w-full py-1 px-2 rounded-lg bg-[#2a2a2a] text-[#86948a] text-[11px] border border-[#3c4a42]/20 focus:border-[#10b981] focus:outline-none placeholder:text-[#86948a]/50"
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Customer Info */}
            {cart.length > 0 && (
                <div className="px-3 py-2 border-t border-[#3c4a42]/10 space-y-1.5 flex-shrink-0">
                    <input
                        type="text" placeholder="Tên khách"
                        value={customerName} onChange={e => setCustomerName(e.target.value)}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#131313] text-[#e5e2e1] border border-[#3c4a42]/20 text-xs focus:border-[#10b981] focus:outline-none"
                    />
                    <div className="flex gap-1.5">
                        <input
                            type="text" placeholder="SĐT khách"
                            value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                            className="flex-1 min-w-0 py-1.5 px-3 rounded-lg bg-[#131313] text-[#e5e2e1] border border-[#3c4a42]/20 text-xs focus:border-[#10b981] focus:outline-none"
                        />
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                            className="py-1.5 px-2 rounded-lg bg-[#131313] text-[#e5e2e1] border border-[#3c4a42]/20 text-xs focus:border-[#10b981] focus:outline-none flex-shrink-0">
                            <option value="Cash">Tiền mặt</option>
                            <option value="Transfer">CK</option>
                            <option value="Card">Thẻ</option>
                            <option value="VNPay">VNPAY</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Summary & Submit */}
            <div className="p-3 bg-[#201f1f] border-t border-[#3c4a42]/10 space-y-3 flex-shrink-0">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[9px] text-[#86948a] uppercase tracking-widest font-bold">Tổng cộng</p>
                        <p className="text-2xl font-extrabold text-[#4edea3]">{fmt(subtotal)}</p>
                    </div>
                    <div className="text-[10px] text-[#86948a]">{totalItems} món</div>
                </div>
                <button
                    onClick={handleSubmitOrder}
                    disabled={cart.length === 0 || submitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                    {submitting ? 'Đang xử lý...' : 'TẠO ĐƠN HÀNG'}
                </button>
            </div>
        </section>
    );
});

export default CartPanel;
