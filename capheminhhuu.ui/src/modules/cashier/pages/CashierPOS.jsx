import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsAPI } from '../../admin/services/productService';
import { getCategoriesAPI } from '../../admin/services/categoryService';
import { createOrder } from '../services/orderService';
import { getTablesAPI } from '../services/tableService';
import { startConnection, onOrderStatusUpdated, stopConnection } from '../../../common/utils/signalRConnection';

// Icon helper cho danh mục
const getCategoryIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('cà phê') || n.includes('cafe') || n.includes('coffee')) return 'coffee';
    if (n.includes('trà sữa')) return 'bubble_chart';
    if (n.includes('trà') || n.includes('tea')) return 'emoji_food_beverage';
    if (n.includes('cơm') || n.includes('văn phòng')) return 'restaurant';
    if (n.includes('trái cây') || n.includes('fruit')) return 'nutrition';
    if (n.includes('nhanh') || n.includes('fast')) return 'fastfood';
    if (n.includes('ăn') || n.includes('food')) return 'lunch_dining';
    if (n.includes('sinh tố') || n.includes('smoothie')) return 'blender';
    if (n.includes('bánh') || n.includes('cake')) return 'cake';
    return 'local_cafe';
};

export default function CashierPOS() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tables, setTables] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [customerName, setCustomerName] = useState('Khách lẻ');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        clearTimeout(window.toastTimer);
        window.toastTimer = setTimeout(() => setToast(null), 2500);
    };

    useEffect(() => {
        loadData();
    }, []);

    // SignalR — lắng nghe trạng thái đơn
    useEffect(() => {
        const connectSignalR = async () => {
            try {
                await startConnection();
                onOrderStatusUpdated((orderId, status) => {
                    if (status === 'Ready') {
                        showToast(`Đơn #${orderId} đã sẵn sàng phục vụ! 🍵`, 'info');
                        loadData();
                    }
                    if (status === 'Completed' || status === 'Cancelled') {
                        loadData();
                    }
                });
            } catch (err) {
                console.error('SignalR lỗi:', err);
            }
        };
        connectSignalR();
        return () => { stopConnection(); };
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, tableRes] = await Promise.all([
                getProductsAPI(),
                getCategoriesAPI(),
                getTablesAPI()
            ]);
            setProducts(Array.isArray(prodRes) ? prodRes : []);
            setCategories(Array.isArray(catRes) ? catRes : []);
            setTables(Array.isArray(tableRes) ? tableRes : []);
        } catch (err) {
            console.error('Lỗi tải dữ liệu POS:', err);
        }
        setLoading(false);
    };

    const filteredProducts = useMemo(() => {
        let list = products;
        if (activeCategory !== 'all') {
            list = list.filter(p => p.categoryId === activeCategory);
        }
        if (searchTerm) {
            list = list.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return list;
    }, [products, activeCategory, searchTerm]);

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
            await createOrder(dto);
            await loadData();
            showToast('Tạo đơn thành công!', 'success');
            clearCart();
            setCustomerName('Khách lẻ');
            setCustomerPhone('');
            setSelectedTable(null);
        } catch (err) {
            console.error('Lỗi tạo đơn:', err);
            showToast(
                err?.response?.data?.message || err.message || 'Lỗi tạo đơn!',
                'error'
            );
        }
        setSubmitting(false);
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

    if (loading) {
        return (
            <div className="h-full bg-[#131313] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#131313]">

            {/* ===== TOAST ===== */}
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

            {/* ===== SEARCH BAR — full width trên cùng ===== */}
            <div className="flex-shrink-0 px-4 py-2.5 border-b border-[#3c4a42]/10 bg-[#131313]">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a] text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1c1b1b] text-[#e5e2e1] border border-[#3c4a42]/20 focus:border-[#10b981] focus:outline-none transition-colors placeholder:text-[#86948a] text-sm"
                    />
                </div>
            </div>

            {/* ===== 3 CỘT CHÍNH ===== */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* CATEGORY SIDEBAR */}
                <aside className="w-24 flex-shrink-0 bg-[#1c1b1b] border-r border-[#3c4a42]/10 flex flex-col overflow-y-auto">
                    <p className="text-[9px] uppercase tracking-widest text-[#86948a] font-bold px-2 pt-3 pb-1 text-center">Danh mục</p>
                    <nav className="flex-1 px-2 pb-4 space-y-1">
                        {/* Tất cả */}
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`w-full flex flex-col items-center gap-1 px-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all ${
                                activeCategory === 'all'
                                    ? 'bg-[#4edea3] text-[#003824]'
                                    : 'text-[#86948a] hover:text-[#e5e2e1] hover:bg-[#393939]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-xl">apps</span>
                            <span className="text-center leading-tight">Tất cả</span>
                        </button>
                        {/* Danh mục */}
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full flex flex-col items-center gap-1 px-1 py-2.5 rounded-xl text-[11px] font-semibold transition-all ${
                                    activeCategory === cat.id
                                        ? 'bg-[#4edea3] text-[#003824]'
                                        : 'text-[#86948a] hover:text-[#e5e2e1] hover:bg-[#393939]'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">{getCategoryIcon(cat.name)}</span>
                                <span className="text-center leading-tight line-clamp-2">{cat.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* PRODUCT GRID */}
                <section className="flex-1 min-w-0 overflow-y-auto bg-[#131313]">
                    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 p-3 content-start">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className={`bg-[#1c1b1b] rounded-2xl overflow-hidden cursor-pointer group hover:ring-1 ring-[#10b981]/30 transition-all duration-200 active:scale-[0.97] relative ${!product.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {/* Ảnh + overlay gradient */}
                                <div className="h-32 overflow-hidden relative bg-[#2a2a2a]">
                                    {product.imageUrl ? (
                                        <img
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            src={product.imageUrl}
                                            alt={product.name}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl text-[#86948a]">coffee</span>
                                        </div>
                                    )}
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                                    {/* Tên + Giá đè lên ảnh */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                                        <p className="text-white font-bold text-sm leading-tight line-clamp-2">{product.name}</p>
                                        <p className="text-[#4edea3] font-extrabold text-sm mt-0.5">{fmt(product.price)}</p>
                                    </div>
                                    {/* Add icon */}
                                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-base">add</span>
                                    </div>
                                    {/* Hết hàng */}
                                    {!product.isActive && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-xs font-bold">Hết hàng</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#86948a]">
                                <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
                                <p className="font-medium">Không tìm thấy sản phẩm</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* CART PANEL */}
                <section className="w-72 flex-shrink-0 bg-[#1c1b1b] border-l border-[#3c4a42]/10 flex flex-col min-h-0 overflow-hidden">

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
                                <option key={t.id} value={t.id}>Bàn {t.number} — {t.areaName || 'Khu vực chung'} ({t.seats} chỗ)</option>
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
                                    {/* Note */}
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
            </div>
        </div>
    );
}