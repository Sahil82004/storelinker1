import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faLocationDot, faPhone } from '@fortawesome/free-solid-svg-icons';
import '../assets/css/StoreCard.css';

const StoreCard = ({ store }) => {
  return (
    <div className="store-card">
      <div className="store-header">
        <FontAwesomeIcon icon={faStore} className="store-icon" />
        <h3>{store.storeName}</h3>
      </div>
      
      <div className="store-details">
        <p>
          <FontAwesomeIcon icon={faLocationDot} />
          {store.address}
        </p>
        <p>
          <FontAwesomeIcon icon={faLocationDot} />
          {store.city}, {store.state}
        </p>
        {store.phone && (
          <p>
            <FontAwesomeIcon icon={faPhone} />
            {store.phone}
          </p>
        )}
      </div>

      <Link 
        to={`/store/${store._id}`} 
        className="visit-store-btn"
      >
        Visit Store
      </Link>
    </div>
  );
};

export default StoreCard; 