import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getZReportAPI, getCurrentShiftAPI } from '../services/shiftService';

const formatVND = (amount) => new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};
const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function ShiftReport() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            // Nếu có shiftId trong URL → load report ca đó
            // Nếu không → lấy ca gần nhất (current hoặc ca vừa đóng)
            const shiftIdParam = searchParams.get('shiftId');

            if (shiftIdParam) {
                const data = await getZReportAPI(parseInt(shiftIdParam));
                setReport(data);
            } else {
                // Thử lấy current shift trước
                const current = await getCurrentShiftAPI();
                if (current && current.id) {
                    const data = await getZReportAPI(current.id);
                    setReport(data);
                } else {
                    setError('Không tìm thấy ca làm việc. Hãy đóng ca trước để xem báo cáo.');
                }
            }
        } catch (err) {
            console.error('Lỗi tải Z-Report:', err);
            const msg = err.response?.data?.message || err.message || 'Không thể tải báo cáo ca.';
            setError(msg);
        }
        setLoading(false);
    };

    // === LOADING STATE ===
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#131313]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#4edea3] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#86948a] text-sm font-medium">Đang tải báo cáo ca...</span>
                </div>
            </div>
        );
    }

    // === ERROR STATE ===
    if (error || !report) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#131313]">
                <div className="bg-[#1c1b1b] rounded-2xl p-10 max-w-md text-center border border-[#3c4a42]/10">
                    <span className="material-symbols-outlined text-5xl text-[#86948a] mb-4 block">info</span>
                    <h3 className="text-lg font-bold text-[#e5e2e1] mb-2">Chưa có dữ liệu</h3>
                    <p className="text-sm text-[#86948a]">{error || 'Không có báo cáo ca để hiển thị.'}</p>
                    <button onClick={fetchReport} className="mt-6 px-6 py-2.5 bg-[#4edea3] text-[#003824] font-bold rounded-lg text-sm hover:scale-105 active:scale-95 transition-transform">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // === Tính toán từ data thật ===
    const paymentBreakdown = report.paymentBreakdown || [];
    const topProducts = report.topProducts || [];
    const cashPayment = paymentBreakdown.find(p => p.paymentMethod === 'Cash');
    const transferPayment = paymentBreakdown.find(p => p.paymentMethod === 'Transfer');
    const cardPayment = paymentBreakdown.find(p => p.paymentMethod === 'Card');

    // Build simple bar chart data from topProducts
    const maxQty = topProducts.length > 0 ? Math.max(...topProducts.map(p => p.quantitySold)) : 1;

    return (
        <div className="p-8 min-h-screen bg-[#131313]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-[#e5e2e1] tracking-tight">Báo Cáo Ca (Z-Report)</h2>
                    <p className="text-sm text-[#86948a] mt-1">
                        Ca #{report.shiftId} • {report.cashierName} • {formatDate(report.openTime)}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-[#86948a]">Thời gian ca</p>
                        <p className="text-sm font-bold text-[#e5e2e1]">{formatTime(report.openTime)} → {formatTime(report.closeTime)}</p>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-[#1c1b1b] rounded-xl p-6 flex flex-col justify-between h-full border border-[#3c4a42]/5">
                        <span className="text-[#86948a] text-xs font-bold uppercase tracking-wider mb-4 block">Tổng đơn hàng</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold tracking-tight text-[#e5e2e1]">{report.totalOrders}</span>
                            <span className="text-[#4edea3] text-xs font-medium flex items-center">
                                <span className="material-symbols-outlined text-xs">receipt_long</span> đơn
                            </span>
                        </div>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-[#10b981] text-[#00422b] rounded-xl p-6 flex flex-col justify-between h-full relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="text-[#00422b]/70 text-xs font-bold uppercase tracking-wider mb-4 block">Tổng doanh thu</span>
                            <div className="text-3xl font-extrabold tracking-tight">{formatVND(report.totalRevenue)}</div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-20">
                            <span className="material-symbols-outlined text-8xl">payments</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-[#1c1b1b] rounded-xl p-6 border border-[#3c4a42]/5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#86948a] text-xs font-bold uppercase tracking-wider">Tiền mặt</span>
                            <span className="material-symbols-outlined text-[#86948a] text-sm">wallet</span>
                        </div>
                        <div className="text-2xl font-bold text-[#e5e2e1]">{formatVND(cashPayment?.amount)}</div>
                        <p className="text-xs text-[#86948a] mt-1">{cashPayment?.count || 0} đơn</p>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-[#1c1b1b] rounded-xl p-6 border border-[#3c4a42]/5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#86948a] text-xs font-bold uppercase tracking-wider">Chuyển khoản</span>
                            <span className="material-symbols-outlined text-[#86948a] text-sm">qr_code_2</span>
                        </div>
                        <div className="text-2xl font-bold text-[#e5e2e1]">{formatVND(transferPayment?.amount)}</div>
                        <p className="text-xs text-[#86948a] mt-1">{transferPayment?.count || 0} đơn</p>
                    </div>
                </div>

                {/* Cash Summary */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bg-[#201f1f] rounded-xl p-8 border border-[#3c4a42]/5">
                        <h3 className="text-lg font-bold text-[#e5e2e1] mb-6">Tổng Kết Tiền Mặt</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#86948a]">Tiền đầu ca</p>
                                <p className="text-xl font-bold text-[#e5e2e1]">{formatVND(report.openingCash)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#86948a]">Thu tiền mặt</p>
                                <p className="text-xl font-bold text-[#4edea3]">{formatVND(cashPayment?.amount)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#86948a]">Tiền cuối ca</p>
                                <p className="text-xl font-bold text-[#e5e2e1]">{formatVND(report.closingCash)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#86948a]">Chênh lệch</p>
                                {report.difference != null ? (
                                    <p className={`text-xl font-bold ${report.difference === 0 ? 'text-[#4edea3]' : report.difference < 0 ? 'text-[#ffb4ab]' : 'text-[#ffb95f]'}`}>
                                        {report.difference > 0 ? '+' : ''}{formatVND(report.difference)}
                                    </p>
                                ) : (
                                    <p className="text-xl font-bold text-[#86948a]">— (Blind Close)</p>
                                )}
                            </div>
                        </div>

                        {/* Payment method breakdown bar */}
                        {paymentBreakdown.length > 0 && (
                            <div className="mt-8">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#86948a] mb-3">Tỷ lệ thanh toán</p>
                                <div className="flex h-4 rounded-full overflow-hidden">
                                    {paymentBreakdown.map((p, i) => {
                                        const percent = report.totalRevenue > 0 ? (p.amount / report.totalRevenue * 100) : 0;
                                        const colors = { Cash: 'bg-[#4edea3]', Transfer: 'bg-[#60a5fa]', Card: 'bg-[#f59e0b]' };
                                        return (
                                            <div key={i} className={`${colors[p.paymentMethod] || 'bg-[#86948a]'} transition-all`}
                                                style={{ width: `${percent}%` }}
                                                title={`${p.paymentMethod}: ${percent.toFixed(1)}%`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex gap-6 mt-3">
                                    {paymentBreakdown.map((p, i) => {
                                        const dotColors = { Cash: 'bg-[#4edea3]', Transfer: 'bg-[#60a5fa]', Card: 'bg-[#f59e0b]' };
                                        const labels = { Cash: 'Tiền mặt', Transfer: 'Chuyển khoản', Card: 'Thẻ' };
                                        const percent = report.totalRevenue > 0 ? (p.amount / report.totalRevenue * 100).toFixed(0) : 0;
                                        return (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${dotColors[p.paymentMethod] || 'bg-[#86948a]'}`} />
                                                <span className="text-xs text-[#86948a]">{labels[p.paymentMethod] || p.paymentMethod} ({percent}%)</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bg-[#201f1f] rounded-xl p-8 border border-[#3c4a42]/5 h-full">
                        <h3 className="text-lg font-bold text-[#e5e2e1] mb-6">Top Sản Phẩm</h3>
                        {topProducts.length === 0 ? (
                            <p className="text-sm text-[#86948a] text-center py-8">Chưa có dữ liệu sản phẩm</p>
                        ) : (
                            <div className="space-y-5">
                                {topProducts.slice(0, 5).map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-[#4edea3]/20 text-[#4edea3]' : 'bg-[#1c1b1b] text-[#86948a]'}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[#e5e2e1] truncate">{p.productName}</p>
                                            <div className="mt-1.5 h-1.5 bg-[#1c1b1b] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#4edea3]/60 rounded-full transition-all"
                                                    style={{ width: `${(p.quantitySold / maxQty) * 100}%` }} />
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-[#e5e2e1]">{p.quantitySold}</p>
                                            <p className="text-[10px] text-[#86948a]">{formatVND(p.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Shift Info Footer */}
                <div className="col-span-12">
                    <div className="bg-[#1c1b1b] rounded-xl p-6 border border-[#3c4a42]/5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#86948a]">Thu ngân</p>
                                <p className="text-sm font-bold text-[#e5e2e1]">{report.cashierName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#86948a]">Quản lý duyệt</p>
                                <p className="text-sm font-bold text-[#e5e2e1]">{report.adminName || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-[#86948a]">Mã ca</p>
                                <p className="text-sm font-bold text-[#4edea3]">#{report.shiftId}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2.5 bg-[#4edea3] text-[#003824] font-bold rounded-lg text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
                        >
                            <span className="material-symbols-outlined text-lg">print</span>
                            In Báo Cáo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
