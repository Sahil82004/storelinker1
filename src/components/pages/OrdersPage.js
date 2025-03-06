import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faLock, 
  faShoppingBag, 
  faSearch,
  faExclamationCircle,
  faEye,
  faFileInvoice,
  faBoxOpen
} from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/OrdersPage.css';
import { isLoggedIn, getCurrentUser } from '../../services/authService';
import { getUserOrders, createMockOrders } from '../../services/orderService';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      return;
    }
    
    // Create mock orders for testing
    createMockOrders();
    
    // Load orders
    loadOrders();
  }, []);

  const loadOrders = () => {
    setLoading(true);
    
    // Get orders from order service
    const userOrders = getUserOrders();
    setOrders(userOrders);
    
    setLoading(false);
  };

  const redirectToLogin = () => {
    // Store the current URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', '/orders');
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const filteredOrders = orders.filter(order => {
    // Filter by search query
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'status-processing';
      case 'confirmed':
        return 'status-confirmed';
      case 'shipped':
        return 'status-shipped';
      case 'out for delivery':
        return 'status-out-for-delivery';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (showLoginAlert) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="login-required">
            <FontAwesomeIcon icon={faLock} className="lock-icon" />
            <h2>Login Required</h2>
            <p>Please log in to view your orders</p>
            <button className="login-btn" onClick={redirectToLogin}>
              Log In / Register
            </button>
            <Link to="/" className="back-to-home">
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <Link to="/" className="back-to-home">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
          </Link>
        </div>
        
        <div className="orders-controls">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="filter-dropdown">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select 
              id="status-filter" 
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <h3>Order #{order.id}</h3>
                    <span className={`order-status ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-date">
                    <span>Placed on: {formatDate(order.createdAt)}</span>
                  </div>
                </div>
                
                <div className="order-items">
                  {order.items.map(item => (
                    <div key={`${order.id}-${item.id}`} className="order-item">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-vendor">Sold by: {item.vendor}</p>
                        <div className="item-price-qty">
                          <span className="item-price">${item.price.toFixed(2)}</span>
                          <span className="item-qty">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <span className="total-amount">${order.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="order-actions">
                    <button className="action-btn view-details">
                      <FontAwesomeIcon icon={faEye} /> View Details
                    </button>
                    <button className="action-btn track-order">
                      <FontAwesomeIcon icon={faBoxOpen} /> Track Order
                    </button>
                    <button className="action-btn view-invoice">
                      <FontAwesomeIcon icon={faFileInvoice} /> Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders">
            <FontAwesomeIcon icon={faShoppingBag} className="no-orders-icon" />
            <h2>No Orders Found</h2>
            {searchQuery || filterStatus !== 'all' ? (
              <p>No orders match your search criteria. Try adjusting your filters.</p>
            ) : (
              <>
                <p>You haven't placed any orders yet.</p>
                <Link to="/" className="start-shopping-btn">
                  Start Shopping
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 