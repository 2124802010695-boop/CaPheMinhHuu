import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Grid, Card, CardMedia, CardContent,
    Chip, TextField, InputAdornment, Badge, IconButton,
    Tabs, Tab, Skeleton, Fab, AppBar, Toolbar, useTheme,
    CardActions, Container
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddIcon from '@mui/icons-material/Add';
import toast from 'react-hot-toast';
import { getProductsAPI, getCategoriesAPI } from '../services/menuService';
import ProductDetailModal from '../components/ProductDetailModal';

const Menu = () => {
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const tableIdFromQuery = searchParams.get('tableId');
    if (tableIdFromQuery) sessionStorage.setItem('tableId', tableIdFromQuery);
    const tableId = tableIdFromQuery || sessionStorage.getItem('tableId');
    
    const navigate = useNavigate();

    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [activeTab, setActiveTab]   = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalOpen, setModalOpen]             = useState(false);
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

    const openModal = (product) => {
        if (!product.isActive) { toast.error('Món này tạm hết'); return; }
        setSelectedProduct(product);
        setModalOpen(true);
    };

    const addToCart = (cartItem) => {
        const toppingKey = (cartItem.toppings || [])
            .map(t => t.toppingId)
            .sort((a, b) => a - b)
            .join(',');
        
        const compositeKey = `${cartItem.id}_${cartItem.sizeLabel || 'Default'}_${cartItem.sugarLevel}_${cartItem.iceLevel}_${toppingKey}`;
        cartItem.cartKey = compositeKey;

        setCart(prev => {
            const existing = prev.find(i => i.cartKey === compositeKey);
            if (existing)
                return prev.map(i =>
                    i.cartKey === compositeKey
                        ? { ...i, quantity: i.quantity + cartItem.quantity }
                        : i
                );
            return [...prev, cartItem];
        });
        toast.success(`Đã thêm ${cartItem.name}`);
    };

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const cartTotal = cart.reduce((s, i) => s + i.quantity * i.price, 0);

    return (
        <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh', pb: 12 }}>
            {/* Sticky AppBar */}
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: theme.palette.primary.main, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 24 }}>☕</Typography>
                        <Typography variant="h6" sx={{ 
                            color: theme.palette.secondary.main, 
                            fontWeight: 700,
                            letterSpacing: '-0.5px'
                        }}>
                            Minh Hữu Coffee
                        </Typography>
                    </Box>
                    <IconButton 
                        color="inherit" 
                        onClick={() => navigate('/cart', { state: { tableId } })}
                    >
                        <Badge badgeContent={cartCount} color="secondary">
                            <ShoppingBagIcon />
                        </Badge>
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Table Info & Search */}
            <Box sx={{ px: 2, pt: 3, pb: 1 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, ml: 1, fontWeight: 600 }}>
                    {tableId ? `🪑 Bàn số: ${tableId}` : '🥡 Đang mang đi'}
                </Typography>
                
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm món ngon..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: theme.palette.primary.main }} />
                            </InputAdornment>
                        )
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#fff',
                            boxShadow: '0 4px 12px rgba(61,26,10,0.05)'
                        }
                    }}
                />
            </Box>

            {/* Sticky Category Tabs */}
            <Box sx={{ 
                position: 'sticky', 
                top: 56, 
                zIndex: 10, 
                bgcolor: theme.palette.background.default,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                mb: 2
            }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 1,
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                        '& .MuiTab-root': { 
                            textTransform: 'none', 
                            fontWeight: 600, 
                            fontSize: 14,
                            minWidth: 'auto',
                            px: 2
                        }
                    }}
                >
                    <Tab label="Tất cả" />
                    {categories.map((cat, i) => (
                        <Tab key={cat.id} value={i + 1} label={cat.name} />
                    ))}
                </Tabs>
            </Box>

            {/* Product Grid */}
            <Container maxWidth="md" sx={{ px: 2 }}>
                {loading ? (
                    <Grid container spacing={2}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Grid item xs={6} sm={4} key={i}>
                                <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
                            </Grid>
                        ))}
                    </Grid>
                ) : filteredProducts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography sx={{ fontSize: 64, mb: 2 }}>☕</Typography>
                        <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                            Chưa có món nào
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                            Vui lòng thử tìm với từ khóa khác
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {filteredProducts.map(product => (
                            <Grid item xs={6} sm={4} key={product.id}>
                                <Card elevation={0} sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: '#fff',
                                    border: '1px solid rgba(0,0,0,0.04)',
                                    position: 'relative',
                                    '&:hover': {
                                        boxShadow: '0 12px 30px rgba(61,26,10,0.12)'
                                    }
                                }}>
                                    <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
                                        {product.imageUrl ? (
                                            <CardMedia 
                                                component="img"
                                                image={product.imageUrl} 
                                                alt={product.name}
                                                sx={{ 
                                                    position: 'absolute', top: 0, left: 0,
                                                    width: '100%', height: '100%',
                                                    objectFit: 'cover' 
                                                }} 
                                            />
                                        ) : (
                                            <Box sx={{
                                                position: 'absolute', top: 0, left: 0,
                                                width: '100%', height: '100%',
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 40
                                            }}>☕</Box>
                                        )}
                                        {!product.isActive && (
                                            <Box sx={{
                                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                                bgcolor: 'rgba(255,255,255,0.7)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                zIndex: 1
                                            }}>
                                                <Chip label="Hết hàng" color="error" size="small" sx={{ fontWeight: 700 }} />
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    <CardContent sx={{ p: 1.5, flexGrow: 1 }}>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 700, 
                                            color: theme.palette.text.primary,
                                            mb: 0.5,
                                            height: 40,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.3
                                        }}>
                                            {product.name}
                                        </Typography>
                                        <Typography sx={{ 
                                            color: theme.palette.secondary.main, 
                                            fontWeight: 800, 
                                            fontSize: 16,
                                            fontFamily: "'Playfair Display', serif"
                                        }}>
                                            {product.price.toLocaleString('vi-VN')}đ
                                        </Typography>
                                    </CardContent>

                                    <CardActions sx={{ p: 1, pt: 0 }}>
                                        <Button 
                                            fullWidth 
                                            variant="contained" 
                                            size="small"
                                            disabled={!product.isActive}
                                            onClick={() => openModal(product)}
                                            sx={{ height: 36, fontSize: 13 }}
                                        >
                                            Thêm +
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Floating Cart Button (Optional, using AppBar badge but keep for UX if needed) */}
            {cartCount > 0 && (
                <Fab 
                    variant="extended" 
                    onClick={() => navigate('/cart', { state: { tableId } })}
                    sx={{
                        position: 'fixed', bottom: 20, left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: theme.palette.primary.main,
                        color: '#fff',
                        px: 3,
                        boxShadow: '0 8px 32px rgba(61,26,10,0.4)',
                        zIndex: 1000,
                        '&:hover': { bgcolor: theme.palette.secondary.main }
                    }}
                >
                    <ShoppingBagIcon sx={{ mr: 1 }} />
                    Giỏ hàng · {cartTotal.toLocaleString('vi-VN')}đ
                </Fab>
            )}

            <ProductDetailModal
                product={selectedProduct}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAddToCart={addToCart}
            />
        </Box>
    );
};

export default Menu;
