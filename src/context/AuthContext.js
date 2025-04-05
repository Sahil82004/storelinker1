import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { 
  loginVendor, 
  logoutVendor, 
  isVendorLoggedIn, 
  getVendorInfo,
  emergencyLogin
} from '../services/vendorService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state from session storage
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        setLoading(true);
        
        // Check if vendor is logged in with valid token
        if (isVendorLoggedIn()) {
          const vendorInfo = getVendorInfo();
          
          if (vendorInfo) {
            console.log('User found in session:', vendorInfo.email);
            setCurrentUser(vendorInfo);
            
            // Set axios default headers with token
            const token = sessionStorage.getItem('vendorToken');
            if (token) {
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
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

  // Login function
  const login = async (email, password) => {
    try {
      setAuthError(null);
      console.log('Starting login process for:', email);
      
      // First, check if we already have a valid session for this user
      try {
        const existingSessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
        const userSession = existingSessions.find(session => session.email === email);
        
        if (userSession) {
          console.log('Found existing session for user:', email);
          
          // Try to recover the session first
          try {
            const recoveryEndpoint = 'http://localhost:5001/api/auth/recover-user-sessions';
            const recoveryResponse = await axios.post(recoveryEndpoint, { 
              email 
            }, {
              headers: {
                // Try with any available token
                'Authorization': `Bearer ${localStorage.getItem('vendorToken') || sessionStorage.getItem('vendorToken')}`
              },
              timeout: 5000 // Short timeout as this is pre-login
            });
            
            if (recoveryResponse.data.success) {
              console.log('Session recovery successful');
            }
          } catch (recoveryErr) {
            console.log('Pre-login recovery attempt failed:', recoveryErr.message);
          }
        }
      } catch (sessionCheckError) {
        console.error('Error checking existing sessions:', sessionCheckError);
      }
      
      // Now try login with various fallbacks
      let loginResponse = null;
      let loginError = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!loginResponse && attempts < maxAttempts) {
        try {
          attempts++;
          loginResponse = await loginVendor(email, password);
          break; // Success, exit the loop
        } catch (err) {
          loginError = err;
          console.log(`Login attempt ${attempts} failed:`, err.message);
          
          // If this wasn't the last attempt, wait before trying again
          if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 500)); // 500ms delay between retries
          }
        }
      }
      
      // If all attempts failed, try one last attempt with userType null
      // This helps with cases where user exists but with a different userType
      if (!loginResponse) {
        try {
          console.log('Trying final login attempt without specifying userType');
          // Direct API call without userType specified
          const response = await axios.post('http://localhost:5001/api/auth/login', { 
            email, 
            password,
            deviceInfo: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              screenSize: `${window.screen.width}x${window.screen.height}`
            }
          });
          
          if (response.data && response.data.token) {
            loginResponse = response.data;
            
            // Store token and user info in session/local storage
            sessionStorage.setItem('vendorToken', loginResponse.token);
            sessionStorage.setItem('vendorInfo', JSON.stringify(loginResponse.user));
            localStorage.setItem('vendorToken', loginResponse.token);
            localStorage.setItem('vendorInfo', JSON.stringify(loginResponse.user));
            
            // Save to user sessions for cross-reference
            try {
              const existingSessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
              const sessionInfo = {
                userId: loginResponse.user._id,
                email: loginResponse.user.email,
                userType: loginResponse.user.userType,
                sessionId: loginResponse.sessionId,
                lastActive: new Date().toISOString()
              };
              
              // Add or update the session
              const idx = existingSessions.findIndex(s => s.userId === sessionInfo.userId);
              if (idx >= 0) {
                existingSessions[idx] = sessionInfo;
              } else {
                existingSessions.push(sessionInfo);
              }
              
              localStorage.setItem('userSessions', JSON.stringify(existingSessions));
            } catch (sessionError) {
              console.error('Error saving session info:', sessionError);
            }
          }
        } catch (finalError) {
          console.error('Final login attempt failed:', finalError);
          
          // Last resort - try emergency login functionality
          try {
            console.log('Attempting EMERGENCY login as absolute last resort');
            loginResponse = await emergencyLogin(email, password);
          } catch (emergencyError) {
            console.error('Emergency login failed:', emergencyError);
            // Continue with the original error
          }
        }
      }
      
      // If we have a successful login
      if (loginResponse && (loginResponse.token || loginResponse.fromCache)) {
        console.log('Login successful');
        setCurrentUser(loginResponse.vendor || loginResponse.user);
        
        // Set axios default headers with token if we have one
        if (loginResponse.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.token}`;
        }
        
        return { success: true };
      } else {
        // All login attempts failed
        const errorMessage = loginError?.message || 'Login failed. Please try again.';
        setAuthError(errorMessage);
        console.error('Login failed after all attempts:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred during login';
      setAuthError(errorMessage);
      console.error('Login process error:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user');
      await logoutVendor();
      setCurrentUser(null);
      setAuthError(null);
      delete axios.defaults.headers.common['Authorization'];
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout on client side even if server logout fails
      sessionStorage.removeItem('vendorToken');
      sessionStorage.removeItem('vendorInfo');
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorInfo');
      
      setCurrentUser(null);
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true, error: error.message };
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    authError,
    isAuthenticated: !!currentUser,
    userType: currentUser?.userType
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 