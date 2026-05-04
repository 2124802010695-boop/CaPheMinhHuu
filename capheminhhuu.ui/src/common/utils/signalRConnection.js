import * as signalR from '@microsoft/signalr';

// === SignalR Connection Utility — KitchenHub ===

const KITCHEN_HUB_URL = 'https://localhost:7280/kitchenHub';

let connection = null;

/**
 * Khởi tạo và bắt đầu kết nối SignalR tới KitchenHub.
 * Tự động reconnect nếu mất kết nối.
 */
export const startConnection = async () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        console.log('[SignalR] Đã kết nối sẵn.');
        return connection;
    }

    connection = new signalR.HubConnectionBuilder()
        .withUrl(KITCHEN_HUB_URL)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // retry: ngay, 2s, 5s, 10s, 30s
        .configureLogging(signalR.LogLevel.Information)
        .build();

    // Event: Reconnecting
    connection.onreconnecting((error) => {
        console.warn('[SignalR] Đang kết nối lại...', error);
    });

    // Event: Reconnected
    connection.onreconnected((connectionId) => {
        console.log('[SignalR] Đã kết nối lại! ID:', connectionId);
    });

    // Event: Closed
    connection.onclose((error) => {
        console.error('[SignalR] Mất kết nối.', error);
    });

    try {
        await connection.start();
        console.log('[SignalR] Kết nối KitchenHub thành công!');
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
    if (!connection) return;
    connection.on('ReceiveNewOrder', (orderViewDto) => {
        console.log('[SignalR] Đơn mới:', orderViewDto);
        callback(orderViewDto);
    });
};

/**
 * Đăng ký listener khi trạng thái đơn hàng thay đổi.
 * @param {function} callback - Nhận (orderId: number, status: string)
 */
export const onOrderStatusUpdated = (callback) => {
    if (!connection) return;
    connection.on('OrderStatusUpdated', (orderId, status) => {
        console.log(`[SignalR] Đơn #${orderId} → ${status}`);
        callback(orderId, status);
    });
};

/**
 * Ngắt kết nối SignalR (gọi khi unmount).
 */
export const stopConnection = async () => {
    if (connection) {
        await connection.stop();
        console.log('[SignalR] Đã ngắt kết nối.');
    }
};
