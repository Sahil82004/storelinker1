import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faLock,
  faPhone,
  faLocationDot,
  faCity,
  faMapPin
} from '@fortawesome/free-solid-svg-icons';
import { registerCustomer } from '../../services/customerService';
import '../../assets/css/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
      // Remove confirmPassword from the data sent to registration
      const { confirmPassword, ...registrationData } = formData;
      
      // Format address in the structure expected by the server
      const userData = {
        ...registrationData,
        address: {
          street: registrationData.address,
          city: registrationData.city,
          state: registrationData.state,
          postalCode: registrationData.zipCode,
          country: 'US'
        },
        userType: 'customer',
        name: registrationData.name,
        isActive: true
      };
      
      console.log('Registering customer with data:', userData);
      
      // Save to database through API
      const result = await registerCustomer(userData);
      
      console.log('Registration response:', result);
      
      if (result && result.user) {
        // Show success message
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        throw new Error('Registration failed: No user data returned');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <FontAwesomeIcon icon={faUser} className="user-icon" />
          <h1>Create Account</h1>
          <p>Join us to start shopping</p>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>Already have an account?</p>
          <Link to="/login" className="login-link">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 