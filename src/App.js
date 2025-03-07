import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import CartPage from './components/pages/CartPage';
import OffersPage from './components/pages/OffersPage';
import VendorDashboard from './components/pages/VendorDashboard';
import VendorLoginPage from './components/pages/VendorLoginPage';
import AddProductPage from './components/pages/AddProductPage';
import EditProductPage from './components/pages/EditProductPage';
import VendorRegisterPage from './components/pages/VendorRegisterPage';
import ProductListingPage from './components/pages/ProductListingPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import CheckoutPage from './components/pages/CheckoutPage';
import OrdersPage from './components/pages/OrdersPage';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import { isLoggedIn, mockLogin } from './services/authService';
import { CartProvider } from './context/CartContext';
import './assets/css/App.css';

function App() {
  // Auto-login for development purposes
  useEffect(() => {
    // Check if user is already logged in
    if (!isLoggedIn()) {
      // Auto-login with test account
      mockLogin('john@example.com', 'password123');
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Vendor Routes - No Header/Footer */}
            <Route path="/vendor-login" element={<VendorLoginPage />} />
            <Route path="/vendor-register" element={<VendorRegisterPage />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/edit-product/:productId" element={<EditProductPage />} />
            
            {/* Customer Routes - With Header/Footer */}
            <Route path="*" element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/offers" element={<OffersPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/category/:category" element={<ProductListingPage />} />
                    <Route path="/product/:productId" element={<ProductDetailPage />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
