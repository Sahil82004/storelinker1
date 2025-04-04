import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import './StoreDetailsPage.css';

const StoreDetailsPage = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/stores/${storeId}`);
        setStore(response.data.store);
        setProducts(response.data.products);
        setError(null);
      } catch (err) {
        setError('Failed to fetch store details. Please try again later.');
        console.error('Error fetching store details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [storeId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!store) {
    return <div className="error">Store not found</div>;
  }

  return (
    <div className="store-details-container">
      <div className="store-header">
        <h1>{store.name}</h1>
      </div>

      <div className="store-info">
        <div className="info-item">
          <FontAwesomeIcon icon={faLocationDot} className="info-icon" />
          <span>{store.address}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faLocationDot} className="info-icon" />
          <span>{store.city}, {store.state}</span>
        </div>
        {store.phone && (
          <div className="info-item">
            <FontAwesomeIcon icon={faPhone} className="info-icon" />
            <span>{store.phone}</span>
          </div>
        )}
      </div>

      <h2 className="products-heading">Products</h2>
      {products.length === 0 ? (
        <p className="no-products">No products available in this store yet.</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <img 
                src={product.imageUrl || '/placeholder-image.jpg'} 
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreDetailsPage; 