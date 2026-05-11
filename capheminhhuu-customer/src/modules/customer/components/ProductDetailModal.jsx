import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogContent, Box, Typography, IconButton,
    Button, Chip, Divider, CircularProgress, Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from '../../../common/utils/axiosCustomize';
import toast from 'react-hot-toast';

const COLORS = {
    primary: '#3D1A0A',
    accent:  '#C8860A',
    surface: '#FDF6F0',
    muted:   '#8B6F5E',
};

const SUGAR_OPTIONS  = ['100%', '70%', '50%', '30%', '0%'];
const ICE_OPTIONS    = ['100%', '70%', '50%', '30%', '0%'];

const ProductDetailModal = ({ product, open, onClose, onAddToCart }) => {
    const [sizes, setSizes]               = useState([]);
    const [toppings, setToppings]         = useState([]);
    const [loading, setLoading]           = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedToppings, setSelectedToppings] = useState([]);
    const [sugarLevel, setSugarLevel]     = useState('100%');
    const [iceLevel, setIceLevel]         = useState('100%');
    const [quantity, setQuantity]         = useState(1);

    useEffect(() => {
        if (!open || !product) return;
        setSelectedSize(null);
        setSelectedToppings([]);
        setSugarLevel('100%');
        setIceLevel('100%');
        setQuantity(1);
        const fetchOptions = async () => {
            setLoading(true);
            try {
                const [sizesRes, toppingsRes] = await Promise.all([
                    axios.get(`/Product/${product.id}/sizes`),
                    axios.get('/Topping')
                ]);
                setSizes(sizesRes || []);
                setToppings(toppingsRes || []);
                if (sizesRes?.length > 0) setSelectedSize(sizesRes[0]);
            } catch {
                toast.error('Không tải được tùy chọn');
            } finally {
                setLoading(false);
            }
        };
        fetchOptions();
    }, [open, product]);

    const toggleTopping = (topping) => {
        setSelectedToppings(prev =>
            prev.find(t => t.id === topping.id)
                ? prev.filter(t => t.id !== topping.id)
                : [...prev, topping]
        );
    };

    const basePrice   = product?.price || 0;
    const sizeExtra   = selectedSize?.priceExtra || 0;
    const toppingSum  = selectedToppings.reduce((s, t) => s + t.price, 0);
    const unitPrice   = basePrice + sizeExtra + toppingSum;
    const totalPrice  = unitPrice * quantity;

    const handleAddToCart = () => {
        const cartItem = {
            id:             product.id,
            name:           product.name,
            price:          unitPrice,
            imageUrl:       product.imageUrl,
            quantity,
            sizeLabel:      selectedSize?.label || null,
            sugarLevel,
            iceLevel,
            toppings:       selectedToppings.map(t => ({ toppingId: t.id, quantity: 1 })),
            note:           null,
            displayOptions: [
                selectedSize?.label,
                `Đường ${sugarLevel}`,
                `Đá ${iceLevel}`,
                ...selectedToppings.map(t => t.name)
            ].filter(Boolean).join(', ')
        };
        onAddToCart(cartItem);
        onClose();
    };

    if (!product) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 4, m: 1 } }}>
            <DialogContent sx={{ p: 0, bgcolor: COLORS.surface }}>
                {/* Product Image */}
                <Box sx={{ position: 'relative' }}>
                    {product.imageUrl ? (
                        <Box component="img" src={product.imageUrl} alt={product.name}
                            sx={{ width: '100%', height: 200, objectFit: 'cover' }} />
                    ) : (
                        <Box sx={{
                            height: 200, bgcolor: '#f5ece6',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 72
                        }}>☕</Box>
                    )}
                    <IconButton onClick={onClose} sx={{
                        position: 'absolute', top: 8, right: 8,
                        bgcolor: 'rgba(0,0,0,0.4)', color: '#fff',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }
                    }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2 }}>
                    {/* Name + Price */}
                    <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.primary }}>
                        {product.name}
                    </Typography>
                    {product.description && (
                        <Typography variant="body2" sx={{ color: COLORS.muted, mt: 0.5 }}>
                            {product.description}
                        </Typography>
                    )}
                    <Typography sx={{ color: COLORS.accent, fontWeight: 800, fontSize: 18, mt: 1 }}>
                        {unitPrice.toLocaleString('vi-VN')}đ
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={28} sx={{ color: COLORS.accent }} />
                        </Box>
                    ) : (
                        <>
                            {/* Sizes */}
                            {sizes.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                                        Kích cỡ
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {sizes.map(size => (
                                            <Chip key={size.id}
                                                label={`${size.label}${size.priceExtra > 0 ? ` +${size.priceExtra.toLocaleString('vi-VN')}đ` : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                                sx={{
                                                    bgcolor: selectedSize?.id === size.id ? COLORS.primary : '#fff',
                                                    color:   selectedSize?.id === size.id ? '#fff' : COLORS.primary,
                                                    border:  `1px solid ${COLORS.primary}`,
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Sugar */}
                            <Box sx={{ mt: 2 }}>
                                <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                                    Lượng đường
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {SUGAR_OPTIONS.map(opt => (
                                        <Chip key={opt} label={opt}
                                            onClick={() => setSugarLevel(opt)}
                                            sx={{
                                                bgcolor: sugarLevel === opt ? COLORS.accent : '#fff',
                                                color:   sugarLevel === opt ? '#fff' : COLORS.muted,
                                                border:  `1px solid #f0e6dc`,
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* Ice */}
                            <Box sx={{ mt: 2 }}>
                                <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                                    Lượng đá
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {ICE_OPTIONS.map(opt => (
                                        <Chip key={opt} label={opt}
                                            onClick={() => setIceLevel(opt)}
                                            sx={{
                                                bgcolor: iceLevel === opt ? '#3B82F6' : '#fff',
                                                color:   iceLevel === opt ? '#fff' : COLORS.muted,
                                                border:  `1px solid #f0e6dc`,
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* Toppings */}
                            {toppings.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>
                                        Topping
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {toppings.map(t => (
                                            <Chip key={t.id}
                                                label={`${t.name} +${t.price.toLocaleString('vi-VN')}đ`}
                                                onClick={() => toggleTopping(t)}
                                                sx={{
                                                    bgcolor: selectedToppings.find(s => s.id === t.id) ? COLORS.primary : '#fff',
                                                    color:   selectedToppings.find(s => s.id === t.id) ? '#fff' : COLORS.primary,
                                                    border:  `1px solid ${COLORS.primary}`,
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Quantity + Add */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton size="small" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                sx={{ border: `1px solid ${COLORS.primary}`, p: 0.5 }}>
                                <RemoveIcon fontSize="small" sx={{ color: COLORS.primary }} />
                            </IconButton>
                            <Typography sx={{ fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                                {quantity}
                            </Typography>
                            <IconButton size="small" onClick={() => setQuantity(q => q + 1)}
                                sx={{ bgcolor: COLORS.primary, p: 0.5, '&:hover': { bgcolor: COLORS.accent } }}>
                                <AddIcon fontSize="small" sx={{ color: '#fff' }} />
                            </IconButton>
                        </Box>
                        <Button fullWidth variant="contained" onClick={handleAddToCart}
                            sx={{
                                bgcolor: COLORS.primary, py: 1.2, borderRadius: 3,
                                fontWeight: 700, textTransform: 'none', fontSize: 15,
                                '&:hover': { bgcolor: COLORS.accent }
                            }}>
                            Thêm vào giỏ · {totalPrice.toLocaleString('vi-VN')}đ
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDetailModal;
