import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { loginVendor } from '../../services/vendorService';
import '../../assets/css/VendorLoginPage.css';

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
      await loginVendor(formData.email, formData.password);
      navigate('/vendor-dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeChange = (type) => {
    if (type === 'customer') {
      navigate('/login');
    }
  };

  return (
    <div className="vendor-login-page">
      <div className="login-container">
        <h1 className="login-title">Login to Your Account</h1>
        <p className="login-subtitle">Welcome back! Please enter your details to access your account.</p>

        <div className="user-type-tabs">
          <button 
            className="tab-button"
            onClick={() => handleUserTypeChange('customer')}
          >
            Customer
          </button>
          <button 
            className="tab-button active"
          >
            Vendor
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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
            <label htmlFor="password">Password</label>
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

          <div className="forgot-password-container">
            <Link to="/vendor-forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">
          <span>Or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-button google">
            <FontAwesomeIcon icon={faGoogle} /> Google
          </button>
          <button className="social-button facebook">
            <FontAwesomeIcon icon={faFacebookF} /> Facebook
          </button>
        </div>

        <div className="register-prompt">
          <p>Don't have an account? <Link to="/vendor-register" className="register-link">Register Now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPage; 