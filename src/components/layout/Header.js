import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faExchangeAlt, faTag, faShoppingCart, faUser, faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/Header.css';
import { isLoggedIn, getCurrentUser, logout, getUserCart } from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Update cart count and user whenever localStorage changes
  useEffect(() => {
    const updateCartAndUser = () => {
      // Get cart from auth service
      const cart = getUserCart();
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
      
      // Get current user
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    // Initial update
    updateCartAndUser();

    // Listen for storage events (when cart is updated)
    window.addEventListener('storage', updateCartAndUser);

    // Custom events for cart updates and user login/logout
    window.addEventListener('cartUpdated', updateCartAndUser);
    window.addEventListener('userLogin', updateCartAndUser);
    window.addEventListener('userLogout', updateCartAndUser);

    return () => {
      window.removeEventListener('storage', updateCartAndUser);
      window.removeEventListener('cartUpdated', updateCartAndUser);
      window.removeEventListener('userLogin', updateCartAndUser);
      window.removeEventListener('userLogout', updateCartAndUser);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header>
      <div className="main-header">
        <div className="container">
          <div className="main-header-content">
            <div className="logo">
              <Link to="/">
                <h1>StoreLinker</h1>
              </Link>
            </div>
            
            <div className="search-bar">
              <form action="#" method="get">
                <input type="text" placeholder="Search for products..." />
                <button type="submit"><FontAwesomeIcon icon={faSearch} /></button>
              </form>
            </div>
            
            <div className="header-actions">
              <div className="action-item compare">
                <Link to="/compare">
                  <FontAwesomeIcon icon={faExchangeAlt} />
                  <span>Compare</span>
                  <span className="badge">0</span>
                </Link>
              </div>
              
              <div className="action-item offers">
                <Link to="/offers">
                  <FontAwesomeIcon icon={faTag} />
                  <span>Offers</span>
                </Link>
              </div>
              
              <div className="action-item cart">
                <Link to="/cart">
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span>Cart</span>
                  <span className="badge">{cartCount}</span>
                </Link>
              </div>
              
              <div className="action-item account">
                {user ? (
                  <div className="user-account" onClick={toggleUserMenu}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>{user.name}</span>
                    {showUserMenu && (
                      <div className="user-menu">
                        <Link to="/profile">My Profile</Link>
                        <Link to="/orders">My Orders</Link>
                        <button onClick={handleLogout}>
                          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login">
                    <FontAwesomeIcon icon={faUser} />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="main-nav">
        <div className="container">
          <ul className="nav-list">
            <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>
            <li className="nav-item categories">
              <Link to="#" className="nav-link">
                <FontAwesomeIcon icon={faBars} /> Categories
              </Link>
              <div className="dropdown-menu">
                <ul>
                  <li><Link to="/category/electronics">Electronics</Link></li>
                  <li><Link to="/category/fashion">Fashion</Link></li>
                  <li><Link to="/category/home">Home & Garden</Link></li>
                  <li><Link to="/category/beauty">Beauty & Health</Link></li>
                  <li><Link to="/category/sports">Sports & Outdoors</Link></li>
                  <li><Link to="/category/toys">Toys & Games</Link></li>
                  <li><Link to="/category/books">Books & Media</Link></li>
                  <li><Link to="/category/automotive">Automotive</Link></li>
                </ul>
              </div>
            </li>
            <li className="nav-item"><Link to="/about" className="nav-link">About Us</Link></li>
            <li className="nav-item"><Link to="/contact" className="nav-link">Contact</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header; 