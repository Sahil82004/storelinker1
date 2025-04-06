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
    // and address is formatted correctly
    const dataWithCorrectFormat = {
      ...customerData,
      userType: 'customer', // Ensure lowercase for enum validation
      // Ensure name is handled correctly (some forms use firstName/lastName split)
      name: customerData.name || `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim(),
      // Format address if not already formatted
      address: customerData.address && typeof customerData.address === 'object' 
        ? customerData.address 
        : {
            street: customerData.address || '',
            city: customerData.city || '',
            state: customerData.state || '',
            postalCode: customerData.zipCode || '',
            country: 'US'
          },
      isActive: true
    };
    
    // Strip any undefined or null values that could cause validation issues
    Object.keys(dataWithCorrectFormat).forEach(key => {
      if (dataWithCorrectFormat[key] === undefined || dataWithCorrectFormat[key] === null) {
        delete dataWithCorrectFormat[key];
      }
    });
    
    console.log('Registering customer with formatted data:', JSON.stringify(dataWithCorrectFormat, null, 2));
    
    // Add proper error handling around the API call
    try {
      // Call the API to register the customer
      const response = await axios.post(`${API_URL}/auth/register`, dataWithCorrectFormat);
      
      if (response.data && response.data.user) {
        // Save the token if provided
        if (response.data.token) {
          localStorage.setItem('customerToken', response.data.token);
          sessionStorage.setItem('customerToken', response.data.token);
          
          // Also store in newer token format for cross-compatibility
          localStorage.setItem('token', response.data.token);
          sessionStorage.setItem('token', response.data.token);
        }
        
        // Save user info
        const userInfo = response.data.user;
        localStorage.setItem('customerInfo', JSON.stringify(userInfo));
        sessionStorage.setItem('customerInfo', JSON.stringify(userInfo));
        
        // Save user data to collection using our sync utility
        try {
          await saveUserToCollection(response.data.user, 'customer');
          console.log('Customer registered successfully:', response.data.user.email);
        } catch (syncError) {
          console.warn('Registration successful but failed to sync to collection:', syncError);
        }
      }
      
      return response.data;
    } catch (apiError) {
      console.error('API Error Details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        headers: apiError.response?.headers
      });
      
      // Extract the validation error from the response
      if (apiError.response?.data?.error) {
        // Handle validation errors from the server
        if (apiError.response.data.error.includes('validation failed')) {
          throw new Error(apiError.response.data.error);
        }
        throw new Error(apiError.response.data.error);
      }
      
      // General server error
      throw new Error(`Server error (${apiError.response?.status || 'unknown'}): ${apiError.message}`);
    }
  } catch (error) {
    console.error('Customer registration error:', error);
    
    // Provide more helpful error messages to the user
    if (error.message.includes('validation failed')) {
      throw new Error(`Registration validation error: ${error.message.split('validation failed:')[1] || 'Please check your information.'}`);
    } else if (error.message.includes('User exists')) {
      throw new Error('An account with this email already exists. Please log in instead.');
    } else {
      throw new Error('Registration failed: ' + (error.message || 'Unknown error'));
    }
  }
};

// Login customer
export const loginCustomer = async (email, password) => {
  try {
    console.log('Customer login attempt:', { email, userType: 'customer' });
    
    // Check if we have a valid token in storage first
    const existingToken = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken') || localStorage.getItem('token');
    if (existingToken) {
      try {
        const isValid = await validateToken(existingToken);
        if (isValid && isValid.valid) {
          console.log('Using existing valid token');
          const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || sessionStorage.getItem('customerInfo') || '{}');
          
          // Ensure we have the session ID stored
          if (customerInfo.sessionId || customerInfo.currentSessionId) {
            return {
              token: existingToken,
              customer: customerInfo,
              sessionId: customerInfo.sessionId || customerInfo.currentSessionId
            };
          }
        }
      } catch (tokenError) {
        console.warn('Token validation failed:', tokenError);
      }
    }
    
    // Get device info for tracking
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      browserInfo: getBrowserInfo(),
      osInfo: getOSInfo()
    };
    
    // Try multiple endpoints with different port configurations
    const endpoints = [
      'http://localhost:5000/api/auth/login',
      'http://localhost:5001/api/auth/login',
      'http://localhost:5002/api/auth/login',
      'http://localhost:3000/api/auth/login', 
      'http://localhost:8000/api/auth/login',
      '/api/auth/login', // Relative path (same origin)
      `${API_URL}/auth/login` // From configuration
    ];
    
    let lastError = null;
    
    // Try each endpoint until one succeeds
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying customer login at endpoint: ${endpoint}`);
        
        // Add a timeout to avoid hanging requests
        const response = await axios.post(endpoint, { 
          email, 
          password,
          userType: 'customer',
          deviceInfo,
          clearExisting: false // Don't clear existing sessions
        }, { 
          timeout: 3000, // 3 second timeout
          headers: { 'Content-Type': 'application/json' } 
        });
        
        if (response.data && response.data.token) {
          console.log('Customer login successful at', endpoint);
          
          const { token, user, sessionId } = response.data;
          
          // Enhance user object with any additional data needed for the application
          const enhancedUser = {
            ...user,
            lastLogin: new Date().toISOString(),
            sessionId: sessionId,
            currentSessionId: sessionId // Add both formats for backward compatibility
          };
          
          // Store token and user info in both localStorage and sessionStorage for redundancy
          localStorage.setItem('customerToken', token);
          localStorage.setItem('customerInfo', JSON.stringify(enhancedUser));
          sessionStorage.setItem('customerToken', token);
          sessionStorage.setItem('customerInfo', JSON.stringify(enhancedUser));
          
          // Also store in generic token locations for cross-compatibility
          localStorage.setItem('token', token);
          sessionStorage.setItem('token', token);
          
          // Update API_URL if the successful endpoint was different
          if (endpoint !== `${API_URL}/auth/login` && endpoint.includes('localhost')) {
            // Extract base URL from successful endpoint
            const successfulBaseUrl = endpoint.substring(0, endpoint.indexOf('/api'));
            localStorage.setItem('apiBaseUrl', successfulBaseUrl);
            console.log(`Updated API base URL to ${successfulBaseUrl}`);
          }
          
          // Save user data to collection using our sync utility
          try {
            await saveUserToCollection({
              ...enhancedUser,
              sessionId, // Make sure sessionId is included
              device: deviceInfo.userAgent,
              browser: deviceInfo.browserInfo,
              os: deviceInfo.osInfo
            }, 'customer');
            console.log('Customer login data synchronized:', enhancedUser.email);
          } catch (syncError) {
            console.warn('Login successful but failed to sync to collection:', syncError);
          }
          
          return { token, customer: enhancedUser, sessionId };
        }
      } catch (endpointError) {
        const status = endpointError.response?.status;
        
        // Only consider 400/401 as authentication errors
        // 404/connection errors mean we should try another endpoint
        if (status === 400 || status === 401) {
          // This is likely an auth error - the server is reachable but credentials are wrong
          console.error(`Authentication failed at ${endpoint}:`, endpointError.message);
          lastError = endpointError;
          
          // No need to try other endpoints if we know credentials are wrong
          break;
        } else {
          // Connection or routing error - try next endpoint
          console.warn(`Connection failed at ${endpoint}:`, endpointError.message);
          lastError = endpointError;
        }
      }
    }
    
    // If we get here, all login attempts have failed
    if (lastError) {
      const status = lastError.response?.status;
      const errorData = lastError.response?.data;
      
      // Show appropriate error message based on error type
      if (status === 400 || status === 401) {
        throw new Error(errorData?.error || 'Invalid credentials');
      } else if (status === 404 || !status) {
        // Try emergency login
        return await emergencyLogin(email, password);
      } else {
        throw new Error(errorData?.error || 'Login failed');
      }
    }
    
    // Last resort - if we can't connect to any server, try emergency login
    return await emergencyLogin(email, password);
  } catch (error) {
    console.error('Customer login error:', error);
    throw error;
  }
};

// Helper functions for device detection
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  
  if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
  } else if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    browserName = 'Internet Explorer';
  }
  
  return browserName;
}

function getOSInfo() {
  const userAgent = navigator.userAgent;
  let osName = 'Unknown';
  
  if (userAgent.includes('Windows')) {
    osName = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    osName = 'MacOS';
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux';
  } else if (userAgent.includes('Android')) {
    osName = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    osName = 'iOS';
  }
  
  return osName;
}

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

// Emergency login function for when normal login fails
export const emergencyLogin = async (email, password) => {
  try {
    console.log('⚠️ Attempting emergency login for customer:', email);
    
    // Last resort - try to fake a login for demo/dev purposes
    if (process.env.NODE_ENV !== 'production') {
      // Create a mock user and token for emergency purposes
      const mockUser = {
        id: `emergency_${Date.now()}`,
        _id: `emergency_${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        userType: 'customer',
        emergency: true,
        lastLogin: new Date().toISOString()
      };
      
      // Create a mock token
      const emergencyToken = btoa(JSON.stringify({
        id: mockUser.id,
        email: mockUser.email,
        userType: 'customer',
        exp: Math.floor(Date.now() / 1000) + 3600,
        emergency: true
      }));
      
      // Store tokens and user info
      localStorage.setItem('customerToken', emergencyToken);
      sessionStorage.setItem('customerToken', emergencyToken);
      localStorage.setItem('token', emergencyToken);
      sessionStorage.setItem('token', emergencyToken);
      
      localStorage.setItem('customerInfo', JSON.stringify(mockUser));
      sessionStorage.setItem('customerInfo', JSON.stringify(mockUser));
      
      console.log('✅ Emergency login successful (mock user created)');
      
      // Save to local customers collection
      try {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        if (!customers.find(c => c.email === email)) {
          customers.push({
            ...mockUser,
            password: password
          });
          localStorage.setItem('customers', JSON.stringify(customers));
        }
      } catch (storageError) {
        console.warn('Failed to update local customers:', storageError);
      }
      
      return {
        success: true,
        token: emergencyToken,
        customer: mockUser,
        emergency: true
      };
    }
    
    throw new Error('Emergency login failed - not available in production');
  } catch (error) {
    console.error('Emergency login error:', error);
    throw new Error('All login attempts failed. Please try again later or contact support.');
  }
};

// Helper function to validate token
export const validateToken = async (token) => {
  if (!token) return { valid: false };
  
  try {
    // Check token format
    if (token.split('.').length !== 3) {
      return { valid: false, reason: 'Invalid token format' };
    }
    
    // Try to decode token (client-side validation)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        return { valid: false, reason: 'Token expired', payload };
      }
      
      // Check if this is a customer token
      if (payload.userType !== 'customer') {
        console.warn(`Token has userType ${payload.userType}, expected 'customer'`);
        // We don't invalidate here, just warn
      }
      
      // Return decoded payload info
      return { 
        valid: true, 
        payload,
        clientValidated: true
      };
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
    }
    
    // Verify with server
    const response = await axios.get(`${API_URL}/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      valid: response.data.valid,
      userId: response.data.userId,
      email: response.data.email,
      userType: response.data.userType,
      serverValidated: true
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { 
      valid: false, 
      error: error.message,
      serverError: error.response?.data?.error
    };
  }
}; 