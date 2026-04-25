import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { revokeTokenAPI } from '../services/authService';

const Icon = ({ name, filled, className = '' }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        style={filled ? { fontVariationSettings: "'FILL' 1" } : {}}
    >
        {name}
    </span>
);

const NAV_ITEMS = [
    { to: '/cashier/pos', icon: 'point_of_sale', label: 'Bán hàng' },
    { to: '/cashier/tables', icon: 'table_restaurant', label: 'Sơ đồ bàn' },
    { to: '/cashier/orders', icon: 'receipt_long', label: 'Đơn hàng' },
];

export default function LayoutCashier() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => date.toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const formatDate = (date) => date.toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
    const staffName = staffUser.fullName || 'Thu ngân';
    const staffRole = staffUser.role || 'Cashier';

    const handleCloseShift = () => navigate('/cashier/shift-close');

    const handleLogout = async () => {
        if (!window.confirm('Bạn có chắc muốn đăng xuất?')) return;
        try {
            const refreshToken = localStorage.getItem('staffRefreshToken');
            if (refreshToken) await revokeTokenAPI(refreshToken);
        } catch (err) {
            console.warn('Revoke token failed:', err);
        } finally {
            localStorage.removeItem('staffToken');
            localStorage.removeItem('staffUser');
            localStorage.removeItem('staffRefreshToken');
            navigate('/staff/login');
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* SIDEBAR */}
            <aside className="h-screen w-64 fixed left-0 top-0 bg-[#1c1b1b] flex flex-col py-8 px-4 text-sm z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center shadow-lg">
                        <Icon name="coffee_maker" filled className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-[#10B981]">CaPheMinhHuu</h1>
                        <p className="text-[10px] uppercase tracking-widest text-[#86948a]">Precision Craft Coffee</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 active:scale-95 ${
                                    isActive
                                        ? 'text-[#10B981] font-semibold bg-[#201f1f]'
                                        : 'text-[#86948a] hover:text-[#e5e2e1] hover:bg-[#393939]'
                                }`
                            }
                        >
                            <Icon name={item.icon} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="pt-4 mt-4 border-t border-[#3c4a42]/10 space-y-1">
                    <button
                        onClick={handleCloseShift}
                        className="w-full flex items-center gap-3 px-3 py-3 text-[#86948a] hover:text-[#ffb95f] hover:bg-[#e29100]/10 rounded-lg transition-all duration-200 active:scale-95"
                    >
                        <Icon name="assignment_return" />
                        <span>Đóng ca</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 text-[#86948a] hover:text-[#ffb4ab] hover:bg-[#93000a]/10 rounded-lg transition-all duration-200 active:scale-95"
                    >
                        <Icon name="logout" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT CONTAINER
                FIX: Bỏ min-h-screen → dùng h-screen để khớp với cha
                     Bỏ fixed header → dùng flex-shrink-0 thay thế
            */}
            <div className="flex flex-col h-full ml-64 flex-1 min-w-0">

                {/* TOP BAR — flex-shrink-0 thay vì fixed, tự chiếm 64px */}
                <header className="flex-shrink-0 h-16 z-40 bg-[#131313]/70 backdrop-blur-xl flex items-center justify-end px-8 gap-6 text-sm font-medium border-b border-[#3c4a42]/10">
                    <div className="flex items-center gap-6 mr-auto">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1b1b] text-[#4edea3]">
                            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                            <span className="text-xs font-bold tracking-tight uppercase">Ca hiện tại: Đang mở</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[#4edea3] font-bold tracking-wider">{formatTime(currentTime)}</span>
                        <span className="text-[10px] text-[#86948a] uppercase tracking-tighter">{formatDate(currentTime)}</span>
                    </div>

                    <div className="w-[1px] h-6 bg-[#3c4a42]/20"></div>

                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="text-right">
                            <p className="text-[#e5e2e1] leading-none font-semibold">{staffName}</p>
                            <p className="text-[11px] text-[#86948a]">{staffRole}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-[#10b981]/30 bg-[#10b981] flex items-center justify-center text-white font-bold group-hover:border-[#10b981] transition-colors">
                            {staffName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* MAIN CANVAS
                    FIX CHÍNH: Bỏ overflow-y-auto + mt-16
                    - overflow-y-auto ở đây khiến toàn trang scroll → CashierPOS không control được height
                    - flex-1 min-h-0 để main lấp đầy phần còn lại (h-screen - 64px header)
                    - Mỗi page con tự quản lý scroll của mình
                */}
                <main className="flex-1 min-h-0 overflow-hidden bg-[#131313]">

                    <Outlet />
                </main>
            </div>
        </div>
    );
}