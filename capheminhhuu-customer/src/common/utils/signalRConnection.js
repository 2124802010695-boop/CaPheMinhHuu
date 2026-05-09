import * as signalR from '@microsoft/signalr';

const APP_HUB_URL = import.meta.env.VITE_HUB_URL || 'https://localhost:7280/appHub';

let connection = null;

const getToken = () => localStorage.getItem('customerToken') || '';

export const startConnection = async () => {
    if (connection && (
        connection.state === signalR.HubConnectionState.Connected ||
        connection.state === signalR.HubConnectionState.Connecting ||
        connection.state === signalR.HubConnectionState.Reconnecting
    )) return connection;

    if (connection && connection.state === signalR.HubConnectionState.Disconnecting) {
        await new Promise(resolve => setTimeout(resolve, 300));
        connection = null;
    }

    if (!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl(`${APP_HUB_URL}?access_token=${getToken()}`)
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();
    }

    try {
        await connection.start();
        console.log('[SignalR Customer] Connected to AppHub');
        return connection;
    } catch (err) {
        console.error('[SignalR Customer] Connection failed:', err);
        throw err;
    }
};

export const stopConnection = async () => {
    if (connection) {
        try { await connection.stop(); }
        finally { connection = null; }
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
