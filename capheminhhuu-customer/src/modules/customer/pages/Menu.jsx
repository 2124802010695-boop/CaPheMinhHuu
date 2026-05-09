import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Grid, Card, CardMedia, CardContent,
    Chip, TextField, InputAdornment, Badge, IconButton,
    Tabs, Tab, Skeleton, Fab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';
import { getProductsAPI, getCategoriesAPI } from '../services/menuService';

const COLORS = {
    primary: '#3D1A0A',
    accent:  '#C8860A',
    surface: '#FDF6F0',
    card:    '#FFFFFF',
    muted:   '#8B6F5E',
};

const Menu = () => {
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('tableId');
    const navigate = useNavigate();

    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [activeTab, setActiveTab]   = useState(0);
    const [cart, setCart]             = useState(() => {
        try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
        catch { return []; }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prods, cats] = await Promise.all([
                    getProductsAPI(),
                    getCategoriesAPI()
                ]);
                setProducts(prods || []);
                setCategories(cats || []);
            } catch {
                toast.error('Không tải được menu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const filteredProducts = useMemo(() => {
        let list = products;
        if (activeTab > 0 && categories[activeTab - 1]) {
            list = list.filter(p => p.categoryId === categories[activeTab - 1].id);
        }
        if (search.trim()) {
            list = list.filter(p =>
                p.name.toLowerCase().includes(search.toLowerCase()));
        }
        return list;
    }, [products, categories, activeTab, search]);

    const addToCart = (product) => {
        if (!product.isActive) { toast.error('Món này tạm hết'); return; }
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing)
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { ...product, quantity: 1, note: '' }];
        });
        toast.success(`Đã thêm ${product.name}`);
    };

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    return (
        <Box sx={{ bgcolor: COLORS.surface, minHeight: '100vh', pb: 10 }}>
            {/* Header */}
            <Box sx={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #6B2D0A 100%)`,
                px: 3, pt: 5, pb: 4, position: 'relative'
            }}>
                <Typography variant="h4" sx={{
                    fontFamily: '"Playfair Display", serif',
                    color: '#FDF6F0', fontWeight: 800, mb: 0.5
                }}>
                    Cà Phê Minh Hữu
                </Typography>
                <Typography variant="body2" sx={{ color: '#C8860A', fontWeight: 500 }}>
                    {tableId ? `🪑 Bàn ${tableId}` : '☕ Precision Craft Coffee'}
                </Typography>

                {/* Search */}
                <TextField
                    fullWidth size="small"
                    placeholder="Tìm món..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    sx={{
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.12)',
                            borderRadius: 3,
                            color: '#fff',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: COLORS.accent },
                        },
                        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.6)' }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: COLORS.accent }} />
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {/* Category Tabs */}
            <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #f0e6dc' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable" scrollButtons="auto"
                    sx={{
                        '& .Mui-selected': { color: `${COLORS.primary} !important`, fontWeight: 700 },
                        '& .MuiTabs-indicator': { bgcolor: COLORS.accent, height: 3 },
                    }}
                >
                    <Tab label="Tất cả" sx={{ textTransform: 'none', fontWeight: 500 }} />
                    {categories.map((cat, i) => (
                        <Tab key={cat.id} value={i + 1}
                            label={cat.name}
                            sx={{ textTransform: 'none', fontWeight: 500 }} />
                    ))}
                </Tabs>
            </Box>

            {/* Product Grid */}
            <Box sx={{ px: 2, pt: 2 }}>
                {loading ? (
                    <Grid container spacing={2}>
                        {[1,2,3,4,5,6].map(i => (
                            <Grid item xs={6} sm={4} key={i}>
                                <Skeleton variant="rounded" height={200} />
                            </Grid>
                        ))}
                    </Grid>
                ) : filteredProducts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography sx={{ color: COLORS.muted }}>Không tìm thấy món nào</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {filteredProducts.map(product => (
                            <Grid item xs={6} sm={4} md={3} key={product.id}>
                                <Card elevation={0} sx={{
                                    borderRadius: 3,
                                    border: '1px solid #f0e6dc',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(61,26,10,0.12)' },
                                    opacity: product.isActive ? 1 : 0.6,
                                }}>
                                    <Box sx={{ position: 'relative' }}>
                                        {product.imageUrl ? (
                                            <CardMedia component="img" height="130"
                                                image={product.imageUrl} alt={product.name}
                                                sx={{ objectFit: 'cover' }} />
                                        ) : (
                                            <Box sx={{
                                                height: 130, bgcolor: '#f5ece6',
                                                display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: 48
                                            }}>☕</Box>
                                        )}
                                        {!product.isActive && (
                                            <Chip label="Hết" size="small" sx={{
                                                position: 'absolute', top: 8, right: 8,
                                                bgcolor: '#ef4444', color: '#fff', fontWeight: 700
                                            }} />
                                        )}
                                    </Box>
                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 700, color: COLORS.primary,
                                            mb: 0.5, lineHeight: 1.3,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {product.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ color: COLORS.accent, fontWeight: 800, fontSize: 15 }}>
                                                {product.price.toLocaleString('vi-VN')}đ
                                            </Typography>
                                            <IconButton size="small" onClick={() => addToCart(product)}
                                                sx={{
                                                    bgcolor: COLORS.primary, color: '#fff', p: 0.5,
                                                    '&:hover': { bgcolor: COLORS.accent }
                                                }}>
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* FAB Cart */}
            {cartCount > 0 && (
                <Fab variant="extended" onClick={() => navigate('/cart', { state: { tableId } })}
                    sx={{
                        position: 'fixed', bottom: 24, right: 24,
                        bgcolor: COLORS.primary, color: '#fff',
                        fontWeight: 700, textTransform: 'none',
                        '&:hover': { bgcolor: COLORS.accent },
                        boxShadow: '0 8px 24px rgba(61,26,10,0.3)',
                        gap: 1
                    }}>
                    <Badge badgeContent={cartCount} color="error">
                        <ShoppingCartIcon />
                    </Badge>
                    <Box sx={{ ml: 1 }}>
                        Giỏ hàng · {cart.reduce((s,i) => s + i.quantity * i.price, 0).toLocaleString('vi-VN')}đ
                    </Box>
                </Fab>
            )}
        </Box>
    );
};

export default Menu;
