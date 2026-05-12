import * as signalR from '@microsoft/signalr';

// === SignalR Connection Utility — AppHub ===

const APP_HUB_URL = import.meta.env.VITE_HUB_URL || 'https://localhost:7280/appHub';

let connection = null;

const getToken = () => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return localStorage.getItem('adminToken') || '';
    if (path.startsWith('/Bep') || path.startsWith('/bep')) return localStorage.getItem('kitchenToken') || '';
    return localStorage.getItem('cashierToken') || '';
};

/**
 * Khởi tạo và bắt đầu kết nối SignalR tới KitchenHub.
 * Tự động reconnect nếu mất kết nối.
 */
export const startConnection = async () => {
    // Guard: trả về luôn nếu đang Connected / Connecting / Reconnecting
    if (connection && (
        connection.state === signalR.HubConnectionState.Connected ||
        connection.state === signalR.HubConnectionState.Connecting ||
        connection.state === signalR.HubConnectionState.Reconnecting
    )) {
        return connection;
    }

    if (connection && connection.state === signalR.HubConnectionState.Disconnecting) {
        await new Promise(resolve => setTimeout(resolve, 300));
        connection = null;
    }

    // Chỉ tạo HubConnection mới khi chưa có (tránh overwrite object cũ)
    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl(`${APP_HUB_URL}?access_token=${getToken()}`)
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Information)
            .build();
    }

    // Re-register lifecycle listeners (sau mỗi lần start)
    connection.onreconnecting((error) => {
        console.warn('[SignalR] Đang kết nối lại...', error);
    });
    connection.onreconnected((connectionId) => {
        console.log('[SignalR] Đã kết nối lại! ID:', connectionId);
    });
    connection.onclose((error) => {
        console.error('[SignalR] Mất kết nối.', error);
    });

    try {
        await connection.start();
        console.log('[SignalR] Kết nối AppHub thành công!');
        return connection;
    } catch (err) {
        console.error('[SignalR] Lỗi kết nối:', err);
        throw err;
    }
};

/**
 * Đăng ký listener khi có đơn hàng MỚI từ POS.
 * @param {function} callback - Nhận OrderViewDto object
 */
export const onReceiveNewOrder = (callback) => {
    if (!connection) {
        console.warn('[SignalR] onReceiveNewOrder: connection chưa sẵn sàng');
        return () => {};
    }
    const handler = (orderViewDto) => {
        console.log('[SignalR] Đơn mới:', orderViewDto);
        callback(orderViewDto);
    };
    connection.on('ReceiveNewOrder', handler);
    return () => connection.off('ReceiveNewOrder', handler);
};

/**
 * Đăng ký listener khi trạng thái đơn hàng thay đổi.
 * @param {function} callback - Nhận (orderId: number, status: string)
 */
export const onOrderStatusUpdated = (callback) => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        console.warn('[SignalR] onOrderStatusUpdated: connection chưa sẵn sàng');
        return () => {};
    }
    const handler = (orderId, status) => {
        console.log('[SignalR] Đơn #' + orderId + ' → ' + status);
        callback(orderId, status);
    };
    connection.on('OrderStatusUpdated', handler);
    return () => connection.off('OrderStatusUpdated', handler);
};

/**
 * Ngắt kết nối SignalR (gọi khi unmount).
 */
export const stopConnection = async () => {
    if (connection) {
        try {
            await connection.stop();
        } finally {
            connection = null;
            console.log('[SignalR] Đã ngắt kết nối.');
        }
    }
};

/**
 * Đăng ký listener khi ca được Admin duyệt.
 * @param {function} callback - Nhận { shiftId, adminName, message }
 */
export const onShiftApproved = (callback) => {
    if (!connection) {
        console.warn('[SignalR] onShiftApproved: connection chưa sẵn sàng');
        return () => {};
    }
    const handler = (data) => {
        console.log('[SignalR] ShiftApproved:', data);
        callback(data);
    };
    connection.on('ShiftApproved', handler);
    return () => connection.off('ShiftApproved', handler);
};

/**
 * Đăng ký listener khi ca bị Admin từ chối.
 * @param {function} callback - Nhận { shiftId, reason, message }
 */
export const onShiftRejected = (callback) => {
    if (!connection) {
        console.warn('[SignalR] onShiftRejected: connection chưa sẵn sàng');
        return () => {};
    }
    const handler = (data) => {
        console.log('[SignalR] ShiftRejected:', data);
        callback(data);
    };
    connection.on('ShiftRejected', handler);
    return () => connection.off('ShiftRejected', handler);
};

/**
 * Đăng ký listener khi có cảnh báo tồn kho thấp.
 * @param {function} callback - Nhận { ingredientName, remaining, unit }
 */
export const onLowStockAlert = (callback) => {
    if (!connection) {
        console.warn('[SignalR] onLowStockAlert: connection chưa sẵn sàng');
        return () => {};
    }
    const handler = (data) => {
        console.warn('[SignalR] LowStock:', data);
        callback(data);
    };
    connection.on('LowStockAlert', handler);
    return () => connection.off('LowStockAlert', handler);
};

/**
 * Đợi connection đạt trạng thái Connected rồi gọi callback.
 * Trả về cleanup function (để dùng trong useEffect return).
 */
export const onConnectionReady = (callback) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        callback();
        return () => {};
    }
    const interval = setInterval(() => {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            clearInterval(interval);
            callback();
        }
    }, 200);
    return () => clearInterval(interval);
};

/**
 * Đăng ký listener khi đơn hàng được đánh dấu đã thanh toán.
 * @param {function} callback - Nhận orderId: number
 */
export const onOrderPaid = (callback) => {
    if (!connection) {
        console.warn('[SignalR] onOrderPaid: connection chưa sẵn sàng');
        return () => {};
    }
    const handler = (orderId) => {
        console.log('[SignalR] Đơn #' + orderId + ' đã thanh toán');
        callback(orderId);
    };
    connection.on('OrderPaid', handler);
    return () => connection.off('OrderPaid', handler);
};
