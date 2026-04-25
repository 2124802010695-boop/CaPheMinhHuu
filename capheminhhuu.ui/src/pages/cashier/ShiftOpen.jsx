import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestOpenShiftAPI } from '../../services/shiftService';

export default function ShiftOpen() {
    const [openingCashRaw, setOpeningCashRaw] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Helper: format money while typing
    const formatMoney = (value) => {
        const number = value.replace(/\D/g, '');
        if (!number) return '';
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    const handleChange = (e) => {
        setOpeningCashRaw(formatMoney(e.target.value));
    };

    const handleOpenShift = async () => {
        const amount = parseFloat(openingCashRaw.replace(/\./g, ''));
        if (isNaN(amount) || amount < 0) {
            alert('Vui lòng nhập số tiền hợp lệ!');
            return;
        }

        setLoading(true);
        try {
            await requestOpenShiftAPI(amount);
            alert('Yêu cầu mở ca thành công! Vui lòng chờ Admin duyệt.');
            navigate('/cashier/pos');
        } catch (error) {
            console.error('Lỗi khi mở ca:', error);
            const msg = error.response?.data?.message || 'Không thể mở ca vào lúc này.';
            alert('Lỗi: ' + msg);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto h-screen flex flex-col justify-center">
            <div className="bg-[#1c1b1b] rounded-xl p-8 border border-[#3c4a42]/5 shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-[#e5e2e1]">Mở Ca Làm Việc</h3>
                        <p className="text-sm text-[#86948a]">Khai báo số dư tiền mặt đầu ngày (trong két)</p>
                    </div>
                </div>
                <div className="space-y-4 mb-8">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#86948a]">Tiền đầu ca (VND)</label>
                    <div className="relative">
                        <input
                            className="w-full bg-[#0e0e0e] border-none rounded-lg py-4 px-4 text-2xl font-bold text-[#e5e2e1] focus:ring-1 focus:ring-[#4edea3] text-right pr-12"
                            type="text"
                            placeholder="0"
                            value={openingCashRaw}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86948a] font-bold">đ</span>
                    </div>
                </div>
                <button
                    onClick={handleOpenShift}
                    disabled={loading || !openingCashRaw}
                    className={`w-full py-4 font-bold rounded-xl shadow-lg transition-all ${
                        loading || !openingCashRaw
                            ? 'bg-[#2a2a2a] text-[#86948a] cursor-not-allowed'
                            : 'bg-[#4edea3] text-[#003824] hover:scale-[1.02] active:scale-95'
                    }`}
                >
                    {loading ? 'Đang gửi yêu cầu...' : 'Bắt đầu ca'}
                </button>
            </div>
        </div>
    );
}
