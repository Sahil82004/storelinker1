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
    
    console.log('Logging in vendor with:', { email, userType: 'vendor' });
    
    // Call the API for authentication
    const response = await axios.post(`${API_URL}/auth/login`, { 
      email, 
      password,
      userType: 'vendor',
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
    localStorage.setItem('vendorToken', token);
    localStorage.setItem('vendorInfo', JSON.stringify(enhancedUser));
    
    // Also store in sessionStorage for quicker access
    sessionStorage.setItem('vendorToken', token);
    sessionStorage.setItem('vendorInfo', JSON.stringify(enhancedUser));
    
    // Save user data to collection using our sync utility
    await saveUserToCollection(enhancedUser, 'vendor');
    console.log('Vendor login successful:', enhancedUser.email);
    
    return { token, vendor: enhancedUser, sessionId };
  } catch (error) {
    console.error('Vendor login error:', error);
    throw new Error(error.response?.data?.error || 'Login failed: ' + (error.message || 'Unknown error'));
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
    const vendorInfoJson = sessionStorage.getItem('vendorInfo');
    
    if (!token || !vendorInfoJson) {
      console.error('Not authenticated or missing vendor info');
      throw new Error('Authentication required');
    }

    let vendorInfo;
    try {
      vendorInfo = JSON.parse(vendorInfoJson);
      if (!vendorInfo || !vendorInfo._id) {
        console.error('Invalid vendor info');
        throw new Error('Invalid vendor information');
      }
    } catch (parseError) {
      console.error('Error parsing vendor info:', parseError);
      sessionStorage.removeItem('vendorInfo'); // Clear corrupted data
      throw new Error('Invalid vendor data format');
    }
    
    console.log('Fetching products for vendor:', vendorInfo._id);
    
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
        vendorName: vendorInfo.storeName || vendorInfo.name || 'Unknown Vendor'
      }));
      
      console.log(`Successfully fetched ${products.length} products for vendor ${vendorInfo._id}`);
      return products;
    } catch (apiError) {
      console.error('API error:', apiError);
      
      // Check for recently added products first
      const recentProducts = getRecentlyAddedProducts();
      if (recentProducts && recentProducts.length > 0) {
        console.log('Using recently added products as fallback:', recentProducts.length);
        return recentProducts;
      }
      
      // If no recent products, throw the error to be handled in the main catch block
      throw apiError;
    }
  } catch (error) {
    console.error('Error in getVendorProducts:', error);
    
    // First try to get recently added products from session storage
    const recentProducts = getRecentlyAddedProducts();
    if (recentProducts && recentProducts.length > 0) {
      console.log('Using recently added products:', recentProducts.length);
      return recentProducts;
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
    const vendorInfo = JSON.parse(sessionStorage.getItem('vendorInfo'));
    
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
      // Include store information for products listing
      vendor: vendorInfo.storeName,
      vendorName: vendorInfo.storeName,
      vendorId: vendorInfo._id,
      store: {
        id: vendorInfo._id,
        name: vendorInfo.storeName,
        vendorId: vendorInfo._id
      }
    };

    console.log('Processed API Response:', processedResponse);
    return processedResponse;
  } catch (error) {
    console.error('Error adding product:', error);
    
    // Provide more detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      throw new Error(error.response.data?.error || 
                     `Server error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      throw new Error('No response received from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
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