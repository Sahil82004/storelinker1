import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faAngleRight, faShoppingCart, faArrowLeft, faLock, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/CartPage.css';
import { isLoggedIn, getUserCart, updateCartItemQuantity, removeFromCart, clearCart } from '../../../src/services/authService';
import { formatPrice } from '../../utils/priceFormatter';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    loadCart();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', loadCart);
    window.addEventListener('userLogin', loadCart);
    window.addEventListener('userLogout', loadCart);
    
    return () => {
      window.removeEventListener('cartUpdated', loadCart);
      window.removeEventListener('userLogin', loadCart);
      window.removeEventListener('userLogout', loadCart);
    };
  }, []);

  const loadCart = () => {
    // Get cart from auth service
    const cartData = getUserCart();
    setCart(cartData);
    
    // Calculate cart totals
    let cartSubtotal = 0;
    
    cartData.forEach(item => {
      cartSubtotal += item.price * item.quantity;
    });
    
    // Calculate shipping (free over $100)
    const shippingCost = cartSubtotal >= 100 ? 0 : 10;
    
    // Calculate tax (8%)
    const taxAmount = cartSubtotal * 0.08;
    
    // Calculate total
    const totalAmount = cartSubtotal + shippingCost + taxAmount;
    
    setSubtotal(cartSubtotal);
    setShipping(shippingCost);
    setTax(taxAmount);
    setTotal(totalAmount);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    
    if (newQuantity < 1) {
      // Ask for confirmation before removing
      if (window.confirm('Are you sure you want to remove this item from your cart?')) {
        handleRemoveFromCart(productId);
      }
      return;
    }
    
    // Update quantity using auth service
    updateCartItemQuantity(productId, newQuantity);
    
    // Reload cart
    loadCart();
  };

  const handleRemoveFromCart = (productId) => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    
    // Remove item using auth service
    removeFromCart(productId);
    
    // Show notification
    showNotification('Product removed from cart.', 'success');
    
    // Reload cart
    loadCart();
  };

  const handleClearCart = () => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    
    if (window.confirm('Are you sure you want to clear your cart?')) {
      // Clear cart using auth service
      clearCart();
      
      showNotification('Cart has been cleared.', 'success');
      loadCart();
    }
  };

  const handleUpdateCart = () => {
    // This function would typically sync with the server
    // For this demo, we'll just show a notification
    showNotification('Cart updated successfully.', 'success');
  };

  const redirectToLogin = () => {
    // Store the current URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', '/cart');
    navigate('/login');
  };

  const proceedToCheckout = () => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    
    // Navigate to checkout
    navigate('/checkout');
  };

  const showNotification = (message, type) => {
    // Create a notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <p>${message}</p>
      </div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.style.animation = 'slideOut 0.3s forwards';
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, 5000);
  };

  return (
    <section className="cart-section">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <div className="cart-breadcrumb">
            <Link to="/">Home</Link>
            <FontAwesomeIcon icon={faAngleRight} />
            <span>Shopping Cart</span>
          </div>
        </div>
        
        {showLoginAlert && (
          <div className="login-alert">
            <FontAwesomeIcon icon={faLock} className="lock-icon" />
            <div className="login-alert-message">
              <p>Please log in to manage your cart</p>
              <button className="login-btn" onClick={redirectToLogin}>
                Log In / Register
              </button>
            </div>
            <button className="close-alert" onClick={() => setShowLoginAlert(false)}>×</button>
          </div>
        )}
        
        {cart.length === 0 ? (
          <div className="empty-cart">
            <FontAwesomeIcon icon={faShoppingCart} className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any products to your cart yet.</p>
            <Link to="/" className="continue-shopping">
              <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-items">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} data-id={item.id}>
                      <td data-label="Product">
                        <div className="cart-product">
                          <img 
                            src={item.image || 'https://via.placeholder.com/80x80'} 
                            alt={item.name} 
                            className="cart-product-image" 
                          />
                          <div className="cart-product-info">
                            <h3>{item.name}</h3>
                            <p>Product ID: {item.id}</p>
                            <span className="cart-product-vendor">Sold by: {item.vendor || 'StoreLinker'}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Price" className="cart-price">{formatPrice(item.price)}</td>
                      <td data-label="Quantity">
                        <div className="cart-quantity">
                          <button 
                            className="quantity-decrease" 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >-</button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            min="1" 
                            max="99" 
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                          />
                          <button 
                            className="quantity-increase" 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >+</button>
                        </div>
                      </td>
                      <td data-label="Subtotal" className="cart-subtotal">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                      <td>
                        <button 
                          className="cart-remove" 
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="cart-actions">
                <div className="cart-coupon">
                  <input type="text" placeholder="Coupon code" />
                  <button className="btn btn-primary">Apply Coupon</button>
                </div>
                
                <div className="cart-buttons">
                  <button className="cart-update" onClick={handleUpdateCart}>Update Cart</button>
                  <button className="cart-clear" onClick={handleClearCart}>Clear Cart</button>
                </div>
              </div>
            </div>
            
            <div className="cart-summary">
              <div className="cart-summary-box">
                <h2 className="cart-summary-title">Cart Summary</h2>
                
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Subtotal</span>
                  <span className="cart-summary-value">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Shipping</span>
                  <span className="cart-summary-value">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Tax (8%)</span>
                  <span className="cart-summary-value">{formatPrice(tax)}</span>
                </div>
                
                <div className="cart-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                
                <button 
                  className="checkout-btn" 
                  onClick={proceedToCheckout}
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout
                </button>
                
                <div className="payment-methods">
                  <p>We accept:</p>
                  <div className="payment-icons">
                    <span className="payment-icon">Visa</span>
                    <span className="payment-icon">Mastercard</span>
                    <span className="payment-icon">PayPal</span>
                    <span className="payment-icon">Amex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartPage; 