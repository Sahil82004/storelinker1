import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/OffersPage.css';
import { formatPrice } from '../../utils/priceFormatter';

const OffersPage = () => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [discountFilter, setDiscountFilter] = useState('');
  
  // Sample offer data
  const offers = [
    {
      id: 1,
      title: '55" 4K Smart TV',
      category: 'Electronics',
      originalPrice: 49999,
      currentPrice: 34999,
      discount: 30,
      image: '/api/placeholder/400/320',
      daysLeft: 3
    },
    {
      id: 2,
      title: 'Wireless Noise Cancelling Headphones',
      category: 'Electronics',
      originalPrice: 8999,
      currentPrice: 6749,
      discount: 25,
      image: '/api/placeholder/400/320',
      daysLeft: 5
    },
    {
      id: 3,
      title: 'Premium Coffee Maker',
      category: 'Home & Kitchen',
      originalPrice: 5999,
      currentPrice: 3599,
      discount: 40,
      image: '/api/placeholder/400/320',
      daysLeft: 2
    },
    {
      id: 4,
      title: 'Performance Running Shoes',
      category: 'Fashion',
      originalPrice: 4999,
      currentPrice: 2499,
      discount: 50,
      image: '/api/placeholder/400/320',
      daysLeft: 0
    },
    {
      id: 5,
      title: 'Premium Skincare Set',
      category: 'Beauty',
      originalPrice: 2999,
      currentPrice: 1949,
      discount: 35,
      image: '/api/placeholder/400/320',
      daysLeft: 7
    },
    {
      id: 6,
      title: 'Latest Smartphone Model',
      category: 'Electronics',
      originalPrice: 49999,
      currentPrice: 39999,
      discount: 20,
      image: '/api/placeholder/400/320',
      daysLeft: 10
    }
  ];
  
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
      <div className="banner">
        <div className="banner-content">
          <h2>Limited Time Deals!</h2>
          <p>Save up to 50% on top products across all categories. Extra 10% off with code: SAVE10</p>
          <button className="banner-button">Shop Now</button>
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
              <button className="action-button">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersPage;