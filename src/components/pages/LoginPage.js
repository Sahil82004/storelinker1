import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { loginCustomer } from '../../services/customerService';
import { login } from '../../services/authService';
import '../../assets/css/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserTypeChange = (type) => {
    if (type === 'vendor') {
      navigate('/vendor-login');
    } else {
      setUserType(type);
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
      <div className="login-card">
        <h1>Login to Your Account</h1>
        <p className="subtitle">Welcome back! Please enter your details to access your account.</p>

        <div className="user-type-toggle">
          <button
            className={`toggle-btn ${userType === 'customer' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('customer')}
          >
            Customer
          </button>
          <button
            className={`toggle-btn ${userType === 'vendor' ? 'active' : ''}`}
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
            <div className="input-with-icon">
              
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-login">
            <button type="button" className="google-btn">
              <FontAwesomeIcon icon={faGoogle} /> Google
            </button>
            <button type="button" className="facebook-btn">
              <FontAwesomeIcon icon={faFacebookF} /> Facebook
            </button>
          </div>

          <p className="register-prompt">
            Don't have an account? <Link to="/register" className="register-link">Register Now</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 