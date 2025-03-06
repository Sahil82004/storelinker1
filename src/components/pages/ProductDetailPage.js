import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faStarHalfAlt, 
  faArrowLeft, 
  faStore, 
  faTag, 
  faShoppingCart, 
  faHeart,
  faShare,
  faCheck,
  faTruck,
  faShieldAlt,
  faExclamationCircle,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar, faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import '../../assets/css/ProductDetailPage.css';
import { getProductById } from '../../services/mockProductService';
import { isLoggedIn, addToCart } from '../../services/authService';
import { formatPrice } from '../../utils/priceFormatter';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch product from mock MongoDB service
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedProduct = await getProductById(productId);
        
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setLoading(false);
        } else {
          setError('Product not found');
          setLoading(false);
        }
      } catch (error) {
        console.error(`Error fetching product with ID ${productId}:`, error);
        setError('Failed to load product. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const toggleFavorite = () => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    
    // Add product to cart using auth service
    addToCart(product, quantity);
    
    // Show success message
    setAddedToCart(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    
    // Add product to cart using auth service
    addToCart(product, quantity);
    
    // Redirect to checkout page
    navigate('/cart');
  };

  const redirectToLogin = () => {
    // Store the current URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/login');
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="star" />);
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="star" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={farStar} className="star empty" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationCircle} className="error-icon" />
            <h2>{error}</h2>
            <p>We couldn't find the product you're looking for.</p>
            <button className="btn-primary" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Products
        </div>

        {showLoginAlert && (
          <div className="login-alert">
            <FontAwesomeIcon icon={faLock} className="lock-icon" />
            <div className="login-alert-message">
              <p>Please log in to continue</p>
              <button className="login-btn" onClick={redirectToLogin}>
                Log In / Register
              </button>
            </div>
            <button className="close-alert" onClick={() => setShowLoginAlert(false)}>×</button>
          </div>
        )}

        <div className="product-detail-container">
          <div className="product-images">
            <div className="main-image">
              <img src={product.images[selectedImage]} alt={product.name} />
              {product.discountPrice && (
                <div className="discount-badge">
                  <FontAwesomeIcon icon={faTag} />
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </div>
              )}
            </div>
            <div className="thumbnail-images">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} - view ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            
            <div className="product-rating">
              <div className="stars">
                {renderRatingStars(product.rating)}
              </div>
              <span className="rating-value">{product.rating.toFixed(1)}</span>
              <span className="review-count">({product.reviewCount} reviews)</span>
            </div>
            
            <div className="product-price-section">
              <div className="product-price">
                {product.discountPrice ? (
                  <>
                    <span className="discount-price">{formatPrice(product.discountPrice)}</span>
                    <span className="original-price">{formatPrice(product.price)}</span>
                    <span className="discount-percentage">
                      {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                    </span>
                  </>
                ) : (
                  <span className="regular-price">{formatPrice(product.price)}</span>
                )}
              </div>
              
              <div className="product-availability-badge">
                {product.stock > 0 ? (
                  <span className="in-stock-badge">
                    <FontAwesomeIcon icon={faCheck} /> In Stock
                  </span>
                ) : (
                  <span className="out-of-stock-badge">
                    <FontAwesomeIcon icon={faExclamationCircle} /> Out of Stock
                  </span>
                )}
              </div>
            </div>
            
            <div className="quick-add-section">
              <div className="quantity-selector">
                <button 
                  className="quantity-btn" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.stock}
                />
                <button 
                  className="quantity-btn" 
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              
              <div className="quick-action-buttons">
                <button 
                  className="btn-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                    </>
                  )}
                </button>
                
                <button 
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </button>
              </div>
            </div>
            
            {addedToCart && (
              <div className="cart-success-message">
                <FontAwesomeIcon icon={faCheck} /> Product added to cart successfully!
                <Link to="/cart" className="view-cart-link">View Cart</Link>
              </div>
            )}
            
            <div className="store-info">
              <FontAwesomeIcon icon={faStore} className="store-icon" />
              <div className="store-details">
                <span className="store-name">{product.store.name}</span>
                <div className="store-rating">
                  <FontAwesomeIcon icon={faStar} className="star" />
                  <span>{product.store.rating}</span>
                </div>
              </div>
              <div className="store-location">
                <span>Location: {product.store.location}</span>
                <span>Response time: {product.store.responseTime}</span>
              </div>
            </div>
            
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
            
            <div className="product-features">
              <h3>Key Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>
                    <FontAwesomeIcon icon={faCheck} className="feature-icon" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="product-availability">
              <h3>Availability</h3>
              {product.stock > 0 ? (
                <span className="in-stock">
                  <FontAwesomeIcon icon={faCheck} /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="out-of-stock">
                  <FontAwesomeIcon icon={faExclamationCircle} /> Out of Stock
                </span>
              )}
            </div>
            
            <div className="product-actions">
              <div className="action-buttons">
                <button 
                  className={`btn-favorite ${isFavorite ? 'active' : ''}`}
                  onClick={toggleFavorite}
                >
                  <FontAwesomeIcon icon={isFavorite ? faHeart : farHeart} />
                  <span>Add to Wishlist</span>
                </button>
                
                <button className="btn-share">
                  <FontAwesomeIcon icon={faShare} />
                  <span>Share</span>
                </button>
              </div>
            </div>
            
            <div className="product-policies">
              <div className="policy">
                <FontAwesomeIcon icon={faTruck} className="policy-icon" />
                <div className="policy-info">
                  <h4>Fast Delivery</h4>
                  <p>Available in select areas</p>
                </div>
              </div>
              
              <div className="policy">
                <FontAwesomeIcon icon={faShieldAlt} className="policy-icon" />
                <div className="policy-info">
                  <h4>Secure Payment</h4>
                  <p>Multiple payment options</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="product-specifications">
          <h2>Specifications</h2>
          <div className="specifications-table">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="specification-row">
                <div className="specification-key">{key}</div>
                <div className="specification-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 