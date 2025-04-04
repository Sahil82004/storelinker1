import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faLock,
  faPhone,
  faLocationDot,
  faCity,
  faMapPin,
  faStore
} from '@fortawesome/free-solid-svg-icons';
import { registerVendor } from '../../services/vendorService';
import '../../assets/css/RegisterPage.css';

const VendorRegisterPage = () => {
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      const { confirmPassword, ...registrationData } = formData;
      
      // Add vendor type and additional fields
      const vendorData = {
        ...registrationData,
        userType: 'vendor',
        registrationDate: new Date().toISOString(),
        active: true
      };
      
      console.log('Registering vendor with data:', vendorData);
      
      // Save to database through API
      const result = await registerVendor(vendorData);
      
      console.log('Registration response:', result);
      
      if (result && result.user) {
        // Show success message
        alert('Registration successful! Please login.');
        navigate('/vendor-login');
      } else {
        throw new Error('Registration failed: No user data returned');
      }
    } catch (err) {
      console.error('Vendor registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <FontAwesomeIcon icon={faStore} className="user-icon" />
          <h1>Vendor Registration</h1>
          <p>Join us to start selling on our platform</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Vendor Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have a vendor account?</p>
          <Link to="/vendor-login" className="login-link">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default VendorRegisterPage; 