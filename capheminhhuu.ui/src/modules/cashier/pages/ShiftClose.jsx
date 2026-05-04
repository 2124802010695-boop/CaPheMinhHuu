import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { closeShiftAPI, getCurrentShiftAPI } from '../services/shiftService';

export default function ShiftClose() {
    const [closingCashRaw, setClosingCashRaw] = useState('');
    const [currentShift, setCurrentShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentShift();
    }, []);

    const fetchCurrentShift = async () => {
        setLoading(true);
        try {
            const shiftData = await getCurrentShiftAPI();
            setCurrentShift(Array.isArray(shiftData) ? shiftData[0] : shiftData);
        } catch (error) {
            console.error('Không tải được thông tin ca:', error);
            // Có thể cashier chưa mở ca hoặc không có ca đang active
            alert('Bạn chưa mở ca hoặc thông tin ca không khả dụng hợp lệ!');
            navigate('/cashier/pos');
        }
        setLoading(false);
    };

    // Helper: format money while typing
    const formatMoney = (value) => {
        const number = value.toString().replace(/\D/g, '');
        if (!number) return '';
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    const handleChange = (e) => {
        setClosingCashRaw(formatMoney(e.target.value));
    };

    const handleCloseShift = async () => {
        if (!currentShift) return;

        const amount = parseFloat(closingCashRaw.replace(/\./g, ''));
        if (isNaN(amount) || amount < 0) {
            alert('Vui lòng nhập số tiền thực tế trong két!');
            return;
        }

        setIsSubmitting(true);
        try {
            await closeShiftAPI(currentShift.id, amount);
            alert('Đóng ca thành công!');
            // Sau khi đóng ca thì chuyển về xem báo cáo / pos
            navigate('/cashier/shift-report');
        } catch (error) {
            console.error('Lỗi khi đóng ca:', error);
            const msg = error.response?.data?.message || 'Không thể đóng ca vào lúc này.';
            alert('Lỗi: ' + msg);
        }
        setIsSubmitting(false);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#131313]">
                <div className="text-[#86948a] flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin mb-4" />
                    Đang tải dữ liệu ca...
                </div>
            </div>
        );
    }

    if (!currentShift) return null;

    // Giả lập dự kiến hệ thống (Tổng thu tiền mặt + Tiền đầu ca)
    // Shift model backend có OpeningCash, TotalRevenue ...
    const expectedCash = (currentShift.openingCash || 0) + (currentShift.totalRevenue || 0); // Tạm tính theo TotalRevenue nếu backend chưa chia method
    const inputCash = parseFloat(closingCashRaw.replace(/\./g, '')) || 0;
    const diff = inputCash - expectedCash;

    return (
        <div className="p-8 max-w-2xl mx-auto h-screen flex flex-col justify-center">
            <div className="bg-[#1c1b1b] rounded-xl p-8 border border-[#3c4a42]/5 shadow-2xl">
                <h3 className="text-xl font-bold text-[#e5e2e1] mb-8">Kết Ca & Bàn Giao</h3>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#86948a]">Tiền dự kiến (Hệ thống tính)</label>
                        <p className="text-lg font-bold text-[#e5e2e1]">{new Intl.NumberFormat('vi-VN').format(expectedCash)} đ</p>
                    </div>
                    <div className="space-y-2 text-right md:text-left">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#86948a]">Chênh lệch</label>
                        <p className={`text-lg font-bold ${diff === 0 ? 'text-[#4edea3]' : diff < 0 ? 'text-[#ffb4ab]' : 'text-[#ffb95f]'}`}>
                            {diff > 0 ? '+' : ''}{new Intl.NumberFormat('vi-VN').format(diff)} đ
                        </p>
                    </div>
                </div>
                
                <div className="space-y-4 mb-8">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#4edea3]">Tiền mặt thực tế (Đếm két cuối ngày)</label>
                    <div className="relative">
                        <input
                            className="w-full bg-[#0e0e0e] border-none rounded-lg py-4 px-4 text-xl font-bold text-[#e5e2e1] focus:ring-1 focus:ring-[#4edea3] text-right pr-12"
                            placeholder="0"
                            type="text"
                            value={closingCashRaw}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86948a] font-bold">đ</span>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        disabled={isSubmitting}
                        className="flex-1 py-4 border border-[#3c4a42]/20 text-[#e5e2e1] font-bold rounded-xl hover:bg-[#201f1f] transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleCloseShift} 
                        disabled={isSubmitting || !closingCashRaw}
                        className={`flex-[2] py-4 font-bold rounded-xl shadow-lg transition-all ${
                            isSubmitting || !closingCashRaw
                                ? 'bg-[#2a2a2a] text-[#86948a] cursor-not-allowed'
                                : 'bg-[#4edea3] text-[#003824] hover:scale-[1.02] active:scale-95'
                        }`}
                    >
                        {isSubmitting ? 'ĐANG KẾT CA...' : 'XÁC NHẬN KẾT CA'}
                    </button>
                </div>
            </div>
        </div>
    );
}
