import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { 
  loginVendor, 
  logoutVendor, 
  isVendorLoggedIn, 
  getVendorInfo,
  emergencyLogin,
  validateAuthToken as validateToken
} from '../services/vendorService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token') || null);
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [notification, setNotification] = useState(null);

  // Initialize auth state from session storage
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        setLoading(true);
        
        // Check if vendor is logged in with valid token
        if (isVendorLoggedIn()) {
          try {
            // Use async function to get vendor info
            const vendorInfoResponse = await getVendorInfo();
            
            if (vendorInfoResponse.success && vendorInfoResponse.vendor) {
              console.log('User found in session:', vendorInfoResponse.vendor.email);
              setCurrentUser(vendorInfoResponse.vendor);
              
              // Set axios default headers with token
              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
              if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setToken(token);
              }
            } else {
              console.warn('Could not retrieve vendor info, will try token validation');
              // Try to validate token instead
              await validateUserToken();
            }
          } catch (vendorInfoError) {
            console.error('Error fetching vendor info:', vendorInfoError);
            // Try to validate token instead
            await validateUserToken();
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setCurrentUser(null);
      delete axios.defaults.headers.common['Authorization'];
    };

    window.addEventListener('vendorLogout', handleLogout);

    return () => {
      window.removeEventListener('vendorLogout', handleLogout);
    };
  }, []);

  // Load user from token if available
  useEffect(() => {
    if (token) {
      try {
        // Decode token to get user data
        const decoded = jwtDecode(token);
        
        // Check token expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log('Token expired, logging out');
          setToken(null);
          setCurrentUser(null);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setIsSessionValid(false);
          setNotification({
            type: 'error',
            message: 'Your session has expired. Please log in again.'
          });
          return;
        }
        
        // Set user from token
        setCurrentUser({
          id: decoded.id,
          email: decoded.email,
          userType: decoded.userType,
          sessionId: decoded.sessionId
        });
        
        // Validate token on mount
        validateUserToken();
        
      } catch (error) {
        console.error('Error parsing token:', error);
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    }
  }, [token]);

  // Validate token with backend
  const validateUserToken = async () => {
    if (!token) return false;
    
    try {
      const response = await validateToken(token);
      
      if (response.success) {
        console.log('Token validated successfully');
        return true;
      } else {
        console.log('Token validation failed', response);
        // Clear on invalid token
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setIsSessionValid(false);
        setNotification({
          type: 'error',
          message: 'Your session is invalid. Please log in again.'
        });
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setAuthError(null);
      console.log('Starting login process for:', email);
      
      setLoading(true);
      
      // Try regular login first
      const response = await loginVendor(email, password);
      
      if (response.success) {
        console.log('Login successful');
        
        // Set token state
        if (response.token) {
          setToken(response.token);
          localStorage.setItem('token', response.token);
          sessionStorage.setItem('token', response.token);
          
          // Also set vendorToken for backward compatibility
          localStorage.setItem('vendorToken', response.token);
          sessionStorage.setItem('vendorToken', response.token);
          
          // Set user info
          const userInfo = response.user || response.vendor;
          localStorage.setItem('vendorInfo', JSON.stringify(userInfo));
          sessionStorage.setItem('vendorInfo', JSON.stringify(userInfo));
          
          // Set current user state
          setCurrentUser(userInfo);
          
          // Set axios default headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        }
        
        return { success: true, user: response.user || response.vendor };
      } 
      
      // If regular login fails, try emergency login as last resort
      if (!response.success) {
        console.log('Regular login failed, trying emergency login:', response.error);
        try {
          const emergencyResponse = await emergencyLogin({ 
            email, 
            password,
            emergency: true 
          });
          
          if (emergencyResponse.success) {
            console.log('Emergency login successful');
            
            // Store token and user info
            if (emergencyResponse.token) {
              setToken(emergencyResponse.token);
              localStorage.setItem('token', emergencyResponse.token);
              sessionStorage.setItem('token', emergencyResponse.token);
              localStorage.setItem('vendorToken', emergencyResponse.token);
              sessionStorage.setItem('vendorToken', emergencyResponse.token);
            }
            
            const userInfo = emergencyResponse.user || emergencyResponse.vendor;
            setCurrentUser(userInfo);
            localStorage.setItem('vendorInfo', JSON.stringify(userInfo));
            sessionStorage.setItem('vendorInfo', JSON.stringify(userInfo));
            
            if (emergencyResponse.token) {
              axios.defaults.headers.common['Authorization'] = `Bearer ${emergencyResponse.token}`;
            }
            
            return { success: true, emergency: true, user: userInfo };
          }
          
          // If emergency login also fails, show error
          const errorMessage = emergencyResponse.error || response.error || 'Login failed. Please try again.';
          setAuthError(errorMessage);
          console.error('All login attempts failed:', errorMessage);
          return { success: false, error: errorMessage };
        } catch (emergencyError) {
          console.error('Emergency login error:', emergencyError);
          // Fall through to the error handling below
        }
      }
      
      // If we got here, login failed
      const errorMessage = response.error || 'Login failed. Please try again.';
      setAuthError(errorMessage);
      console.error('Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred during login';
      setAuthError(errorMessage);
      console.error('Login process error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user');
      await logoutVendor();
      
      // Clear all auth data from storage
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('vendorToken');
      sessionStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorInfo');
      sessionStorage.removeItem('vendorInfo');
      
      // Clear state
      setToken(null);
      setCurrentUser(null);
      setAuthError(null);
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on client side even if server logout fails
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('vendorToken');
      sessionStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorInfo');
      sessionStorage.removeItem('vendorInfo');
      
      setToken(null);
      setCurrentUser(null);
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true, error: error.message };
    }
  };

  // Set a notification that auto-dismisses
  const notify = (type, message, duration = 3000) => {
    setNotification({ type, message });
    
    // Auto-dismiss after duration
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  // Clear notification manually
  const clearNotification = () => {
    setNotification(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    authError,
    isAuthenticated: !!currentUser,
    userType: currentUser?.userType,
    token,
    isSessionValid,
    notification,
    notify,
    clearNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 