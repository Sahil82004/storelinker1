import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faLock, 
  faCreditCard, 
  faMoneyBill, 
  faCheck,
  faExclamationCircle,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import '../../assets/css/CheckoutPage.css';
import { isLoggedIn, getUserCart, getCurrentUser } from '../../services/authService';
import { createOrder } from '../../services/orderService';
import { formatPrice } from '../../utils/priceFormatter';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  
  // Shipping details
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });
  
  // Payment details
  const [paymentDetails, setPaymentDetails] = useState({
    method: 'creditCard',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      return;
    }
    
    // Load cart
    loadCart();
    
    // Pre-fill user details
    const user = getCurrentUser();
    if (user) {
      setShippingDetails(prevDetails => ({
        ...prevDetails,
        name: user.name,
        email: user.email || ''
      }));
    }
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

  const redirectToLogin = () => {
    // Store the current URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', '/checkout');
    navigate('/login');
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentDetails(prevDetails => ({
      ...prevDetails,
      method
    }));
  };

  const validateShippingDetails = () => {
    const { name, email, phone, address, city, state, zipCode } = shippingDetails;
    
    if (!name || !email || !phone || !address || !city || !state || !zipCode) {
      setError('Please fill in all required fields');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Basic phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Basic zip code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) {
      setError('Please enter a valid ZIP code');
      return false;
    }
    
    setError('');
    return true;
  };

  const validatePaymentDetails = () => {
    const { method, cardName, cardNumber, expiryDate, cvv } = paymentDetails;
    
    if (method === 'creditCard') {
      if (!cardName || !cardNumber || !expiryDate || !cvv) {
        setError('Please fill in all payment details');
        return false;
      }
      
      // Basic card number validation
      const cardNumberRegex = /^\d{16}$/;
      if (!cardNumberRegex.test(cardNumber.replace(/\D/g, ''))) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      
      // Basic expiry date validation (MM/YY)
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRegex.test(expiryDate)) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      // Basic CVV validation
      const cvvRegex = /^\d{3,4}$/;
      if (!cvvRegex.test(cvv)) {
        setError('Please enter a valid CVV');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateShippingDetails()) {
        setCurrentStep(2);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handlePlaceOrder = () => {
    if (!validatePaymentDetails()) {
      return;
    }
    
    // Create order
    const result = createOrder(shippingDetails, paymentDetails);
    
    if (result.success) {
      setOrderSuccess(true);
      setOrderId(result.order.id);
    } else {
      setError(result.message || 'Failed to place order. Please try again.');
    }
  };

  if (showLoginAlert) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="login-required">
            <FontAwesomeIcon icon={faLock} className="lock-icon" />
            <h2>Login Required</h2>
            <p>Please log in to proceed with checkout</p>
            <button className="login-btn" onClick={redirectToLogin}>
              Log In / Register
            </button>
            <Link to="/cart" className="back-to-cart">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your purchase. Your order has been confirmed.</p>
            <div className="order-info">
              <p><strong>Order ID:</strong> {orderId}</p>
              <p><strong>Total Amount:</strong> {formatPrice(total)}</p>
              <p>A confirmation email has been sent to your email address.</p>
            </div>
            <div className="success-actions">
              <Link to="/orders" className="view-orders-btn">
                View My Orders
              </Link>
              <Link to="/" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart-message">
            <FontAwesomeIcon icon={faShoppingCart} className="cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart before proceeding to checkout.</p>
            <Link to="/" className="continue-shopping-btn">
              <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <span>Shipping</span>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <span>Payment</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="checkout-content">
          <div className="checkout-form">
            {currentStep === 1 ? (
              <div className="shipping-form">
                <h2>Shipping Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={shippingDetails.name}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={shippingDetails.email}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={shippingDetails.phone}
                      onChange={handleShippingChange}
                      placeholder="e.g., 1234567890"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address">Street Address *</label>
                    <input 
                      type="text" 
                      id="address" 
                      name="address" 
                      value={shippingDetails.address}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input 
                      type="text" 
                      id="city" 
                      name="city" 
                      value={shippingDetails.city}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input 
                      type="text" 
                      id="state" 
                      name="state" 
                      value={shippingDetails.state}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code *</label>
                    <input 
                      type="text" 
                      id="zipCode" 
                      name="zipCode" 
                      value={shippingDetails.zipCode}
                      onChange={handleShippingChange}
                      placeholder="e.g., 12345"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select 
                      id="country" 
                      name="country" 
                      value={shippingDetails.country}
                      onChange={handleShippingChange}
                    >
                      <option value="USA">United States</option>
                      <option value="CAN">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AUS">Australia</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-actions">
                  <Link to="/cart" className="back-button">
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Cart
                  </Link>
                  <button className="next-button" onClick={handleNextStep}>
                    Continue to Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="payment-form">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  <div 
                    className={`payment-method ${paymentDetails.method === 'creditCard' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('creditCard')}
                  >
                    <FontAwesomeIcon icon={faCreditCard} />
                    <span>Credit Card</span>
                  </div>
                  <div 
                    className={`payment-method ${paymentDetails.method === 'paypal' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('paypal')}
                  >
                    <FontAwesomeIcon icon={faPaypal} />
                    <span>PayPal</span>
                  </div>
                  <div 
                    className={`payment-method ${paymentDetails.method === 'cashOnDelivery' ? 'active' : ''}`}
                    onClick={() => handlePaymentMethodChange('cashOnDelivery')}
                  >
                    <FontAwesomeIcon icon={faMoneyBill} />
                    <span>Cash on Delivery</span>
                  </div>
                </div>
                
                {paymentDetails.method === 'creditCard' && (
                  <div className="credit-card-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="cardName">Name on Card *</label>
                        <input 
                          type="text" 
                          id="cardName" 
                          name="cardName" 
                          value={paymentDetails.cardName}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number *</label>
                        <input 
                          type="text" 
                          id="cardNumber" 
                          name="cardNumber" 
                          value={paymentDetails.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date *</label>
                        <input 
                          type="text" 
                          id="expiryDate" 
                          name="expiryDate" 
                          value={paymentDetails.expiryDate}
                          onChange={handlePaymentChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cvv">CVV *</label>
                        <input 
                          type="text" 
                          id="cvv" 
                          name="cvv" 
                          value={paymentDetails.cvv}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentDetails.method === 'paypal' && (
                  <div className="paypal-info">
                    <p>You will be redirected to PayPal to complete your payment.</p>
                  </div>
                )}
                
                {paymentDetails.method === 'cashOnDelivery' && (
                  <div className="cod-info">
                    <p>You will pay when your order is delivered.</p>
                    <p>Additional fee may apply for cash on delivery.</p>
                  </div>
                )}
                
                <div className="form-actions">
                  <button className="back-button" onClick={handlePreviousStep}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Shipping
                  </button>
                  <button className="place-order-button" onClick={handlePlaceOrder}>
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-vendor">Sold by: {item.vendor}</p>
                    <div className="item-price-qty">
                      <span className="item-price">${item.price.toFixed(2)}</span>
                      <span className="item-qty">Qty: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="price-details">
              <div className="price-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="price-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 