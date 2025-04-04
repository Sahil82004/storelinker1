import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faLock, faEnvelope, faUser } from '@fortawesome/free-solid-svg-icons';
import { loginVendor } from '../../services/vendorService';
import '../../assets/css/VendorLoginPage.css';

const MOCK_VENDOR_DATA = {
  _id: '60d21b4667d0d8992e610c85',
  name: 'Test Vendor',
  email: 'test@vendor.com',
  userType: 'vendor',
  storeName: 'Test Store',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  phone: '123-456-7890'
};

const VendorLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      console.log('Attempting vendor login with:', { email: formData.email, userType: 'vendor' });
      
      const result = await loginVendor(formData.email, formData.password);
      
      if (result && result.vendor) {
        console.log('Vendor login successful, redirecting to dashboard');
        navigate('/vendor-dashboard');
      } else {
        throw new Error('Login successful but vendor data is missing');
      }
    } catch (err) {
      console.error('Vendor login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = () => {
    // Create a mock token
    const mockToken = 'mock-token-for-testing-purposes';
    
    // Store in sessionStorage (consistent with vendorService)
    sessionStorage.setItem('vendorToken', mockToken);
    sessionStorage.setItem('vendorInfo', JSON.stringify(MOCK_VENDOR_DATA));
    
    // Navigate to dashboard
    navigate('/vendor-dashboard');
  };

  return (
    <div className="vendor-login-page">
      <div className="login-container">
        <div className="login-header">
          <FontAwesomeIcon icon={faStore} className="store-icon" />
          <h1>Vendor Login</h1>
          <p>Access your store dashboard</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p className="mt-3">Don't have a vendor account?</p>
          <Link to="/vendor-register" className="register-link">Register as Vendor</Link>
          
          <div className="mock-login-section">
            <p>Having trouble logging in?</p>
            <button 
              onClick={handleMockLogin} 
              className="mock-login-button"
              type="button"
            >
              <FontAwesomeIcon icon={faUser} /> Use Test Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPage; 