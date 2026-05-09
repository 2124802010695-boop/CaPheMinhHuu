import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import LayoutCustomer from './modules/customer/layout/LayoutCustomer';
import Menu from './modules/customer/pages/Menu';
import Cart from './modules/customer/pages/Cart';
import CustomerLogin from './modules/customer/pages/CustomerLogin';
import OrderTracking from './modules/customer/pages/OrderTracking';
import PaymentCallback from './modules/customer/pages/PaymentCallback';
import Profile from './modules/customer/pages/Profile';
import ConfirmOrder from './modules/customer/pages/ConfirmOrder';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <Toaster position="top-center" />
                <Routes>
                    <Route path="/" element={<LayoutCustomer />}>
                        <Route index element={<Navigate to="/menu" replace />} />
                        <Route path="menu" element={<Menu />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="login" element={<CustomerLogin />} />
                        <Route path="tracking/:orderCode" element={<OrderTracking />} />
                        <Route path="payment/callback" element={<PaymentCallback />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="confirm-order" element={<ConfirmOrder />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;
