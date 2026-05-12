import * as signalR from '@microsoft/signalr';

const APP_HUB_URL = import.meta.env.VITE_HUB_URL || '/appHub';

let connection = null;
let currentOrderCode = null;

const getToken = () =>
    localStorage.getItem('customerToken') ||
    localStorage.getItem('guestToken') || '';

export const startConnection = async (orderCode = '') => {
    // Fix 1: cleanup bất kể orderCode có thay đổi hay không
    if (connection) {
        try { await connection.stop(); } catch {}
        connection = null;
        currentOrderCode = null;
    }

    currentOrderCode = orderCode;
    let url = APP_HUB_URL;
    if (orderCode) {
        url += `?orderCode=${orderCode}`;
    }

    // Fix 3: thêm transport fallback LongPolling
    connection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
            accessTokenFactory: () => getToken(),
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets |
                       signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

    try {
        await connection.start();
        console.log(`[SignalR] Connected${orderCode ? ` — Order: ${orderCode}` : ''}`);
        return connection;
    } catch (err) {
        console.error('[SignalR] Connection failed:', err);
        connection = null;
        currentOrderCode = null;
        throw err;
    }
};

export const stopConnection = async () => {
    if (connection) {
        try { await connection.stop(); }
        finally {
            connection = null;
            currentOrderCode = null;
        }
    }
};

export const onOrderTracking = (orderCode, callback) => {
    if (!connection) return () => {};
    const handler = (data) => callback(data);
    connection.on('OrderTracking', handler);
    return () => connection.off('OrderTracking', handler);
};

export const onOrderStatusUpdated = (callback) => {
    if (!connection) return () => {};
    const handler = (orderId, status) => callback(orderId, status);
    connection.on('OrderStatusUpdated', handler);
    return () => connection.off('OrderStatusUpdated', handler);
};
