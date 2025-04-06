import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { loginCustomer, emergencyLogin } from '../../services/customerService';
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

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to login with:', { email, password, userType: 'customer' });
      
      // Try standard login first
      let result;
      let loginSuccessful = false;

      try {
        // Explicitly pass userType as 'customer'
        result = await loginCustomer(email, password);
        loginSuccessful = true;
      } catch (loginError) {
        console.error('Standard login failed:', loginError);
        
        if (loginError.message.includes('Unable to connect') || 
            loginError.message.includes('Network Error') ||
            loginError.message.includes('service not available')) {
          
          console.log('Connection issue detected, trying emergency login...');
          try {
            result = await emergencyLogin(email, password);
            loginSuccessful = true;
            console.log('Emergency login successful', result);
          } catch (emergencyError) {
            console.error('Emergency login failed:', emergencyError);
            throw new Error('Unable to connect to the login service. Please try again later.');
          }
        } else {
          // For credential errors, provide clear feedback
          if (loginError.message.includes('Invalid credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else {
            // For other errors, rethrow with clear message
            throw loginError;
          }
        }
      }
      
      // If we got here with loginSuccessful flag, process the login
      if (loginSuccessful && result) {
        console.log('Login successful, storing customer data');
        
        // Accept result in various formats
        const userData = result.customer || result.user || result;
        
        if (!userData) {
          throw new Error('Login succeeded but user data is missing');
        }
        
        // Store in auth service
        login(userData);
        
        // Clear any errors
        setError('');
        
        // Check if there's a redirect URL stored
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          // If emergency/simulation login, show information message
          if (result.emergency || result.localSimulation) {
            console.log('Emergency/local login - would normally redirect');
            // Don't redirect, but show success to allow inspection of login process
            setError('');
            setLoading(false);
            // Wait briefly then redirect to make flow smoother
            setTimeout(() => navigate('/'), 800);
          } else {
            navigate('/');
          }
        }
      } else {
        throw new Error('Login process completed but no valid result was returned');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Show user-friendly error messages
      if (err.message.includes('Network Error') || err.message.includes('service not available')) {
        setError('Cannot connect to the login service. The server might be down or you might have network issues.');
      } else if (err.message.includes('Invalid credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please try again later.');
      }
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