import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faStore,
  faSignOutAlt,
  faSearch,
  faFilter,
  faExclamationCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/VendorDashboard.css';
import { getVendorProducts, getVendorInfo, isVendorLoggedIn, deleteProduct, logoutVendor } from '../../services/vendorService';
import { formatPrice } from '../../utils/priceFormatter';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [vendorInfo, setVendorInfo] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    // Check if vendor is logged in
    if (!isVendorLoggedIn()) {
      navigate('/vendor-login');
      return;
    }

    // Load vendor info
    const storedVendorInfo = getVendorInfo();
    setVendorInfo(storedVendorInfo);

    // Load products
    fetchProducts();

    // Listen for product updates
    window.addEventListener('productUpdated', fetchProducts);
    
    return () => {
      window.removeEventListener('productUpdated', fetchProducts);
    };
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsData = await getVendorProducts();
      setProducts(productsData);
      setError('');
    } catch (err) {
      setError('Failed to load products: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      // Remove product from state
      setProducts(products.filter(product => product._id !== productId));
      showNotification('Product deleted successfully', 'success');
    } catch (err) {
      showNotification('Failed to delete product: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  const handleLogout = () => {
    logoutVendor();
    navigate('/vendor-login');
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="vendor-dashboard">
      <header className="dashboard-header">
        <div className="vendor-info">
          <FontAwesomeIcon icon={faStore} className="store-icon" />
          <div className="vendor-details">
            <h1>{vendorInfo?.storeName || 'Vendor Dashboard'}</h1>
            <p>{vendorInfo?.email}</p>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </header>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="dashboard-controls">
        <div className="search-filter">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <FontAwesomeIcon icon={faFilter} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Kitchen</option>
              <option value="beauty">Beauty & Personal Care</option>
              <option value="sports">Sports & Outdoors</option>
              <option value="books">Books</option>
              <option value="toys">Toys & Games</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <Link to="/add-product" className="add-product-button">
          <FontAwesomeIcon icon={faPlus} /> Add New Product
        </Link>
      </div>

      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="product-price">
                    {product.discountPrice ? (
                      <>
                        <span className="discount-price">{formatPrice(product.discountPrice)}</span>
                        <span className="original-price">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </p>
                  <p className="product-stock">Stock: {product.stock}</p>
                  <div className="product-status">
                    <span className={`status-badge ${product.status?.toLowerCase() || 'active'}`}>
                      {product.status || 'Active'}
                    </span>
                  </div>
                </div>
                <div className="product-actions">
                  <Link to={`/edit-product/${product._id}`} className="edit-button">
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </Link>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <p>No products found. {searchTerm || filterCategory !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first product!'}</p>
              <Link to="/add-product" className="add-first-product">
                <FontAwesomeIcon icon={faPlus} /> Add Your First Product
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard; 