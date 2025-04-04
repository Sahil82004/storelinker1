import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/AllStoresPage.css';

const AllStoresPage = () => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    // Fetch all stores from localStorage
    const fetchStores = () => {
      const storedStores = JSON.parse(localStorage.getItem('registeredStores')) || [];
      setStores(storedStores);
    };

    fetchStores();
  }, []);

  return (
    <div className="all-stores-page">
      <div className="container">
        <div className="page-header">
          <h1>All Registered Stores</h1>
          <p>Browse through our network of trusted partner stores</p>
        </div>

        <div className="stores-list">
          {stores.map((store) => (
            <div key={store.id} className="store-card">
              <div className="store-field">
                <label>Store Name:</label>
                <div className="field-value">{store.storeName}</div>
              </div>
              <div className="store-field">
                <label>Address:</label>
                <div className="field-value">{store.address}</div>
              </div>
              <div className="store-field">
                <label>Location:</label>
                <div className="field-value">{store.city}, {store.state}</div>
              </div>
              <Link to={`/store/${store.id}`} className="btn-visit">
                Visit Store
              </Link>
            </div>
          ))}
          {stores.length === 0 && (
            <div className="no-stores-message">
              <p>No stores registered yet.</p>
              <Link to="/vendor-register" className="btn-register">
                Register Your Store
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllStoresPage; 