import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes, faCalendarAlt, faStore, faLock, faEnvelope, faUser, faPhone, faLocationDot, faCity, faMapPin } from '@fortawesome/free-solid-svg-icons';
import { registerVendor } from '../../services/vendorService';
import '../../assets/css/VendorRegisterPage.css';

const VendorRegisterPage = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await registerVendor(formData);
      navigate('/vendor-login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="vendor-register-page">
      <div className="container registration-container">
        <h1>Vendor Registration</h1>
        <p className="registration-subtitle">Please fill out the form below to register as a vendor on our platform.</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form id="vendorRegistrationForm" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="storeName">
                <FontAwesomeIcon icon={faStore} /> Store Name
              </label>
              <input
                type="text"
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                placeholder="Enter your store name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">
                <FontAwesomeIcon icon={faLock} /> Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FontAwesomeIcon icon={faLock} /> Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
                minLength="6"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">
                <FontAwesomeIcon icon={faUser} /> Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <FontAwesomeIcon icon={faPhone} /> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">
              <FontAwesomeIcon icon={faLocationDot} /> Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">
                <FontAwesomeIcon icon={faCity} /> City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Enter city"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">
                <FontAwesomeIcon icon={faLocationDot} /> State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="Enter state"
              />
            </div>

            <div className="form-group">
              <label htmlFor="zipCode">
                <FontAwesomeIcon icon={faMapPin} /> ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                placeholder="Enter ZIP code"
              />
            </div>
          </div>

          <div className="form-submit">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <FontAwesomeIcon 
              icon={
                notification.type === 'success' ? faCheckCircle : 
                notification.type === 'error' ? faExclamationCircle : 
                faInfoCircle
              } 
            />
            <p>{notification.message}</p>
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorRegisterPage; 