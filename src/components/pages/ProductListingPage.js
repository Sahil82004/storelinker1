import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faFilter, faSort, faSearch, faStore, faTag } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import '../../assets/css/ProductListingPage.css';
import { getAllProducts, getProductsByCategory } from '../../services/mockProductService';
import { formatPrice } from '../../utils/priceFormatter';

const ProductListingPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch products from mock MongoDB service
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedProducts;
        if (category) {
          // Fetch products by category
          fetchedProducts = await getProductsByCategory(category);
        } else {
          // Fetch all products
          fetchedProducts = await getAllProducts();
        }
        
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
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

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handlePriceRangeChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesPrice;
  });

  const sortProducts = (products) => {
    switch(sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      case 'price-high':
        return [...products].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...products]; // In a real app, you would sort by date
      default: // popularity
        return [...products].sort((a, b) => b.reviewCount - a.reviewCount);
    }
  };

  const sortedAndFilteredProducts = sortProducts(filteredProducts);

  const getCategoryTitle = () => {
    if (!category) return 'All Products';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (error) {
    return (
      <div className="product-listing-page">
        <div className="container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-listing-page">
      <div className="container">
        <div className="category-header">
          <h1>{getCategoryTitle()}</h1>
          <p>{sortedAndFilteredProducts.length} products found</p>
        </div>

        <div className="product-controls">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filter-sort-controls">
            <button className="filter-button" onClick={toggleFilter}>
              <FontAwesomeIcon icon={faFilter} /> Filter
            </button>
            
            <div className="sort-dropdown">
              <label htmlFor="sort-select">
                <FontAwesomeIcon icon={faSort} /> Sort by:
              </label>
              <select 
                id="sort-select" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {filterOpen && (
          <div className="filter-panel">
            <div className="filter-section">
              <h3>Price Range</h3>
              <div className="price-range-inputs">
                <div className="price-input">
                  <label>Min:</label>
                  <input 
                    type="number" 
                    value={priceRange[0]} 
                    onChange={(e) => handlePriceRangeChange(e, 0)}
                    min="0"
                  />
                </div>
                <div className="price-input">
                  <label>Max:</label>
                  <input 
                    type="number" 
                    value={priceRange[1]} 
                    onChange={(e) => handlePriceRangeChange(e, 1)}
                    min="0"
                  />
                </div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                value={priceRange[0]} 
                onChange={(e) => handlePriceRangeChange(e, 0)}
                className="range-slider"
              />
              <input 
                type="range" 
                min="0" 
                max="5000" 
                value={priceRange[1]} 
                onChange={(e) => handlePriceRangeChange(e, 1)}
                className="range-slider"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="products-grid">
            {sortedAndFilteredProducts.length > 0 ? (
              sortedAndFilteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="product-card" 
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    <img src={product.images[0]} alt={product.name} />
                    {product.discountPrice && (
                      <div className="discount-badge">
                        <FontAwesomeIcon icon={faTag} />
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">
                      {product.discountPrice ? (
                        <>
                          <span className="discount-price">{formatPrice(product.discountPrice)}</span>
                          <span className="original-price">{formatPrice(product.price)}</span>
                        </>
                      ) : (
                        <span className="regular-price">{formatPrice(product.price)}</span>
                      )}
                    </div>
                    <div className="product-rating">
                      <div className="stars">
                        {renderRatingStars(product.rating)}
                      </div>
                      <span className="review-count">({product.reviewCount})</span>
                    </div>
                    <p className="product-description">{product.description}</p>
                    <div className="store-info">
                      <FontAwesomeIcon icon={faStore} className="store-icon" />
                      <span className="store-name">{product.store.name}</span>
                      <span className="store-rating">{product.store.rating}</span>
                    </div>
                    <div className="stock-info">
                      {product.stock > 0 ? (
                        <span className="in-stock">In Stock ({product.stock})</span>
                      ) : (
                        <span className="out-of-stock">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>No products found. Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListingPage; 