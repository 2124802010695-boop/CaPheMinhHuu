import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getProductsAPI } from '../../admin/services/productService';
import { getCategoriesAPI } from '../../admin/services/categoryService';
import { getTablesAPI } from '../services/tableService';
import { onConnectionReady, onOrderStatusUpdated } from '../../../common/utils/signalRConnection';
import CartPanel from '../components/CartPanel';
import toast from 'react-hot-toast';

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
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tables, setTables] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const cartRef = useRef(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const cleanup = onConnectionReady(() => {
            onOrderStatusUpdated((orderId, status) => {
                if (status === 'Ready') {
                    toast.success('Món đã sẵn sàng! Kiểm tra đơn #' + orderId);
                }
                if (status === 'Ready' || status === 'Completed' || status === 'Cancelled') {
                    fetchTables();
                }
            });
        });
        return cleanup;
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

    const fetchTables = async () => {
        try {
            const res = await getTablesAPI();
            setTables(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error('Lỗi tải bàn:', err);
        }
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

    if (loading) {
        return (
            <div className="h-full bg-[#131313] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-[#131313]">

            {/* Search Bar */}
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

            {/* 3 cột chính */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* Category Sidebar */}
                <aside className="w-24 flex-shrink-0 bg-[#1c1b1b] border-r border-[#3c4a42]/10 flex flex-col overflow-y-auto">
                    <p className="text-[9px] uppercase tracking-widest text-[#86948a] font-bold px-2 pt-3 pb-1 text-center">Danh mục</p>
                    <nav className="flex-1 px-2 pb-4 space-y-1">
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

                {/* Product Grid */}
                <section className="flex-1 min-w-0 overflow-y-auto bg-[#131313]">
                    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 p-3 content-start">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                onClick={() => cartRef.current?.addToCart(product)}
                                className={`bg-[#1c1b1b] rounded-2xl overflow-hidden cursor-pointer group hover:ring-1 ring-[#10b981]/30 transition-all duration-200 active:scale-[0.97] relative ${!product.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                                        <p className="text-white font-bold text-sm leading-tight line-clamp-2">{product.name}</p>
                                        <p className="text-[#4edea3] font-extrabold text-sm mt-0.5">
                                            {new Intl.NumberFormat('vi-VN').format(product.price)}₫
                                        </p>
                                    </div>
                                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-base">add</span>
                                    </div>
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

                {/* Cart Panel */}
                <CartPanel ref={cartRef} tables={tables} onOrderCreated={fetchTables} />
            </div>
        </div>
    );
}
