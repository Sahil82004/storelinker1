import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { loginCustomer } from '../../services/customerService';
import { login } from '../../services/authService';
import '../../assets/css/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserTypeChange = (type) => {
    if (type === 'vendor') {
      navigate('/vendor-login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login with customer service
      const result = await loginCustomer(email, password);
      
      // Store user data in auth service
      if (result && result.customer) {
        login(result.customer);
        
        // Check if there's a redirect URL stored
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Login to Your Account</h1>
        <p className="login-subtitle">Welcome back! Please enter your details to access your account.</p>

        <div className="user-type-tabs">
          <button 
            className="tab-button active"
          >
            Customer
          </button>
          <button 
            className="tab-button"
            onClick={() => handleUserTypeChange('vendor')}
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
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password-container">
            <Link to="/forgot-password" className="forgot-password-link">
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
          <p>Don't have an account? <Link to="/register" className="register-link">Register Now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 