import axios from 'axios';
import { saveUserToCollection } from '../utils/dbSync';

const API_URL = 'http://localhost:5001/api';

// Check if vendor is logged in
export const isVendorLoggedIn = () => {
  const token = sessionStorage.getItem('vendorToken');
  return !!token;
};

// Get vendor info
export const getVendorInfo = () => {
  const vendorInfo = sessionStorage.getItem('vendorInfo');
  return vendorInfo ? JSON.parse(vendorInfo) : null;
};

// Get product by ID
export const getProductById = async (productId) => {
  try {
    const token = sessionStorage.getItem('vendorToken');
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch product');
  }
};

// Register new vendor
export const registerVendor = async (vendorData) => {
  try {
    // Ensure address is properly formatted
    let processedData = { ...vendorData };
    if (typeof processedData.address === 'object') {
      processedData.address = `${processedData.address.street || ''}, ${processedData.address.city || ''}, ${processedData.address.state || ''}`.trim();
    }
    
    // Make sure we have the userType field properly set
    const dataWithUserType = {
      ...processedData,
      userType: 'vendor',
      registrationDate: new Date().toISOString(),
      isActive: true
    };
    
    console.log('Registering vendor with data:', dataWithUserType);
    
    // Call the API to register the vendor
    const response = await axios.post(`${API_URL}/auth/register`, dataWithUserType);
    
    if (response.data && response.data.user) {
      // Save the token if provided
      if (response.data.token) {
        localStorage.setItem('vendorToken', response.data.token);
        sessionStorage.setItem('vendorToken', response.data.token);
      }
      
      // Save user info
      const userInfo = response.data.user;
      localStorage.setItem('vendorInfo', JSON.stringify(userInfo));
      sessionStorage.setItem('vendorInfo', JSON.stringify(userInfo));
      
      // Save user data to collection using our sync utility
      await saveUserToCollection(response.data.user, 'vendor');
      
      // Also save to vendors collection for store display
      try {
        const vendors = JSON.parse(localStorage.getItem('vendors') || '[]');
        const storeData = {
          ...response.data.user,
          id: response.data.user._id,
          password: undefined
        };
        localStorage.setItem('vendors', JSON.stringify([...vendors, storeData]));
        
        // Update registered stores for homepage
        const existingStores = JSON.parse(localStorage.getItem('registeredStores') || '[]');
        const storeForHomepage = {
          id: response.data.user._id,
          storeName: response.data.user.storeName,
          email: response.data.user.email,
          address: response.data.user.address || '',
          city: response.data.user.city || '',
          state: response.data.user.state || '',
          registrationDate: response.data.user.registrationDate || new Date().toISOString()
        };
        localStorage.setItem('registeredStores', JSON.stringify([...existingStores, storeForHomepage]));
        
        // Dispatch event to notify HomePage
        window.dispatchEvent(new CustomEvent('storeRegistered'));
      } catch (storageError) {
        console.error('Error saving vendor to store collection:', storageError);
      }
      
      console.log('Vendor registered successfully:', response.data.user.email);
    }
    
    return response.data;
  } catch (error) {
    console.error('Vendor registration API error:', error);
    
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error('Registration failed: ' + (error.message || 'Unknown error'));
    }
  }
};

// Login vendor
export const loginVendor = async (email, password) => {
  try {
    // Get device info for tracking
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`
    };
    
    console.log('Attempting vendor login for:', email);
    
    // Try different login approaches to maximize success chance
    let response;
    let error;
    
    // First approach: Try with vendor userType
    try {
      response = await axios.post(`${API_URL}/auth/login`, { 
        email, 
        password,
        userType: 'vendor',
        deviceInfo
      }, {
        timeout: 10000 // 10 second timeout
      });
    } catch (err) {
      console.log('First login attempt failed:', err.message);
      error = err;
      
      // Second approach: Try without specifying userType
      try {
        console.log('Trying login without userType specification');
        response = await axios.post(`${API_URL}/auth/login`, { 
          email, 
          password,
          deviceInfo
        }, {
          timeout: 10000 // 10 second timeout
        });
      } catch (fallbackErr) {
        console.log('Fallback login attempt also failed:', fallbackErr.message);
        
        // Final approach: Try a direct recovery for any user with this email
        try {
          console.log('Attempting direct session recovery for:', email);
          // Try to find the user in localStorage by email
          const savedUsers = JSON.parse(localStorage.getItem('userSessions') || '[]');
          const matchingUser = savedUsers.find(u => u.email === email);
          
          if (matchingUser) {
            console.log('Found matching user in localStorage:', matchingUser.email);
            
            // Try to recover the session
            const recoveryEndpoint = `${API_URL}/auth/recover-user-sessions`;
            const recoveryResponse = await axios.post(recoveryEndpoint, { 
              email 
            }, {
              headers: {
                // Try with any available token
                'Authorization': `Bearer ${localStorage.getItem('vendorToken') || sessionStorage.getItem('vendorToken')}`
              },
              timeout: 15000
            });
            
            if (recoveryResponse.data.success) {
              console.log('Session recovery successful, trying login again');
              
              // Try login once more after recovery
              response = await axios.post(`${API_URL}/auth/login`, { 
                email, 
                password
              }, {
                timeout: 10000
              });
            }
          }
        } catch (recoveryErr) {
          console.log('Recovery attempt failed:', recoveryErr.message);
        }
        
        // If all attempts failed, throw the original error
        if (!response) {
          throw error;
        }
      }
    }
    
    // Check if we received valid response data
    if (!response || !response.data || !response.data.token || !response.data.user) {
      console.error('Invalid response from server:', response?.data);
      throw new Error('Server returned invalid login data');
    }
    
    const { token, user, sessionId } = response.data;
    
    // Log any type warnings
    if (response.data.user.typeWarning) {
      console.warn(response.data.user.typeWarning);
    }
    
    // Enhance user object with any additional data needed for the application
    const enhancedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
      sessionId: sessionId || user.sessionId || `session_${Date.now()}`
    };
    
    // Clear any existing session data to prevent conflicts
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorInfo');
    sessionStorage.removeItem('vendorToken');
    sessionStorage.removeItem('vendorInfo');
    
    // Store token and user info in localStorage for persistence
    localStorage.setItem('vendorToken', token);
    localStorage.setItem('vendorInfo', JSON.stringify(enhancedUser));
    
    // Also store in sessionStorage for quicker access
    sessionStorage.setItem('vendorToken', token);
    sessionStorage.setItem('vendorInfo', JSON.stringify(enhancedUser));
    
    // Also store in local storage as part of user sessions for cross-referencing
    try {
      const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
      const sessionData = {
        userId: enhancedUser._id,
        email: enhancedUser.email,
        userType: enhancedUser.userType,
        sessionId: enhancedUser.sessionId,
        lastActive: new Date().toISOString()
      };
      
      // Add to sessions or update if exists
      const existingIndex = sessions.findIndex(s => s.sessionId === sessionId);
      if (existingIndex >= 0) {
        sessions[existingIndex] = sessionData;
      } else {
        sessions.push(sessionData);
      }
      
      // Limit to last 10 sessions
      const limitedSessions = sessions.slice(-10);
      localStorage.setItem('userSessions', JSON.stringify(limitedSessions));
    } catch (storageError) {
      console.error('Error saving session data to localStorage:', storageError);
    }
    
    // Save user data to collection using our sync utility
    try {
      await saveUserToCollection(enhancedUser, 'vendor');
      console.log('Vendor login successful:', enhancedUser.email);
    } catch (syncError) {
      console.error('Error syncing user data to collection:', syncError);
    }
    
    return { token, vendor: enhancedUser, sessionId: enhancedUser.sessionId };
  } catch (error) {
    console.error('Vendor login error:', error);
    
    // Try to recover session from local storage if API fails
    try {
      const storedToken = localStorage.getItem('vendorToken');
      const storedUser = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
      
      if (storedToken && storedUser && storedUser.email === email) {
        console.log('Using cached credentials as fallback');
        
        // Move to sessionStorage for current session
        sessionStorage.setItem('vendorToken', storedToken);
        sessionStorage.setItem('vendorInfo', JSON.stringify(storedUser));
        
        // Return the cached data
        return { 
          token: storedToken, 
          vendor: storedUser, 
          sessionId: storedUser.sessionId,
          fromCache: true 
        };
      }
    } catch (recoveryError) {
      console.error('Error recovering session from cache:', recoveryError);
    }
    
    // Provide more descriptive error messages based on the error type
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.response.status === 403) {
        throw new Error('Your account has been suspended. Please contact support.');
      } else if (error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
    }
    
    throw new Error('Login failed: ' + (error.message || 'Server connection error. Please try again later.'));
  }
};

// Get vendor's store details
export const getVendorStore = async (storeId) => {
  try {
    const token = sessionStorage.getItem('vendorToken');
    const response = await axios.get(`${API_URL}/stores/${storeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch store details');
  }
};

// Get all active stores
export const getAllStores = async () => {
  try {
    const response = await axios.get(`${API_URL}/stores`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch stores');
  }
};

// Get vendor's products
export const getVendorProducts = async () => {
  try {
    const token = sessionStorage.getItem('vendorToken');
    const vendorInfo = JSON.parse(sessionStorage.getItem('vendorInfo') || '{}');
    
    if (!token || !vendorInfo) {
      console.warn('Not authenticated, checking localStorage for cached products');
      // Try to get products from localStorage if not authenticated
      const cachedProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
      if (cachedProducts.length > 0) {
        console.log('Using cached products from localStorage:', cachedProducts.length);
        return cachedProducts;
      }
      throw new Error('Not authenticated');
    }
    
    try {
      // Make API request with proper authorization
      const response = await axios.get(`${API_URL}/products/vendor/${vendorInfo._id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // Increased timeout for slower connections
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Ensure each product has consistent fields for frontend use
      const products = response.data.map(product => ({
        ...product,
        _id: product._id,
        id: product.id || product._id,
        image: product.image || product.imageUrl || 'https://via.placeholder.com/300',
        imageUrl: product.imageUrl || product.image || 'https://via.placeholder.com/300',
        price: parseFloat(product.price || 0),
        originalPrice: parseFloat(product.originalPrice || product.price || 0),
        stock: parseInt(product.stock || 0),
        category: product.category || 'Other',
        vendorName: vendorInfo.storeName || vendorInfo.name || 'Unknown Vendor',
        vendorId: vendorInfo._id // Ensure vendorId is set correctly
      }));
      
      console.log(`Successfully fetched ${products.length} products for vendor ${vendorInfo._id}`);
      
      // Save products to localStorage for sharing with store page
      try {
        localStorage.setItem('vendorProducts', JSON.stringify(products));
        console.log('Saved products to localStorage for cross-page sharing');
      } catch (storageError) {
        console.error('Failed to save products to localStorage:', storageError);
      }
      
      return products;
    } catch (apiError) {
      console.error('API error:', apiError);
      
      // Check for recently added products first
      const recentProducts = getRecentlyAddedProducts();
      if (recentProducts && recentProducts.length > 0) {
        console.log('Using recently added products as fallback:', recentProducts.length);
        return recentProducts;
      }
      
      // If no recent products, check localStorage
      try {
        const cachedProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
        if (cachedProducts.length > 0) {
          console.log('Using cached products from localStorage:', cachedProducts.length);
          return cachedProducts;
        }
      } catch (localStorageError) {
        console.error('Error reading from localStorage:', localStorageError);
      }
      
      // If no products found, throw the error to be handled in the main catch block
      throw apiError;
    }
  } catch (error) {
    console.error('Error in getVendorProducts:', error);
    
    // Try to get products from localStorage as last resort
    try {
      const cachedProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
      if (cachedProducts.length > 0) {
        console.log('Using cached products from localStorage:', cachedProducts.length);
        return cachedProducts;
      }
    } catch (localStorageError) {
      console.error('Error reading from localStorage:', localStorageError);
    }
    
    // Return empty array instead of throwing an error
    console.log('No products found or API unreachable, returning empty array');
    return [];
  }
};

// Helper function to get recently added products from session storage
function getRecentlyAddedProducts() {
  try {
    const recentProductJson = sessionStorage.getItem('recentlyAddedProduct');
    if (recentProductJson) {
      const recentProduct = JSON.parse(recentProductJson);
      console.log('Found recently added product in session storage:', recentProduct);
      
      // Don't remove from session storage to preserve the product
      // sessionStorage.removeItem('recentlyAddedProduct');
      
      if (Array.isArray(recentProduct)) {
        return recentProduct;
      }
      
      return [recentProduct]; // Return as array for consistency
    }
    
    // Check if we have any saved products in local storage as backup
    const savedProductsJson = localStorage.getItem('vendorProducts');
    if (savedProductsJson) {
      const savedProducts = JSON.parse(savedProductsJson);
      if (Array.isArray(savedProducts) && savedProducts.length > 0) {
        console.log('Using saved products from localStorage:', savedProducts.length);
        return savedProducts;
      }
    }
  } catch (parseError) {
    console.error('Error parsing stored products:', parseError);
  }
  
  return null;
}

// Add new product
export const addProduct = async (productData) => {
  try {
    const token = sessionStorage.getItem('vendorToken');
    const vendorInfo = JSON.parse(sessionStorage.getItem('vendorInfo') || '{}');
    
    if (!token || !vendorInfo) {
      throw new Error('Not authenticated');
    }

    // Ensure required fields match the backend schema
    const payload = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      originalPrice: parseFloat(productData.originalPrice || productData.price),
      imageUrl: productData.imageUrl || productData.image, // Use either imageUrl or image
      category: productData.category,
      stock: parseInt(productData.stock || 10),
      // Important: Set the vendorId to ensure the product is associated with this vendor
      vendorId: vendorInfo._id,
      // Include storeId if your schema supports it for easier querying
      storeId: vendorInfo.storeId || vendorInfo._id,
      isActive: true, // Make sure product is active by default
      // Include any discount information
      discountPrice: productData.discountPrice || null
    };

    console.log('API Request payload:', payload);
    
    const response = await axios.post(`${API_URL}/products`, payload, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Ensure response has consistent fields for frontend use
    const processedResponse = {
      ...response.data,
      _id: response.data._id,
      id: response.data._id, // Ensure ID is available for frontend
      image: response.data.image || response.data.imageUrl || productData.image,
      imageUrl: response.data.imageUrl || response.data.image || productData.image,
      price: parseFloat(response.data.price || productData.price),
      originalPrice: parseFloat(response.data.originalPrice || productData.originalPrice || productData.price),
      stock: parseInt(response.data.stock || productData.stock || 10),
      category: response.data.category || productData.category || 'Other',
      // Include store information for cross-page sharing
      vendorId: vendorInfo._id,
      vendorName: vendorInfo.storeName || vendorInfo.name,
      store: {
        id: vendorInfo._id,
        name: vendorInfo.storeName || vendorInfo.name,
        vendorId: vendorInfo._id
      }
    };

    console.log('Processed API Response:', processedResponse);

    // Update localStorage with new product for cross-page sharing
    try {
      const existingProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
      const updatedProducts = [processedResponse, ...existingProducts];
      localStorage.setItem('vendorProducts', JSON.stringify(updatedProducts));
      console.log('Updated localStorage with new product for cross-page sharing');
    } catch (storageError) {
      console.error('Failed to update localStorage:', storageError);
    }

    return processedResponse;
  } catch (error) {
    console.error('Error in addProduct:', error);
    
    // Save to localStorage even if API fails to ensure it shows up on store page
    try {
      const tempProduct = {
        ...productData,
        _id: `temp_${Date.now()}`,
        id: `temp_${Date.now()}`,
        vendorId: JSON.parse(sessionStorage.getItem('vendorInfo') || '{}')._id,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      const existingProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
      const updatedProducts = [tempProduct, ...existingProducts];
      localStorage.setItem('vendorProducts', JSON.stringify(updatedProducts));
      console.log('Saved product to localStorage despite API error');
      
      // Return the temp product so UI still works
      return tempProduct;
    } catch (storageError) {
      console.error('Failed to save to localStorage:', storageError);
    }
    
    throw new Error(error.response?.data?.error || 'Failed to add product: ' + (error.message || 'Unknown error'));
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const token = sessionStorage.getItem('vendorToken');
    const response = await axios.put(`${API_URL}/products/${productId}`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update product');
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const token = sessionStorage.getItem('vendorToken');
    const response = await axios.delete(`${API_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete product');
  }
};

// Vendor logout
export const logoutVendor = async () => {
  try {
    // Get the token
    const token = sessionStorage.getItem('vendorToken');
    
    if (token) {
      // Call the logout API endpoint to properly end the session
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Vendor logged out successfully');
    }
  } catch (error) {
    console.error('Error logging out vendor:', error);
    // Continue with local logout even if API call fails
  } finally {
    // Always clear local storage regardless of API success
    sessionStorage.removeItem('vendorToken');
    sessionStorage.removeItem('vendorInfo');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorInfo');
    
    // Dispatch logout event
    window.dispatchEvent(new Event('vendorLogout'));
  }
};

// Logout from all devices
export const logoutFromAllDevices = async () => {
  try {
    // Get the token
    const token = sessionStorage.getItem('vendorToken');
    
    if (token) {
      // Call the logout-all API endpoint to end all sessions
      await axios.post(`${API_URL}/auth/logout-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Vendor logged out from all devices');
    }
  } catch (error) {
    console.error('Error logging out from all devices:', error);
    throw new Error(error.response?.data?.error || 'Failed to logout from all devices');
  } finally {
    // Clear local storage
    sessionStorage.removeItem('vendorToken');
    sessionStorage.removeItem('vendorInfo');
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorInfo');
    
    // Dispatch logout event
    window.dispatchEvent(new Event('vendorLogout'));
  }
};

// Get vendor's active sessions
export const getVendorSessions = async () => {
  try {
    const token = sessionStorage.getItem('vendorToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await axios.get(`${API_URL}/auth/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.sessions;
  } catch (error) {
    console.error('Error fetching vendor sessions:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch sessions');
  }
};

// Store vendor session data
export const storeSessionData = async (sessionData) => {
  try {
    const token = sessionStorage.getItem('vendorToken');
    const vendorInfo = JSON.parse(sessionStorage.getItem('vendorInfo'));
    
    if (!token || !vendorInfo) {
      throw new Error('Not authenticated');
    }
    
    // Extract the sessionId from the vendorInfo
    const { currentSessionId } = vendorInfo;
    
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

// Direct last-resort login without user type - use with caution
export const emergencyLogin = async (email, password) => {
  try {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`
    };
    
    console.log('Attempting EMERGENCY login for:', email);
    
    // Use direct API call with special flag
    const response = await axios.post(`${API_URL}/auth/login`, { 
      email, 
      password,
      deviceInfo,
      emergency: true // Signal emergency login attempt
    }, {
      timeout: 15000
    });
    
    if (!response.data || !response.data.token) {
      throw new Error('Emergency login failed');
    }
    
    // Store tokens and user info
    const { token, user, sessionId } = response.data;
    
    // Store token and user info in both storage locations
    localStorage.setItem('vendorToken', token);
    localStorage.setItem('vendorInfo', JSON.stringify(user));
    sessionStorage.setItem('vendorToken', token);
    sessionStorage.setItem('vendorInfo', JSON.stringify(user));
    
    console.log('Emergency login successful for:', email);
    
    return { 
      token, 
      vendor: user, 
      sessionId,
      emergency: true
    };
  } catch (error) {
    console.error('Emergency login failed:', error);
    throw error;
  }
}; 