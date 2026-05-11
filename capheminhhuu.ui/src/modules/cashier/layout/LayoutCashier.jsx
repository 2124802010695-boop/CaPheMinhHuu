import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { revokeTokenAPI } from '../../../common/services/authService';
import { getCurrentShiftAPI } from '../services/shiftService';
import { startConnection, stopConnection, onConnectionReady, onShiftApproved, onShiftRejected } from '../../../common/utils/signalRConnection';
import toast from 'react-hot-toast';

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
    { to: '/cashier/payment', icon: 'payments', label: 'Thanh toán' },
];

// Các route được phép truy cập khi CHƯA mở ca
const SHIFT_EXEMPT_PATHS = ['/cashier/shift-open', '/cashier/shift-close', '/cashier/shift-report'];

export default function LayoutCashier() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [shiftStatus, setShiftStatus] = useState('loading'); // 'loading' | 'open' | 'none'
    const [currentShift, setCurrentShift] = useState(null);

    // === SHIFT GATE: Kiểm tra ca hiện tại ===
    const checkShift = useCallback(async () => {
        try {
            const res = await getCurrentShiftAPI();
            // API trả về shift object khi có ca Open, hoặc { message, shift: null }
            if (res && res.id && res.status === 'Open') {
                setShiftStatus('open');
                setCurrentShift(res);
            } else if (res && res.id && res.status === 'PendingOpen') {
                setShiftStatus('pending');
                setCurrentShift(res);
            } else {
                setShiftStatus('none');
                setCurrentShift(null);
            }
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401) {
                setShiftStatus('loading');
                // axiosCustomize sẽ tự refresh token
            } else if (status === 403) {
                // Token sai role hoàn toàn → logout
                localStorage.removeItem('cashierToken');
                localStorage.removeItem('cashierRefreshToken');
                localStorage.removeItem('cashierUser');
                navigate('/login', { replace: true });
            } else {
                console.error('Lỗi kiểm tra ca:', err);
                setShiftStatus('none');
                setCurrentShift(null);
            }
        }
    }, []);

    useEffect(() => {
        checkShift();
    }, [checkShift]);

    useEffect(() => {
        startConnection().catch(console.error);
    }, []);

    useEffect(() => {
        if (shiftStatus === 'open' || shiftStatus === 'pending') {
            let offApproved = () => {};
            let offRejected = () => {};

            const cleanupReady = onConnectionReady(() => {
                offApproved = onShiftApproved((data) => {
                    toast.success(`✅ ${data.message || 'Ca đã được duyệt!'}`);
                    checkShift();
                });
                offRejected = onShiftRejected((data) => {
                    toast.error(`❌ ${data.message || 'Ca bị từ chối.'}`);
                });
            });

            return () => {
                offApproved();
                offRejected();
                cleanupReady();
            };
        }
    }, [shiftStatus, checkShift]);

    // Redirect sang shift-open nếu chưa mở ca và đang ở route không exempt
    useEffect(() => {
        if (
            (shiftStatus === 'none' || shiftStatus === 'pending') && 
            !SHIFT_EXEMPT_PATHS.includes(location.pathname)
        ) {
            navigate('/cashier/shift-open', { replace: true });
        }
    }, [shiftStatus, location.pathname, navigate]);

    // Khi ca được duyệt (shiftStatus đổi thành 'open') → tự động vào POS
    useEffect(() => {
        if (shiftStatus === 'open' && location.pathname === '/cashier/shift-open') {
            navigate('/cashier/pos', { replace: true });
        }
    }, [shiftStatus, location.pathname, navigate]);

    // Clock
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

    const staffUser = JSON.parse(localStorage.getItem('cashierUser') || '{}');
    const staffName = staffUser.fullName || 'Thu ngân';
    const staffRole = staffUser.role || 'Cashier';

    const handleCloseShift = () => navigate('/cashier/shift-close');

    const handleLogout = async () => {
        if (!window.confirm('Bạn có chắc muốn đăng xuất?')) return;
        try {
            const refreshToken = localStorage.getItem('cashierRefreshToken');
            if (refreshToken) await revokeTokenAPI(refreshToken);
        } catch (err) {
            console.warn('Revoke token failed:', err);
        } finally {
            localStorage.removeItem('cashierToken');
            localStorage.removeItem('cashierUser');
            localStorage.removeItem('cashierRefreshToken');
            stopConnection();
            navigate('/staff/login');
        }
    };

    // === Loading state ===
    if (shiftStatus === 'loading') {
        return (
            <div className="h-screen w-full bg-[#131313] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#86948a] text-sm font-medium">Đang kiểm tra ca làm việc...</p>
                </div>
            </div>
        );
    }

    // === Chưa mở ca → Hiển thị ShiftOpen (Outlet) với layout tối giản ===
    if (shiftStatus === 'none' || shiftStatus === 'pending') {
        return (
            <div className="h-screen w-full bg-[#131313] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* Header tối giản */}
                <header className="flex-shrink-0 h-16 bg-[#131313]/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-[#3c4a42]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#10b981] flex items-center justify-center shadow-lg">
                            <Icon name="coffee_maker" filled className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-[#10B981]">CaPheMinhHuu</h1>
                            <p className="text-[10px] uppercase tracking-widest text-[#86948a]">Precision Craft Coffee</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1b1b] text-[#f59e0b]">
                            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"></span>
                            <span className="text-xs font-bold tracking-tight uppercase">Chưa mở ca</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[#e5e2e1] leading-none font-semibold text-sm">{staffName}</p>
                                <p className="text-[11px] text-[#86948a]">{staffRole}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-[#86948a] hover:text-[#ffb4ab] hover:bg-[#93000a]/10 rounded-lg transition-all text-sm"
                        >
                            <Icon name="logout" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </header>
                {/* ShiftOpen page */}
                <main className="flex-1 min-h-0 overflow-hidden">
                    <Outlet context={{ onShiftOpened: checkShift }} />
                </main>
            </div>
        );
    }

    // === Đã mở ca → Layout đầy đủ ===
    return (
        <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* SIDEBAR */}
            <aside className="h-screen w-52 fixed left-0 top-0 bg-[#1c1b1b] flex flex-col py-8 px-4 text-sm z-50">
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

            {/* MAIN CONTENT CONTAINER */}
            <div className="flex flex-col h-full ml-52 flex-1 min-w-0 overflow-hidden">

                {/* TOP BAR */}
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

                {/* MAIN CANVAS */}
                <main className="flex-1 min-h-0 overflow-hidden bg-[#131313]">
                    <Outlet context={{ currentShift, onShiftClosed: checkShift }} />
                </main>
            </div>
        </div>
    );
}