import React, { useState, useEffect } from 'react';
import { updateOrderStatus, createVnPayUrl } from '../services/orderService';

export default function PaymentPanel({ order, paymentMethod, onClose, onConfirmed }) {
    const [loadingVnPay, setLoadingVnPay] = useState(false);
    const [vnPayUrl, setVnPayUrl] = useState('');
    const [cashReceived, setCashReceived] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (paymentMethod === 'VNPay' && order?.orderCode) {
            const fetchUrl = async () => {
                setLoadingVnPay(true);
                setError(null);
                try {
                    const res = await createVnPayUrl(order.orderCode);
                    if (res?.paymentUrl) {
                        setVnPayUrl(res.paymentUrl);
                    }
                } catch (err) {
                    setError('Lỗi lấy link VNPAY: ' + (err.response?.data?.message || err.message));
                }
                setLoadingVnPay(false);
            };
            fetchUrl();
        }
    }, [paymentMethod, order?.orderCode]);

    const handleConfirm = async () => {
        setSubmitting(true);
        setError(null);
        try {
            await updateOrderStatus(order.id, "Completed");
            onConfirmed();
        } catch (err) {
            setError('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
        }
        setSubmitting(false);
    };

    const cashValue = Number(cashReceived) || 0;
    const changeAmount = cashValue - (order?.totalAmount || 0);

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

    return (
        <div className="bg-[#1c1b1b] border border-[#3c4a42]/20 rounded-2xl w-[400px] max-w-[90vw] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[#3c4a42]/20 flex justify-between items-center bg-[#131313]">
                <h2 className="text-lg font-bold text-[#e5e2e1]">Thanh toán đơn hàng</h2>
                <button onClick={onClose} className="text-[#86948a] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>

            {/* Order Summary */}
            <div className="p-4 border-b border-[#3c4a42]/10 space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-[#86948a]">Khách hàng:</span>
                    <span className="text-[#e5e2e1] font-semibold">{order?.customerName || 'Khách lẻ'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-[#86948a]">Mã đơn:</span>
                    <span className="text-[#4edea3] font-mono">{order?.orderCode}</span>
                </div>
                <div className="flex justify-between items-center text-lg mt-2 pt-2 border-t border-[#3c4a42]/10">
                    <span className="text-[#86948a] font-bold">Tổng tiền:</span>
                    <span className="text-[#10b981] font-extrabold">{fmt(order?.totalAmount || 0)}</span>
                </div>
            </div>

            {/* Payment Method Specifics */}
            <div className="p-4 bg-[#131313] flex-1">
                {paymentMethod === 'Cash' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-[#86948a] mb-1">Tiền khách đưa</label>
                            <input
                                type="number"
                                placeholder="Nhập số tiền..."
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                                className="w-full py-2.5 px-3 rounded-xl bg-[#1c1b1b] text-[#e5e2e1] border border-[#3c4a42]/20 focus:border-[#10b981] focus:outline-none font-bold text-lg"
                            />
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-[#2a2a2a]/50 border border-[#3c4a42]/10">
                            <span className="text-sm font-medium text-[#86948a]">Tiền thừa:</span>
                            <span className={`text-lg font-bold ${changeAmount >= 0 ? 'text-[#4edea3]' : 'text-red-400'}`}>
                                {fmt(changeAmount)}
                            </span>
                        </div>
                    </div>
                )}

                {(paymentMethod === 'Transfer' || paymentMethod === 'Card') && (
                    <div className="flex flex-col items-center justify-center py-6 text-[#86948a]">
                        <span className="material-symbols-outlined text-5xl mb-2 text-[#4edea3]">credit_card</span>
                        <p className="text-center font-medium">Vui lòng nhận thanh toán qua máy POS<br/>hoặc kiểm tra app Ngân hàng</p>
                    </div>
                )}

                {paymentMethod === 'VNPay' && (
                    <div className="flex flex-col items-center justify-center py-4 space-y-4">
                        {loadingVnPay ? (
                            <div className="w-8 h-8 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
                        ) : vnPayUrl ? (
                            <>
                                <span className="material-symbols-outlined text-5xl text-[#10b981]">qr_code_2</span>
                                <a 
                                    href={vnPayUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[#4edea3] hover:text-[#10b981] font-bold underline transition-colors text-center"
                                >
                                    Mở link thanh toán VNPAY
                                </a>
                                <p className="text-xs text-[#86948a] text-center mt-2">
                                    Hoặc cho khách hàng quét mã trên màn hình phụ
                                </p>
                            </>
                        ) : error ? (
                            <div className="text-red-400 text-sm text-center">{error}</div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && paymentMethod !== 'VNPay' && (
                <div className="px-4 pb-2 text-red-400 text-sm text-center font-medium">{error}</div>
            )}

            {/* Actions */}
            <div className="p-4 border-t border-[#3c4a42]/20 flex gap-3 bg-[#1c1b1b]">
                <button
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-[#2a2a2a] text-[#86948a] font-bold hover:bg-[#393939] hover:text-white transition-colors disabled:opacity-50"
                >
                    HUỶ BỎ
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={submitting || (paymentMethod === 'Cash' && changeAmount < 0)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐÃ TT'}
                </button>
            </div>
        </div>
    );
}
