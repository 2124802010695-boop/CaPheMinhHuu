import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Circle } from 'lucide-react';
import { getTodayOrders, updateOrderStatus } from '../../cashier/services/orderService';
import { startConnection, onReceiveNewOrder, onOrderStatusUpdated, stopConnection, onShiftApproved, onShiftRejected } from '../../../common/utils/signalRConnection';
import { revokeTokenAPI } from '../../../common/services/authService';
import { kitchenRequestOpenShift, kitchenGetCurrentShift, kitchenCloseShift } from '../../cashier/services/shiftService';

// === STATUS CONFIG ===
const statusConfig = {
    'Pending':   { label: 'Chờ xử lý', color: 'text-yellow-500', btn: 'Bắt đầu pha', nextStatus: 'Preparing' },
    'Preparing': { label: 'Đang pha',   color: 'text-blue-400',   btn: 'Hoàn thành',  nextStatus: 'Ready' },
};

// === ORDER CARD ===
const OrderCard = ({ order, onAction }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    useEffect(() => {
        const startTime = new Date(order.orderDate).getTime();
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [order.orderDate]);
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const getTimerColor = () => {
        const m = elapsedTime / 60;
        if (m < 5) return 'text-green-500';
        if (m < 10) return 'text-yellow-500';
        return 'text-red-500';
    };
    const getProgressBarColor = () => {
        const m = elapsedTime / 60;
        if (m < 5) return 'bg-green-500';
        if (m < 10) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    const getProgress = () => {
        const m = elapsedTime / 60;
        if (m < 5) return (m / 5) * 100;
        if (m < 10) return ((m - 5) / 5) * 100;
        return 100;
    };
    const cfg = statusConfig[order.status] || statusConfig['Pending'];
    return (
        <div className="bg-neutral-800 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">
                            {order.tableNumber > 0 ? `Bàn ${order.tableNumber}` : 'Mang đi'}
                        </h2>
                        <span className="text-neutral-400 text-sm">#{String(order.id).padStart(4, '0')}</span>
                    </div>
                    <div className="text-right min-w-[80px]">
                        <div className={`text-2xl font-semibold ${getTimerColor()}`}>
                            {formatTime(elapsedTime)}
                        </div>
                        <div className="w-full h-1 bg-neutral-700 rounded-full mt-1 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                                style={{ width: `${getProgress()}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    {(order.items || []).map((item, idx) => (
                        <div key={idx} className="text-white text-base">
                            {item.quantity}x {item.productName}
                            {item.note && <p style={{fontSize:'12px', color:'#888', margin:'2px 0 0 0'}}>📝 {item.note}</p>}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 pt-0 flex gap-2">
                <button
                    onClick={() => onAction(order.id, cfg.nextStatus)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg uppercase transition-colors"
                >
                    {cfg.btn}
                </button>
            </div>
        </div>
    );
};

// === MAIN KDS ===
export default function KDSScreen() {
    const [orders, setOrders] = useState([]);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    // SHIFT STATE
    // 'loading'       — đang check ca hiện tại
    // 'idle'          — chưa có ca, hiện màn bắt đầu ca
    // 'pending'       — đã gửi request, đang chờ Admin duyệt
    // 'active'        — ca đang mở, vào KDS làm việc
    // 'rejected'      — Admin từ chối
    const [shiftState, setShiftState] = useState('loading');
    const [currentShift, setCurrentShift] = useState(null); // { id, openTime, userName }
    const [shiftError, setShiftError] = useState('');

    // MODAL KẾT THÚC CA
    const [showEndShiftModal, setShowEndShiftModal] = useState(false);
    const [closingShift, setClosingShift] = useState(false);

    const staffUser = JSON.parse(localStorage.getItem('kitchenUser') || '{}');
    const staffName = staffUser.fullName || 'Bếp';

    // ── Check ca hiện tại khi mount ──
    useEffect(() => {
        const checkCurrentShift = async () => {
            try {
                const res = await kitchenGetCurrentShift();
                const shift = res?.data?.shift || res?.shift || null;
                if (shift && shift.status === 'Open') {
                    setCurrentShift(shift);
                    setShiftState('active');
                } else if (shift && shift.status === 'PendingOpen') {
                    setCurrentShift(shift);
                    setShiftState('pending');
                } else {
                    setShiftState('idle');
                }
            } catch {
                setShiftState('idle');
            }
        };
        checkCurrentShift();
    }, []);

    // ── SignalR — lắng nghe ShiftApproved / ShiftRejected ──
    useEffect(() => {
        if (shiftState !== 'pending') return;
        const token = localStorage.getItem('kitchenToken');
        if (!token) return;

        // Dùng signalRConnection có sẵn
        const setup = async () => {
            try {
                await startConnection();
                const offApproved = onShiftApproved((data) => {
                    if (currentShift && data.shiftId === currentShift.id) {
                        setShiftState('active');
                    }
                });
                const offRejected = onShiftRejected((data) => {
                    if (currentShift && data.shiftId === currentShift.id) {
                        setShiftState('rejected');
                        setShiftError(data.reason || 'Ca bị từ chối');
                        setCurrentShift(null);
                    }
                });
                return () => { offApproved(); offRejected(); };
            } catch { /* ignore */ }
        };
        setup();
    }, [shiftState, currentShift]);

    // ── Fetch orders khi active ──
    const fetchOrders = useCallback(async () => {
        try {
            const data = await getTodayOrders();
            const activeOrders = (data || []).filter(o =>
                o.status === 'Pending' || o.status === 'Preparing'
            );
            setOrders([...activeOrders].sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate)));
        } catch (err) {
            console.error('Lỗi tải đơn hàng:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (shiftState !== 'active') return;
        fetchOrders();
        let offStatus = () => {};
        let offNew = () => {};
        const connectSignalR = async () => {
            try {
                await startConnection();
                setConnected(true);
                offNew = onReceiveNewOrder((newOrder) => {
                    if (newOrder.status === 'Pending' || newOrder.status === 'Preparing') {
                        setOrders(prev => [...prev, newOrder].sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate)));
                    }
                }) || (() => {});
                offStatus = onOrderStatusUpdated((orderId, status) => {
                    if (status === 'Ready' || status === 'Served' || status === 'Completed' || status === 'Cancelled') {
                        setOrders(prev => prev.filter(o => o.id !== orderId));
                    } else {
                        setOrders(prev => prev.map(o =>
                            o.id === orderId ? { ...o, status } : o
                        ));
                    }
                }) || (() => {});
            } catch (err) {
                console.error('SignalR failed:', err);
                setConnected(false);
            }
        };
        connectSignalR();
        return () => { offStatus(); offNew(); };
    }, [shiftState, fetchOrders]);

    // ── Handlers ──
    const handleRequestOpen = async () => {
        setShiftError('');
        try {
            const res = await kitchenRequestOpenShift();
            const shift = res?.data || res;
            setCurrentShift(shift);
            setShiftState('pending');
        } catch (err) {
            setShiftError(err.response?.data?.message || 'Không thể gửi yêu cầu mở ca');
        }
    };

    const handleAction = async (orderId, nextStatus) => {
        try {
            await updateOrderStatus(orderId, nextStatus);
            if (nextStatus === 'Ready') {
                setOrders(prev => prev.filter(o => o.id !== orderId));
            } else {
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: nextStatus } : o
                ));
            }
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái:', err);
        }
    };

    const handleLogoutClick = () => {
        if (shiftState === 'active' && currentShift) {
            setShowEndShiftModal(true);
        } else {
            doLogout();
        }
    };

    const handleConfirmEndShift = async () => {
        if (!currentShift) return;
        setClosingShift(true);
        try {
            await kitchenCloseShift(currentShift.id);
            setShowEndShiftModal(false);
            doLogout();
        } catch (err) {
            setShiftError(err.response?.data?.message || 'Không thể đóng ca');
            setClosingShift(false);
            setShowEndShiftModal(false);
        }
    };

    const doLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('kitchenRefreshToken');
            if (refreshToken) await revokeTokenAPI(refreshToken);
        } catch { /* ignore */ } finally {
            localStorage.removeItem('kitchenToken');
            localStorage.removeItem('kitchenRefreshToken');
            localStorage.removeItem('kitchenUser');
            stopConnection();
            window.location.href = '/login';
        }
    };

    const formatDateTime = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const calcHours = () => {
        if (!currentShift?.openTime) return '0';
        return ((new Date() - new Date(currentShift.openTime)) / (1000 * 60 * 60)).toFixed(1);
    };

    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const preparingCount = orders.filter(o => o.status === 'Preparing').length;

    // ── RENDER theo shiftState ──

    // 1. Đang check ca
    if (shiftState === 'loading') {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // 2. Chưa có ca — màn bắt đầu ca
    if (shiftState === 'idle' || shiftState === 'rejected') {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="bg-neutral-800 rounded-2xl p-8 w-[380px] flex flex-col items-center gap-6 shadow-2xl">
                    <div className="text-5xl">👨🍳</div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-2">Xác nhận bắt đầu ca</h2>
                        <p className="text-neutral-400 text-sm">Xin chào, <span className="text-green-400 font-semibold">{staffName}</span></p>
                        <p className="text-neutral-500 text-xs mt-1">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                    </div>
                    {shiftState === 'rejected' && (
                        <div className="w-full bg-red-900/40 border border-red-500 rounded-xl p-3 text-center">
                            <p className="text-red-400 text-sm font-semibold">❌ Ca bị từ chối</p>
                            {shiftError && <p className="text-red-300 text-xs mt-1">{shiftError}</p>}
                        </div>
                    )}
                    {shiftError && shiftState === 'idle' && (
                        <div className="w-full bg-red-900/40 border border-red-500 rounded-xl p-3 text-center">
                            <p className="text-red-300 text-sm">{shiftError}</p>
                        </div>
                    )}
                    <button
                        onClick={handleRequestOpen}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg transition-colors active:scale-95"
                    >
                        Bắt đầu ca làm việc
                    </button>
                    <button onClick={doLogout} className="text-neutral-500 hover:text-red-400 text-sm transition-colors">
                        Không phải tôi? Đăng xuất
                    </button>
                </div>
            </div>
        );
    }

    // 3. Đang chờ Admin duyệt
    if (shiftState === 'pending') {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="bg-neutral-800 rounded-2xl p-8 w-[380px] flex flex-col items-center gap-6 shadow-2xl">
                    <div className="text-5xl">⏳</div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-2">Đang chờ duyệt ca</h2>
                        <p className="text-neutral-400 text-sm">Xin chào, <span className="text-green-400 font-semibold">{staffName}</span></p>
                        <p className="text-neutral-500 text-xs mt-2">Yêu cầu mở ca đã được gửi đến Admin.<br/>Vui lòng chờ xác nhận...</p>
                    </div>
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <button onClick={doLogout} className="text-neutral-500 hover:text-red-400 text-sm transition-colors">
                        Huỷ và đăng xuất
                    </button>
                </div>
            </div>
        );
    }

    // 4. Ca đang active — KDS chính
    return (
        <>
            <div className="min-h-screen bg-neutral-900 p-3">
                <div className="bg-neutral-800 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Circle size={12} className={`fill-${connected ? 'green' : 'red'}-500 text-${connected ? 'green' : 'red'}-500`} />
                                <span className={`${connected ? 'text-green-500' : 'text-red-500'} font-medium`}>
                                    {connected ? 'Trực tuyến' : 'Mất kết nối'}
                                </span>
                            </div>
                            <div className="text-white font-medium">Xin chào, {staffName}</div>
                            <button
                                onClick={handleLogoutClick}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                            >
                                Đăng xuất
                            </button>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-yellow-500 font-semibold text-lg">Chờ xử lý: {pendingCount}</div>
                            <div className="text-blue-400 font-semibold text-lg">Đang pha: {preparingCount}</div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-neutral-500">
                        <span className="text-6xl mb-4">☕</span>
                        <p className="text-xl font-medium">Không có đơn nào đang chờ</p>
                        <p className="text-sm mt-2">Đơn mới sẽ tự động xuất hiện tại đây</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} onAction={handleAction} />
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL KẾT THÚC CA */}
            {showEndShiftModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-neutral-800 rounded-2xl p-8 w-[400px] flex flex-col gap-5 shadow-2xl">
                        <div className="text-center">
                            <div className="text-4xl mb-3">🏁</div>
                            <h2 className="text-xl font-bold text-white">Xác nhận kết thúc ca</h2>
                        </div>
                        <div className="bg-neutral-700 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between">
                                <span className="text-neutral-400 text-sm">Nhân viên</span>
                                <span className="text-white font-semibold">{staffName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400 text-sm">Bắt đầu ca</span>
                                <span className="text-white">{formatDateTime(currentShift?.openTime)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400 text-sm">Kết thúc ca</span>
                                <span className="text-white">{formatDateTime(new Date())}</span>
                            </div>
                            <div className="flex justify-between border-t border-neutral-600 pt-3">
                                <span className="text-neutral-400 text-sm">Tổng giờ làm</span>
                                <span className="text-green-400 font-bold text-lg">{calcHours()} giờ</span>
                            </div>
                        </div>
                        {shiftError && (
                            <p className="text-red-400 text-sm text-center">{shiftError}</p>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEndShiftModal(false)}
                                className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl font-semibold transition-colors"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleConfirmEndShift}
                                disabled={closingShift}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
                            >
                                {closingShift ? 'Đang đóng ca...' : 'Xác nhận kết thúc'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}