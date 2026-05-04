import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsAPI } from '../../admin/services/productService';
import { getCategoriesAPI } from '../../admin/services/categoryService';
import { createOrder } from '../services/orderService';
import { getTablesAPI } from '../services/tableService';

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

    window.toastTimer = setTimeout(() => {
        setToast(null);
    }, 2500);
};


    useEffect(() => {
        loadData();
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
                imageUrl: product.imageUrl
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
            tableNumber: selectedTable?.number || 0,
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        };

        await createOrder(dto);

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
        <div className="flex h-full overflow-hidden bg-[#131313]">
 {toast && (
            <div className="fixed top-5 right-5 z-50">
                <div
                    className={`px-5 py-3 rounded-xl shadow-2xl text-white font-semibold min-w-[260px]
                    ${
                        toast.type === 'success'
                            ? 'bg-emerald-500'
                            : 'bg-red-500'
                    }`}
                >
                    {toast.message}
                </div>
            </div>
        )}
            {/* ===== PRODUCT GRID (LEFT 65%) ===== */}
            {/* FIX 3: Thêm min-h-0 vào section để overflow-y-auto hoạt động */}
            <section className="flex-1 min-w-0 flex flex-col p-6 bg-[#131313] overflow-hidden min-h-0">

                {/* Search Bar */}
                <div className="relative mb-4 flex-shrink-0">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#86948a]">search</span>
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1c1b1b] text-[#e5e2e1] border border-[#3c4a42]/20 focus:border-[#10b981] focus:outline-none transition-colors placeholder:text-[#86948a]"
                    />
                </div>

                {/* Category Tabs */}
                {/* FIX 4: flex-shrink-0 để tabs không bị co lại */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 flex-shrink-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#3c4a42]">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex-shrink-0 ${activeCategory === 'all' ? 'bg-[#4edea3] text-[#003824]' : 'text-[#86948a] hover:text-[#e5e2e1] bg-[#1c1b1b]'}`}
                    >
                        Tất cả
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap flex-shrink-0 ${activeCategory === cat.id ? 'bg-[#4edea3] text-[#003824]' : 'text-[#86948a] hover:text-[#e5e2e1] bg-[#1c1b1b]'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                {/* FIX 5: flex-1 min-h-0 để grid scroll được trong flex container */}
                <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 overflow-y-auto flex-1 min-h-0 pr-1 pb-2 content-start">
                    {filteredProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className={`bg-[#1c1b1b] rounded-2xl overflow-hidden cursor-pointer group hover:ring-1 ring-[#10b981]/30 transition-all duration-200 active:scale-[0.97] flex flex-col h-fit ${!product.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className="h-28 overflow-hidden relative bg-[#2a2a2a] flex-shrink-0">
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
                                {!product.isActive && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-xs font-bold">Hết hàng</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 flex flex-col">
                                <h3 className="text-[#e5e2e1] font-semibold text-sm mb-2 truncate">{product.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#4edea3] font-bold text-sm">{fmt(product.price)}</span>
                                    <span className="material-symbols-outlined text-[#86948a] group-hover:text-[#4edea3] transition-colors text-lg">add_circle</span>
                                </div>
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

            {/* ===== CART PANEL (RIGHT — fixed width) ===== */}
            {/* FIX 6: Dùng w-80 xl:w-96 thay vì w-[35%] để ổn định hơn, thêm min-h-0 */}
            <section className="w-80 xl:w-96 flex-shrink-0 bg-[#1c1b1b] border-l border-[#3c4a42]/10 flex flex-col min-h-0 overflow-hidden">

                {/* Cart Header */}
                <div className="p-5 border-b border-[#3c4a42]/10 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-[#e5e2e1]">Đơn hiện tại</h2>
                        <p className="text-xs text-[#86948a]">
                            {selectedTable ? `Bàn ${selectedTable.number} • Tại quán` : 'Chưa chọn bàn • Mang đi'}
                        </p>
                    </div>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-[#86948a] hover:text-red-400 transition-colors">
                            <span className="material-symbols-outlined">delete_sweep</span>
                        </button>
                    )}
                </div>

                {/* Table Selector */}
                <div className="px-5 py-3 border-b border-[#3c4a42]/10 flex-shrink-0">
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
                            <option key={t.id} value={t.id}>Bàn {t.number} — {t.area} ({t.seats} chỗ)</option>
                        ))}
                    </select>
                </div>

                {/* Cart Items — FIX 7: flex-1 min-h-0 để scroll đúng */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-[#86948a]">
                            <span className="material-symbols-outlined text-5xl mb-3">shopping_cart</span>
                            <p className="text-sm">Chọn sản phẩm để bắt đầu</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="p-3 bg-[#131313] rounded-xl flex items-center gap-3">
                                <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#2a2a2a] flex-shrink-0">
                                    {item.imageUrl ? (
                                        <img className="w-full h-full object-cover" src={item.imageUrl} alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#86948a] text-base">coffee</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#e5e2e1] truncate">{item.productName}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <button onClick={() => updateQuantity(item.productId, -1)}
                                            className="w-6 h-6 flex items-center justify-center rounded bg-[#2a2a2a] text-[#86948a] hover:bg-[#393939]">
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-sm font-bold text-[#e5e2e1] px-1 min-w-[20px] text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)}
                                            className="w-6 h-6 flex items-center justify-center rounded bg-[#2a2a2a] text-[#86948a] hover:bg-[#393939]">
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-[#4edea3]">{fmt(item.price * item.quantity)}</p>
                                    <button onClick={() => removeFromCart(item.productId)} className="mt-1 text-[#86948a]/30 hover:text-red-400 transition-colors">
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Customer Info */}
                {cart.length > 0 && (
                    <div className="px-5 py-3 border-t border-[#3c4a42]/10 space-y-2 flex-shrink-0">
                        <input
                            type="text" placeholder="Tên khách (mặc định: Khách lẻ)"
                            value={customerName} onChange={e => setCustomerName(e.target.value)}
                            className="w-full py-2 px-3 rounded-lg bg-[#131313] text-[#e5e2e1] border border-[#3c4a42]/20 text-sm focus:border-[#10b981] focus:outline-none"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text" placeholder="SĐT khách"
                                value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                                className="flex-1 min-w-0 py-2 px-3 rounded-lg bg-[#131313] text-[#e5e2e1] border border-[#3c4a42]/20 text-sm focus:border-[#10b981] focus:outline-none"
                            />
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                                className="py-2 px-3 rounded-lg bg-[#131313] text-[#e5e2e1] border border-[#3c4a42]/20 text-sm focus:border-[#10b981] focus:outline-none flex-shrink-0">
                                <option value="Cash">Tiền mặt</option>
                                <option value="Transfer">Chuyển khoản</option>
                                <option value="Card">Thẻ</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Summary & Submit */}
                <div className="p-5 bg-[#201f1f] border-t border-[#3c4a42]/10 space-y-4 flex-shrink-0">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-[#86948a] uppercase tracking-widest font-bold">Tổng cộng</p>
                            <p className="text-3xl font-extrabold text-[#4edea3]">{fmt(subtotal)}</p>
                        </div>
                        <div className="text-[10px] text-[#86948a]">{totalItems} sản phẩm</div>
                    </div>
                    <button
                        onClick={handleSubmitOrder}
                        disabled={cart.length === 0 || submitting}
                        className="w-full h-14 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                        {submitting ? 'Đang xử lý...' : 'TẠO ĐƠN HÀNG'}
                    </button>
                </div>
            </section>
        </div>
    );
}