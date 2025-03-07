import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartPreview from '../common/CartPreview';
import '../../assets/css/OffersPage.css';
import { formatPrice } from '../../utils/priceFormatter';

const OffersPage = () => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [discountFilter, setDiscountFilter] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [showCartPreview, setShowCartPreview] = useState(false);
  
  const { addToCart } = useCart();

  // Sample offer data
  const offers = [
    {
      id: 1,
      title: '55" 4K Smart TV',
      category: 'Electronics',
      originalPrice: 49999,
      currentPrice: 34999,
      discount: 30,
      image: 'https://m.media-amazon.com/images/I/81cbFZwHYYL._SX522_.jpg',
      daysLeft: 3
    },
    {
      id: 2,
      title: 'Wireless Noise Cancelling Headphones',
      category: 'Electronics',
      originalPrice: 8999,
      currentPrice: 6749,
      discount: 25,
      image: 'https://m.media-amazon.com/images/I/41kIdIZD3xL._SX300_SY300_QL70_FMwebp_.jpg',
      daysLeft: 5
    },
    {
      id: 3,
      title: 'Premium Coffee Maker',
      category: 'Home & Kitchen',
      originalPrice: 5999,
      currentPrice: 3599,
      discount: 40,
      image: 'https://m.media-amazon.com/images/I/41d-FY7iVsL._SX300_SY300_QL70_FMwebp_.jpg',
      daysLeft: 2
    },
    {
      id: 4,
      title: 'Performance Running Shoes',
      category: 'Fashion',
      originalPrice: 4999,
      currentPrice: 2499,
      discount: 50,
      image: 'https://m.media-amazon.com/images/I/715bXrrOVHL._SX695_.jpg',
      daysLeft: 0
    },
    {
      id: 5,
      title: 'Premium Skincare Set',
      category: 'Beauty',
      originalPrice: 2999,
      currentPrice: 1949,
      discount: 35,
      image: 'https://studdmuffyn.com/cdn/shop/files/001.jpg?v=1729352582&width=1800',
      daysLeft: 7
    },
    {
      id: 6,
      title: 'Latest Smartphone Model',
      category: 'Electronics',
      originalPrice: 49999,
      currentPrice: 39999,
      discount: 20,
      image: 'https://images.samsung.com/is/image/samsung/assets/in/smartphones/galaxy-s24-fe/buy/S24_FE_Group_KV_Global_PC.jpg?imbypass=true',
      daysLeft: 10
    }
  ];
  
  // Handle add to cart
  const handleAddToCart = (offer) => {
    const product = {
      id: offer.id,
      title: offer.title,
      currentPrice: offer.currentPrice,
      originalPrice: offer.originalPrice,
      image: offer.image,
      category: offer.category,
      discount: offer.discount,
      quantity: 1
    };

    try {
      addToCart(product);
      
      // Show notification
      setNotification({
        show: true,
        message: `${offer.title} added to cart!`
      });

      // Show cart preview
      setShowCartPreview(true);

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
      
    } catch (error) {
      setNotification({
        show: true,
        message: "Error adding item to cart. Please try again."
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
    }
  };
  
  // Filter offers based on selected filters
  const filteredOffers = offers.filter(offer => {
    // Filter by category
    if (categoryFilter && !offer.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
      return false;
    }
    
    // Filter by discount
    if (discountFilter && offer.discount < parseInt(discountFilter)) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div className="container">
      {notification.show && (
        <div className="notification">
          {notification.message}
        </div>
      )}

      <CartPreview 
        show={showCartPreview} 
        onClose={() => setShowCartPreview(false)} 
      />
      
      <div className="banner">
        <div className="banner-content">
          <h2>Limited Time Deals!</h2>
          <p>Save up to 50% on top products across all categories. Extra 10% off with code: SAVE10</p>
          
        </div>
        <div className="banner-image">
          <img src="https://png.pngtree.com/png-vector/20191120/ourmid/pngtree-special-offer-sale-banner-template-design-with-colorful-design-isolated-on-png-image_2007314.jpg" alt="Special Offers Banner" />
        </div>
      </div>
      
      <h2 className="section-title">Special Offers & Discounts</h2>
      <p className="section-subtitle">Browse our most popular deals and save instantly!</p>
      
      <div className="offers-header">
        <h3>Active Offers</h3>
        <div className="filter-options">
          <select 
            id="category-filter" 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Kitchen</option>
            <option value="beauty">Beauty</option>
          </select>
          <select 
            id="discount-filter"
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value)}
          >
            <option value="">All Discounts</option>
            <option value="10">10% and above</option>
            <option value="20">20% and above</option>
            <option value="30">30% and above</option>
            <option value="50">50% and above</option>
          </select>
        </div>
      </div>
      
      <div className="offer-grid">
        {filteredOffers.map(offer => (
          <div className="offer-card" key={offer.id}>
            <div className="card-image">
              <img src={offer.image} alt={offer.title} />
              <div className="discount-badge">{offer.discount}% OFF</div>
            </div>
            <div className="card-content">
              <h3 className="product-title">{offer.title}</h3>
              <p className="product-category">{offer.category}</p>
              <div className="price-container">
                <span className="original-price">{formatPrice(offer.originalPrice)}</span>
                <span className="current-price">{formatPrice(offer.currentPrice)}</span>
              </div>
              <p className="offer-expiry">
                {offer.daysLeft === 0 
                  ? 'Offer ends today!' 
                  : `Offer ends in ${offer.daysLeft} day${offer.daysLeft > 1 ? 's' : ''}`}
              </p>
              <button 
                className="action-button"
                onClick={() => handleAddToCart(offer)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersPage;