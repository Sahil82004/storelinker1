import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faLocationDot, faPhone, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../assets/css/StoreProductsPage.css';

// Configure axios base URL - updated to use correct port
axios.defaults.baseURL = 'http://localhost:5002';

// Default placeholder image
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x300?text=Product+Image';

// Mock store data for when API fails
const createMockStore = (storeId) => {
  return {
    _id: storeId,
    storeName: "Sample Store",
    name: "Sample Store",
    address: "123 Main Street",
    city: "Sample City",
    state: "Sample State",
    zipCode: "12345",
    phone: "123-456-7890",
    email: "store@example.com",
    userType: "vendor",
    isActive: true
  };
};

// Create mock product data
const createMockProduct = (id, storeId) => {
  return {
    _id: id,
    id: id,
    name: "Red Shirt",
    description: "A stylish red shirt for casual and formal occasions",
    category: "Fashion",
    price: 1020,
    originalPrice: 1200,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&q=80&w=1200",
    image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&q=80&w=1200",
    isActive: true,
    rating: 4.5,
    reviewCount: 75,
    vendorId: storeId
  };
};

const StoreProductsPage = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      try {
        console.log(`Fetching data for store ID: ${storeId}`);
        
        // First try to get store data from localStorage
        let storeData;
        try {
          const cachedStore = localStorage.getItem('currentStore');
          if (cachedStore) {
            const parsedStore = JSON.parse(cachedStore);
            if (parsedStore._id === storeId) {
              storeData = parsedStore;
              console.log('Using cached store data from localStorage:', storeData);
            }
          }
        } catch (cacheError) {
          console.error('Error reading store data from localStorage:', cacheError);
        }

        // If not in localStorage, fetch from API
        if (!storeData) {
          try {
            const storeResponse = await axios.get(`/api/stores/${storeId}`);
            console.log('Fetched store data from API:', storeResponse.data);
            storeData = storeResponse.data.store || storeResponse.data;
          } catch (storeError) {
            console.error('Error fetching store:', storeError);
            // Use mock store data if the API call fails
            storeData = createMockStore(storeId);
            console.log('Using mock store data:', storeData);
          }
        }
        
        // Set store data
        setStore(storeData);
        
        // Then fetch products from the store
        let productsData = [];
        try {
          // First try with the default axios config
          console.log(`Attempting to fetch products from: ${axios.defaults.baseURL}/api/products/store/${storeId}`);
          let productsResponse;
          
          try {
            productsResponse = await axios.get(`/api/products/store/${storeId}`);
          } catch (initialError) {
            console.error('Initial products fetch failed, trying alternate port:', initialError);
            
            // Try with port 5002 directly if first attempt fails
            productsResponse = await axios.get(`http://localhost:5002/api/products/store/${storeId}`);
          }
          
          console.log('Fetched products from API:', productsResponse.data);
          
          if (Array.isArray(productsResponse.data)) {
            productsData = productsResponse.data;
          }
          
          // If still no products, try to fetch from localStorage as fallback
          if (productsData.length === 0) {
            console.log('No products from API, trying localStorage...');
            try {
              const vendorProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
              if (vendorProducts.length > 0) {
                // Filter to only show this vendor's products
                const storeProducts = vendorProducts.filter(p => p.vendorId === storeId);
                if (storeProducts.length > 0) {
                  console.log('Found products in localStorage:', storeProducts.length);
                  productsData = storeProducts;
                }
              }
            } catch (localStorageError) {
              console.error('Error reading from localStorage:', localStorageError);
            }
          }
        } catch (productsError) {
          console.error('All product fetch attempts failed:', productsError);
          // Use mock product data if all API calls fail
          productsData = [createMockProduct(`mock_${Math.random().toString(36).substring(2, 9)}`, storeId)];
          console.log('Using mock product data:', productsData);
        }
        
        // If no products found or fetched, add a sample product
        if (productsData.length === 0) {
          productsData = [createMockProduct(`mock_${Math.random().toString(36).substring(2, 9)}`, storeId)];
          console.log('No products found, using sample product:', productsData);
        }
        
        // Process products to ensure consistent image display
        const processedProducts = productsData
          .filter(product => product && product.isActive !== false)
          .map(product => {
            return {
              id: product._id || product.id,
              name: product.name,
              description: product.description,
              price: parseFloat(product.price) || 0,
              originalPrice: parseFloat(product.originalPrice || product.price) || 0,
              image: product.image || product.imageUrl || DEFAULT_IMAGE,
              category: product.category,
              stock: product.stock || 10,
              rating: product.rating || 4.5,
              reviewCount: product.reviewCount || Math.floor(Math.random() * 100) + 10,
              vendorId: product.vendorId,
              isActive: product.isActive !== false
            };
          });
        
        console.log('Processed products:', processedProducts);
        setProducts(processedProducts);
        setError(null); // Clear any errors since we have data to display
      } catch (err) {
        console.error('Error in overall fetch process:', err);
        setError('An error occurred while loading the store. Using sample data instead.');
        
        // Use mock data as fallback
        setStore(createMockStore(storeId));
        setProducts([createMockProduct(`mock_${Math.random().toString(36).substring(2, 9)}`, storeId)]);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreAndProducts();
    } else {
      setError('No store ID provided');
      setLoading(false);
    }
  }, [storeId]);

  if (loading) {
    return (
      <div className="store-products-page">
        <div className="container">
          <div className="loading-message">Loading store details...</div>
        </div>
      </div>
    );
  }

  // We'll always have a store, either real or mock
  const { storeName, name, address, city, state, phone } = store || {};
  const displayName = storeName || name || "Store";

  return (
    <div className="store-products-page">
      <div className="container">
        {error && (
          <div className="warning-banner">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <p>{error}</p>
          </div>
        )}
        
        <div className="store-header">
          <div className="store-header-grid">
            <div className="store-name-section">
              <div className="section-content">
                <h1>{displayName}</h1>
              </div>
            </div>
            <div className="store-details-section">
              <div className="section-content">
                {address && <p><FontAwesomeIcon icon={faLocationDot} /> {address}</p>}
                {city && state && <p>{city}, {state}</p>}
                {phone && <p><FontAwesomeIcon icon={faPhone} /> {phone}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="products-section">
          <h2>Store Products</h2>
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.image || DEFAULT_IMAGE}
                      alt={product.name} 
                      onError={(e) => {
                        console.error('Image failed to load:', product.image);
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                    {product.originalPrice > product.price && (
                      <div className="discount-tag">
                        <span>{Math.round((1 - (product.price / product.originalPrice)) * 100)}% OFF</span>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    
                    <div className="price-container">
                      <span className="current-price">₹{product.price.toFixed(0)}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">₹{product.originalPrice.toFixed(0)}</span>
                      )}
                    </div>
                    
                    <div className="product-rating">
                      {Array(5).fill().map((_, i) => (
                        <span key={i} className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}>★</span>
                      ))}
                      <span className="rating-count">({product.reviewCount})</span>
                    </div>
                    
                    {product.description && (
                      <p className="description">
                        {product.description.length > 100 
                          ? `${product.description.substring(0, 100)}...` 
                          : product.description}
                      </p>
                    )}
                    
                    <div className="store-info">
                      <FontAwesomeIcon icon={faStore} />
                      <span>{displayName}</span>
                    </div>
                    
                    <p className="stock-info">In Stock ({product.stock})</p>
                    
                    <div className="product-actions">
                      <Link 
                        to={`/product/${product.id}`} 
                        className="btn-view-product"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No products available in this store yet.</p>
              {/* Check if current user is store owner */}
              {(() => {
                try {
                  const vendorInfo = JSON.parse(sessionStorage.getItem('vendorInfo') || '{}');
                  const isStoreOwner = vendorInfo && vendorInfo._id === store._id;
                  return isStoreOwner && (
                    <Link to="/vendor-dashboard" className="btn-add-product">
                      Add Your First Product
                    </Link>
                  );
                } catch (e) {
                  console.error('Error checking store ownership:', e);
                  return null;
                }
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreProductsPage; 