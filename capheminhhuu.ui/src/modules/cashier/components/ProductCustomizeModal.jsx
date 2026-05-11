import { useEffect, useState } from 'react';
import { getToppings, getProductSizes } from '../services/orderService';

export default function ProductCustomizeModal({ product, onConfirm, onCancel }) {
  const [sizes, setSizes] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [sugarLevel, setSugarLevel] = useState(100);
  const [iceLevel, setIceLevel] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sizeRes, toppingRes] = await Promise.all([
          getProductSizes(product.id),
          getToppings(),
        ]);
        const sizeList = sizeRes.data ?? [];
        const toppingList = toppingRes.data ?? [];
        setSizes(sizeList);
        setToppings(toppingList);
        if (sizeList.length > 0) setSelectedSize(sizeList[0]);
      } catch (err) {
        console.error('Failed to load customize data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [product.id]);

  const toggleTopping = (topping) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t.toppingId === topping.id);
      if (exists) return prev.filter(t => t.toppingId !== topping.id);
      return [...prev, { toppingId: topping.id, name: topping.name, price: topping.price, quantity: 1 }];
    });
  };

  const basePrice = product.price ?? 0;
  const sizeExtra = selectedSize?.priceExtra ?? 0;
  const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const unitPrice = basePrice + sizeExtra + toppingTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onConfirm({
      sizeLabel: selectedSize?.label ?? null,
      sizeExtraPrice: sizeExtra,
      sizeMultiplier: selectedSize?.recipeMultiplier ?? 1,
      sugarLevel,
      iceLevel,
      quantity,
      note,
      toppings: selectedToppings,
    });
  };

  const SUGAR_OPTIONS = [0, 25, 50, 75, 100];
  const ICE_OPTIONS = [0, 25, 50, 75, 100];

  if (loading) return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <p style={{ textAlign: 'center', padding: 32 }}>Đang tải...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <div style={styles.header}>
          <span style={styles.productName}>{product.name}</span>
          <span style={styles.basePrice}>{basePrice.toLocaleString('vi-VN')}đ</span>
        </div>

        {sizes.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Size</div>
            <div style={styles.chipRow}>
              {sizes.map(s => (
                <button
                  key={s.id}
                  style={selectedSize?.id === s.id ? styles.chipActive : styles.chip}
                  onClick={() => setSelectedSize(s)}
                >
                  {s.label}{s.priceExtra > 0 ? ` +${s.priceExtra.toLocaleString('vi-VN')}đ` : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionLabel}>Đường ({sugarLevel}%)</div>
          <div style={styles.chipRow}>
            {SUGAR_OPTIONS.map(v => (
              <button
                key={v}
                style={sugarLevel === v ? styles.chipActive : styles.chip}
                onClick={() => setSugarLevel(v)}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>Đá ({iceLevel}%)</div>
          <div style={styles.chipRow}>
            {ICE_OPTIONS.map(v => (
              <button
                key={v}
                style={iceLevel === v ? styles.chipActive : styles.chip}
                onClick={() => setIceLevel(v)}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>

        {toppings.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Topping</div>
            <div style={styles.chipRow}>
              {toppings.map(t => {
                const selected = selectedToppings.find(st => st.toppingId === t.id);
                return (
                  <button
                    key={t.id}
                    style={selected ? styles.chipActive : styles.chip}
                    onClick={() => toggleTopping(t)}
                  >
                    {t.name} +{t.price.toLocaleString('vi-VN')}đ
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionLabel}>Số lượng</div>
          <div style={styles.qtyRow}>
            <button style={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span style={styles.qtyNum}>{quantity}</span>
            <button style={styles.qtyBtn} onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionLabel}>Ghi chú</div>
          <input
            style={styles.noteInput}
            placeholder="VD: ít đá, không đường..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div style={styles.footer}>
          <div style={styles.totalText}>
            Tổng: <strong>{totalPrice.toLocaleString('vi-VN')}đ</strong>
          </div>
          <div style={styles.footerBtns}>
            <button style={styles.cancelBtn} onClick={onCancel}>Huỷ</button>
            <button style={styles.confirmBtn} onClick={handleConfirm}>Thêm vào giỏ</button>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal: { background:'#fff', borderRadius:12, padding:24, width:480, maxHeight:'85vh', overflowY:'auto', display:'flex', flexDirection:'column', gap:12 },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:12 },
  productName: { fontSize:18, fontWeight:700, color:'#1a1a1a' },
  basePrice: { fontSize:16, color:'#c0392b', fontWeight:600 },
  section: { display:'flex', flexDirection:'column', gap:8 },
  sectionLabel: { fontSize:13, fontWeight:600, color:'#555', textTransform:'uppercase', letterSpacing:0.5 },
  chipRow: { display:'flex', flexWrap:'wrap', gap:8 },
  chip: { padding:'6px 14px', borderRadius:20, border:'1px solid #ddd', background:'#f5f5f5', cursor:'pointer', fontSize:13 },
  chipActive: { padding:'6px 14px', borderRadius:20, border:'1px solid #c0392b', background:'#c0392b', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 },
  qtyRow: { display:'flex', alignItems:'center', gap:16 },
  qtyBtn: { width:36, height:36, borderRadius:'50%', border:'1px solid #ddd', background:'#f5f5f5', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  qtyNum: { fontSize:18, fontWeight:700, minWidth:24, textAlign:'center' },
  noteInput: { width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, boxSizing:'border-box' },
  footer: { borderTop:'1px solid #eee', paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' },
  totalText: { fontSize:16, color:'#1a1a1a' },
  footerBtns: { display:'flex', gap:8 },
  cancelBtn: { padding:'8px 20px', borderRadius:8, border:'1px solid #ddd', background:'#f5f5f5', cursor:'pointer', fontSize:14 },
  confirmBtn: { padding:'8px 20px', borderRadius:8, border:'none', background:'#c0392b', color:'#fff', cursor:'pointer', fontSize:14, fontWeight:600 },
};
