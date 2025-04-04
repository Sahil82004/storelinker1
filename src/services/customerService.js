import axios from 'axios';
import { saveUserToCollection } from '../utils/dbSync';

const API_URL = 'http://localhost:5001/api';

// Dummy customer data
const DUMMY_CUSTOMERS = [
  {
    id: 'c1',
    email: 'john@example.com',
    password: 'john123',
    name: 'John Doe',
    phone: '123-456-7890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    orders: []
  },
  {
    id: 'c2',
    email: 'jane@example.com',
    password: 'jane123',
    name: 'Jane Smith',
    phone: '234-567-8901',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    orders: []
  },
  {
    id: 'c3',
    email: 'test@test.com',
    password: 'test123',
    name: 'Test User',
    phone: '345-678-9012',
    address: '789 Test Rd',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    orders: []
  }
];

// Store customers in localStorage if not already present
if (!localStorage.getItem('customers')) {
  localStorage.setItem('customers', JSON.stringify(DUMMY_CUSTOMERS));
}

// Helper function to get customers from localStorage
const getCustomers = () => {
  return JSON.parse(localStorage.getItem('customers')) || DUMMY_CUSTOMERS;
};

// Helper function to save customers to localStorage
const saveCustomers = (customers) => {
  localStorage.setItem('customers', JSON.stringify(customers));
};

// Check if customer is logged in
export const isCustomerLoggedIn = () => {
  const token = localStorage.getItem('customerToken');
  return !!token;
};

// Get customer info
export const getCustomerInfo = () => {
  const customerInfo = localStorage.getItem('customerInfo');
  return customerInfo ? JSON.parse(customerInfo) : null;
};

// Register new customer
export const registerCustomer = async (customerData) => {
  try {
    // Make sure we have the userType field properly set
    const dataWithUserType = {
      ...customerData,
      userType: 'customer',
      registrationDate: new Date().toISOString(),
      isActive: true
    };
    
    console.log('Registering customer with data:', dataWithUserType);
    
    // Call the API to register the customer
    const response = await axios.post(`${API_URL}/auth/register`, dataWithUserType);
    
    if (response.data && response.data.user) {
      // Save the token if provided
      if (response.data.token) {
        localStorage.setItem('customerToken', response.data.token);
        sessionStorage.setItem('customerToken', response.data.token);
      }
      
      // Save user info
      const userInfo = response.data.user;
      localStorage.setItem('customerInfo', JSON.stringify(userInfo));
      sessionStorage.setItem('customerInfo', JSON.stringify(userInfo));
      
      // Save user data to collection using our sync utility
      await saveUserToCollection(response.data.user, 'customer');
      console.log('Customer registered successfully:', response.data.user.email);
    }
    
    return response.data;
  } catch (error) {
    console.error('Customer registration API error:', error);
    
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error('Registration failed: ' + (error.message || 'Unknown error'));
    }
  }
};

// Login customer
export const loginCustomer = async (email, password) => {
  try {
    // Get device info for tracking
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`
    };
    
    console.log('Logging in customer with:', { email, userType: 'customer' });
    
    // Call the API for authentication
    const response = await axios.post(`${API_URL}/auth/login`, { 
      email, 
      password,
      userType: 'customer',
      deviceInfo
    });
    
    const { token, user, sessionId } = response.data;
    
    // Enhance user object with any additional data needed for the application
    const enhancedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
      sessionId: sessionId
    };
    
    // Store token and user info in localStorage for persistence
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerInfo', JSON.stringify(enhancedUser));
    
    // Also store in sessionStorage for quicker access
    sessionStorage.setItem('customerToken', token);
    sessionStorage.setItem('customerInfo', JSON.stringify(enhancedUser));
    
    // Save user data to collection using our sync utility
    await saveUserToCollection(enhancedUser, 'customer');
    console.log('Customer login successful:', enhancedUser.email);
    
    return { token, customer: enhancedUser, sessionId };
  } catch (error) {
    console.error('Customer login error:', error);
    throw new Error(error.response?.data?.error || 'Login failed: ' + (error.message || 'Unknown error'));
  }
};

// Get customer's wishlist
export const getCustomerWishlist = async () => {
  try {
    const token = sessionStorage.getItem('customerToken');
    const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo'));
    
    if (!token || !customerInfo) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get(`${API_URL}/customers/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch wishlist');
  }
};

// Add product to wishlist
export const addToWishlist = async (productId) => {
  try {
    const token = sessionStorage.getItem('customerToken');
    const response = await axios.post(`${API_URL}/customers/wishlist/${productId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add to wishlist');
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  try {
    const token = sessionStorage.getItem('customerToken');
    const response = await axios.delete(`${API_URL}/customers/wishlist/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to remove from wishlist');
  }
};

// Customer logout
export const logoutCustomer = async () => {
  try {
    // Get the token
    const token = sessionStorage.getItem('customerToken');
    
    if (token) {
      // Call the logout API endpoint to properly end the session
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Customer logged out successfully');
    }
  } catch (error) {
    console.error('Error logging out customer:', error);
    // Continue with local logout even if API call fails
  } finally {
    // Always clear local storage regardless of API success
    sessionStorage.removeItem('customerToken');
    sessionStorage.removeItem('customerInfo');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerInfo');
    
    // Dispatch logout event
    window.dispatchEvent(new Event('customerLogout'));
  }
};

// Logout from all devices
export const logoutFromAllDevices = async () => {
  try {
    // Get the token
    const token = sessionStorage.getItem('customerToken');
    
    if (token) {
      // Call the logout-all API endpoint to end all sessions
      await axios.post(`${API_URL}/auth/logout-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Customer logged out from all devices');
    }
  } catch (error) {
    console.error('Error logging out from all devices:', error);
    throw new Error(error.response?.data?.error || 'Failed to logout from all devices');
  } finally {
    // Clear local storage
    sessionStorage.removeItem('customerToken');
    sessionStorage.removeItem('customerInfo');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerInfo');
    
    // Dispatch logout event
    window.dispatchEvent(new Event('customerLogout'));
  }
};

// Get customer's active sessions
export const getCustomerSessions = async () => {
  try {
    const token = sessionStorage.getItem('customerToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await axios.get(`${API_URL}/auth/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.sessions;
  } catch (error) {
    console.error('Error fetching customer sessions:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
  }
};

// Store customer session data
export const storeSessionData = async (sessionData) => {
  try {
    const token = sessionStorage.getItem('customerToken');
    const customerInfo = JSON.parse(sessionStorage.getItem('customerInfo'));
    
    if (!token || !customerInfo) {
      throw new Error('Not authenticated');
    }
    
    // Extract the sessionId from the customerInfo
    const { currentSessionId } = customerInfo;
    
    if (!currentSessionId) {
      throw new Error('No active session ID found');
    }
    
    const response = await axios.post(`${API_URL}/auth/session`, {
      sessionId: currentSessionId,
      sessionData
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error storing session data:', error);
    throw new Error(error.response?.data?.error || 'Failed to store session data');
  }
}; 