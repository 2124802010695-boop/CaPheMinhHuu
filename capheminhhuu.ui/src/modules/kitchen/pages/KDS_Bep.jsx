import React, { useState, useEffect, useCallback } from 'react';
import { Circle } from 'lucide-react';
import { getTodayOrders, updateOrderStatus } from '../../cashier/services/orderService';
import { startConnection, onReceiveNewOrder, onOrderStatusUpdated, stopConnection } from '../../../common/utils/signalRConnection';

// === STATUS CONFIG — Map trạng thái backend → UI ===
const statusConfig = {
    'Pending':   { label: 'Chờ xử lý', color: 'text-yellow-500', btn: 'Bắt đầu pha', nextStatus: 'Preparing' },
    'Preparing': { label: 'Đang pha',   color: 'text-blue-400',   btn: 'Hoàn thành',  nextStatus: 'Ready' },
};

// === ORDER CARD COMPONENT ===
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
        const minutes = elapsedTime / 60;
        if (minutes < 5) return 'text-green-500';
        if (minutes < 10) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getProgressBarColor = () => {
        const minutes = elapsedTime / 60;
        if (minutes < 5) return 'bg-green-500';
        if (minutes < 10) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getProgress = () => {
        const minutes = elapsedTime / 60;
        if (minutes < 5) return (minutes / 5) * 100;
        if (minutes < 10) return ((minutes - 5) / 5) * 100;
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

// === MAIN KDS SCREEN ===
export default function KDSScreen() {
    const [orders, setOrders] = useState([]);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ thêm staff + logout
    const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
    const staffName = staffUser.fullName || 'Bếp';

    const handleLogout = () => {
        localStorage.removeItem('staffToken');
        localStorage.removeItem('staffUser');
        window.location.href = '/staff/login';
    };

    const fetchOrders = useCallback(async () => {
        try {
            const data = await getTodayOrders();
            const activeOrders = (data || []).filter(o =>
                o.status === 'Pending' || o.status === 'Preparing'
            );
            setOrders(activeOrders);
        } catch (err) {
            console.error('Lỗi tải đơn hàng:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchOrders();

        const connectSignalR = async () => {
            try {
                await startConnection();
                setConnected(true);

                onReceiveNewOrder((newOrder) => {
                    if (newOrder.status === 'Pending' || newOrder.status === 'Preparing') {
                        setOrders(prev => [newOrder, ...prev]);
                    }
                });

                onOrderStatusUpdated((orderId, status) => {
                    if (status === 'Ready' || status === 'Served' || status === 'Completed' || status === 'Cancelled') {
                        setOrders(prev => prev.filter(o => o.id !== orderId));
                    } else {
                        setOrders(prev => prev.map(o =>
                            o.id === orderId ? { ...o, status } : o
                        ));
                    }
                });

            } catch (err) {
                console.error('SignalR connection failed:', err);
                setConnected(false);
            }
        };

        connectSignalR();
        return () => { stopConnection(); };
    }, [fetchOrders]);

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

    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const preparingCount = orders.filter(o => o.status === 'Preparing').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
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

                        {/* ✅ thêm */}
                        <div className="text-white font-medium">
                            Xin chào, {staffName}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                            Đăng xuất
                        </button>

                    </div>

                    <div className="flex gap-6">
                        <div className="text-yellow-500 font-semibold text-lg">
                            Chờ xử lý: {pendingCount}
                        </div>
                        <div className="text-blue-400 font-semibold text-lg">
                            Đang pha: {preparingCount}
                        </div>
                    </div>
                </div>
            </div>

            {orders.length === 0 ? (
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
    );
}