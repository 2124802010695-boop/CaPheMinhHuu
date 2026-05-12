import React from 'react';

const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v) + 'đ';
const fmtPM = (m) =>
    m === 'Cash' ? 'Tiền mặt' :
    m === 'Transfer' ? 'Chuyển khoản' :
    m === 'Card' ? 'Thẻ' : m;

/* ═══════════════════════════════════════════════════════
   PrintableReport — 2 trang A4 cố định
   ═══════════════════════════════════════════════════════ */
const PrintableReport = React.forwardRef(({ stats, rangeStats, period }, ref) => {
    if (!stats) return null;

    const periodLabel = period === 'today' ? 'Hôm nay'
        : period === '7days' ? '7 ngày qua' : '30 ngày qua';
    const dateStr = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    });

    const revenueRows = (stats.revenueByDay || []).slice(0, 7);
    const paymentRows = (rangeStats?.revenueByPaymentMethod || stats.revenueByPaymentMethod || []).slice(0, 3);
    const productRows = (stats.topProducts || []).slice(0, 10);
    const categoryRows = (stats.revenueByCategory || []).slice(0, 8);
    const staffRows = (stats.staffShiftSummary || []).slice(0, 10);
    const stockRows = (stats.lowStockItems || []).slice(0, 10);

    return (
        <div ref={ref}>
            {/* Print style tag — injected inside the printed content */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                }
            `}</style>

            <div style={ROOT}>

                {/* ══════════ TRANG 1 ══════════ */}
                <div>
                    {/* Header */}
                    <div style={S.header}>
                        <div style={S.headerTitle}>BÁO CÁO KINH DOANH</div>
                        <div style={S.headerSub}>Cà Phê Minh Hữu</div>
                        <div style={S.headerMeta}>
                            Kỳ: {periodLabel} &nbsp;|&nbsp; Ngày xuất: {dateStr}
                        </div>
                    </div>

                    {/* Section 1: Stat boxes */}
                    <h3 style={S.h3}>1. Tổng quan chỉ số</h3>
                    <div style={S.grid4}>
                        <StatBox label="Doanh thu hôm nay" value={fmt(stats.todayRevenue || 0)}
                            sub={`Tuần: ${fmt(stats.weekRevenue || 0)}`} />
                        <StatBox label="Doanh thu tháng" value={fmt(stats.monthRevenue || 0)} />
                        <StatBox label="Tổng đơn hôm nay" value={stats.todayOrders ?? 0}
                            sub={`Đang chờ: ${stats.pendingOrders ?? 0}`} />
                        <StatBox label="% so kỳ trước"
                            value={`${(stats.revenueDeltaPercent || 0) > 0 ? '+' : ''}${(stats.revenueDeltaPercent || 0).toFixed(1)}%`}
                            sub={`Trước: ${fmt(stats.previousPeriodRevenue || 0)}`}
                            color={(stats.revenueDeltaPercent || 0) >= 0 ? '#16a34a' : '#dc2626'} />
                    </div>
                    <div style={S.grid4}>
                        <StatBox label="Tỷ lệ hủy đơn" value={`${(stats.cancellationRate || 0).toFixed(1)}%`} />
                        <StatBox label="TG xử lý TB" value={`${(stats.avgProcessingMinutes || 0).toFixed(1)} phút`} />
                        <StatBox label="Khách mới" value={stats.newCustomerCount ?? 0} />
                        <StatBox label="Voucher đã dùng" value={stats.couponUsedCount ?? 0} />
                    </div>

                    {/* Section 2: Order status */}
                    <h3 style={S.h3}>2. Trạng thái đơn hàng</h3>
                    <div style={S.statusRow}>
                        {[
                            ['Đang chờ', stats.pendingOrders, '#d97706'],
                            ['Đang pha', stats.preparingOrders, '#2563eb'],
                            ['Sẵn sàng', stats.readyOrders, '#7c3aed'],
                            ['Đã phục vụ', stats.servedOrders, '#9333ea'],
                            ['Hoàn thành', stats.completedOrders, '#16a34a'],
                            ['Đã hủy', stats.cancelledOrders, '#dc2626'],
                        ].map(([lbl, val, clr]) => (
                            <div key={lbl} style={{ ...S.statusBox, borderColor: clr }}>
                                <div style={{ fontSize: 7, color: '#666', textTransform: 'uppercase' }}>{lbl}</div>
                                <div style={{ fontSize: 13, fontWeight: 'bold', color: clr }}>{val ?? 0}</div>
                            </div>
                        ))}
                    </div>

                    {/* Section 3: Revenue by day */}
                    {revenueRows.length > 0 && (
                        <>
                            <h3 style={S.h3}>3. Doanh thu theo ngày</h3>
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th}>Ngày</th>
                                        <th style={S.thR}>Doanh thu</th>
                                        <th style={S.thR}>Số đơn</th>
                                        <th style={S.thR}>Tại bàn</th>
                                        <th style={S.thR}>Mang về</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueRows.map((r, i) => (
                                        <tr key={i} style={i % 2 ? S.trAlt : undefined}>
                                            <td style={S.td}>{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                                            <td style={S.tdR}>{fmt(r.revenue)}</td>
                                            <td style={S.tdR}>{r.orderCount}</td>
                                            <td style={S.tdR}>{r.tableOrderCount ?? 0}</td>
                                            <td style={S.tdR}>{r.takeAwayCount ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Section 4: Payment methods */}
                    {paymentRows.length > 0 && (
                        <>
                            <h3 style={S.h3}>4. Phương thức thanh toán</h3>
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th}>Phương thức</th>
                                        <th style={S.thR}>Doanh thu</th>
                                        <th style={S.thR}>Số đơn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentRows.map((pm, i) => (
                                        <tr key={i} style={i % 2 ? S.trAlt : undefined}>
                                            <td style={S.td}>{fmtPM(pm.paymentMethod)}</td>
                                            <td style={S.tdR}>{fmt(pm.revenue)}</td>
                                            <td style={S.tdR}>{pm.orderCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Page 1 footer */}
                    <div style={S.pageFooter}>Cà Phê Minh Hữu — Báo cáo kinh doanh — Trang 1</div>
                </div>

                {/* PAGE BREAK */}
                <div style={S.pageBreak} />

                {/* ══════════ TRANG 2 ══════════ */}
                <div>
                    {/* Section 5: Top products */}
                    <h3 style={S.h3}>5. Top sản phẩm bán chạy</h3>
                    {productRows.length > 0 ? (
                        <table style={S.table}>
                            <thead>
                                <tr>
                                    <th style={{ ...S.th, width: 24 }}>#</th>
                                    <th style={S.th}>Sản phẩm</th>
                                    <th style={S.thR}>Số lượng</th>
                                    <th style={S.thR}>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productRows.map((p, i) => (
                                    <tr key={i} style={i % 2 ? S.trAlt : undefined}>
                                        <td style={S.td}>{i + 1}</td>
                                        <td style={S.td}>{p.productName}</td>
                                        <td style={S.tdR}>{p.quantity}</td>
                                        <td style={S.tdR}>{fmt(p.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p style={S.empty}>Không có dữ liệu</p>}

                    {/* Section 6: Revenue by category */}
                    {categoryRows.length > 0 && (
                        <>
                            <h3 style={S.h3}>6. Doanh thu theo danh mục</h3>
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th}>Danh mục</th>
                                        <th style={S.thR}>Doanh thu</th>
                                        <th style={S.thR}>Số đơn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryRows.map((c, i) => (
                                        <tr key={i} style={i % 2 ? S.trAlt : undefined}>
                                            <td style={S.td}>{c.categoryName}</td>
                                            <td style={S.tdR}>{fmt(c.revenue)}</td>
                                            <td style={S.tdR}>{c.orderCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Section 7: Staff */}
                    {staffRows.length > 0 && (
                        <>
                            <h3 style={S.h3}>7. Thống kê nhân sự</h3>
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th}>Nhân viên</th>
                                        <th style={S.th}>Vai trò</th>
                                        <th style={S.thR}>Số ca</th>
                                        <th style={S.thR}>Giờ làm</th>
                                        <th style={S.thR}>Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffRows.map((s, i) => (
                                        <tr key={i} style={i % 2 ? S.trAlt : undefined}>
                                            <td style={S.td}>{s.fullName}</td>
                                            <td style={S.td}>{s.role}</td>
                                            <td style={S.tdR}>{s.totalShifts}</td>
                                            <td style={S.tdR}>{s.totalHours?.toFixed(1)}h</td>
                                            <td style={S.tdR}>{fmt(s.totalRevenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Section 8: Low stock */}
                    {stockRows.length > 0 && (
                        <>
                            <h3 style={S.h3}>8. Nguyên liệu sắp hết</h3>
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th}>Nguyên liệu</th>
                                        <th style={S.th}>SKU</th>
                                        <th style={S.thR}>Tồn kho</th>
                                        <th style={S.thR}>Tối thiểu</th>
                                        <th style={S.th}>Đơn vị</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockRows.map((item, i) => (
                                        <tr key={i} style={i % 2 ? S.trAlt : undefined}>
                                            <td style={S.td}>{item.name}</td>
                                            <td style={S.td}>{item.sku}</td>
                                            <td style={{ ...S.tdR, color: '#dc2626', fontWeight: 'bold' }}>
                                                {item.currentStock}
                                            </td>
                                            <td style={S.tdR}>{item.minStock}</td>
                                            <td style={S.td}>{item.baseUnit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Page 2 footer */}
                    <div style={S.pageFooter}>
                        Cà Phê Minh Hữu — Báo cáo kinh doanh — Trang 2
                    </div>
                </div>

            </div>
        </div>
    );
});

/* ── StatBox sub-component ── */
function StatBox({ label, value, sub, color }) {
    return (
        <div style={S.statBox}>
            <div style={S.statLabel}>{label}</div>
            <div style={{ ...S.statValue, ...(color ? { color } : {}) }}>{value}</div>
            {sub && <div style={S.statSub}>{sub}</div>}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   STYLES — tất cả inline, tối ưu A4 print
   ═══════════════════════════════════════════════════════ */
const ROOT = {
    width: '180mm',
    margin: '0 auto',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 9,
    color: '#1a1a1a',
    lineHeight: 1.45,
    background: '#fff',
};

const S = {
    /* Header */
    header: {
        textAlign: 'center',
        borderBottom: '2px solid #C8860A',
        paddingBottom: 8,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3D1A0A',
        letterSpacing: 1,
    },
    headerSub: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#C8860A',
        marginTop: 2,
    },
    headerMeta: {
        fontSize: 8,
        color: '#666',
        marginTop: 4,
    },

    /* Section title */
    h3: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#3D1A0A',
        borderBottom: '2px solid #C8860A',
        marginTop: 10,
        marginBottom: 4,
        paddingBottom: 2,
    },

    /* Stat grid */
    grid4: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: 6,
        marginBottom: 6,
    },
    statBox: {
        border: '1px solid #ddd',
        padding: 6,
        borderRadius: 4,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 7,
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#666',
        letterSpacing: 0.3,
    },
    statValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#3D1A0A',
        marginTop: 1,
    },
    statSub: {
        fontSize: 7,
        color: '#999',
        marginTop: 1,
    },

    /* Order status row */
    statusRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
        gap: 4,
        marginBottom: 8,
    },
    statusBox: {
        border: '1px solid #ddd',
        borderRadius: 4,
        padding: '4px 6px',
        textAlign: 'center',
    },

    /* Tables */
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        fontSize: 8,
        marginBottom: 6,
    },
    th: {
        background: '#3D1A0A',
        color: '#fff',
        padding: '4px 6px',
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'left',
        borderBottom: '1px solid #3D1A0A',
    },
    thR: {
        background: '#3D1A0A',
        color: '#fff',
        padding: '4px 6px',
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'right',
        borderBottom: '1px solid #3D1A0A',
    },
    td: {
        padding: '3px 6px',
        borderBottom: '1px solid #eee',
    },
    tdR: {
        padding: '3px 6px',
        borderBottom: '1px solid #eee',
        textAlign: 'right',
    },
    trAlt: {
        background: '#fafafa',
    },

    /* Misc */
    empty: {
        fontSize: 8,
        color: '#999',
        fontStyle: 'italic',
        margin: '4px 0',
    },
    pageBreak: {
        pageBreakAfter: 'always',
        marginBottom: 0,
    },
    pageFooter: {
        textAlign: 'center',
        fontSize: 7,
        color: '#999',
        borderTop: '1px solid #ddd',
        paddingTop: 4,
        marginTop: 12,
    },
};

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
