import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Synchronize user data with the server
export const syncUserData = async (userData, userType = 'customer') => {
  try {
    // Add timestamp for tracking
    const syncTimestamp = new Date().toISOString();
    const dataToSync = {
      ...userData,
      lastSyncedAt: syncTimestamp,
      userType: userType
    };

    // Don't send password in sync
    if (dataToSync.password) {
      delete dataToSync.password;
    }

    // Get token based on user type
    const token = sessionStorage.getItem(
      userType === 'vendor' ? 'vendorToken' : 'customerToken'
    );

    if (!token) {
      console.error('Unable to sync user data: No auth token found');
      return false;
    }

    // Attempt to sync with server
    const response = await axios.post(
      `${API_URL}/users/sync`,
      dataToSync,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`User data synced successfully for ${userType}: ${userData.email}`);
    return response.data;
  } catch (error) {
    console.error('Failed to sync user data with server:', error);
    
    // Store sync request for retry later
    try {
      const pendingSyncs = JSON.parse(localStorage.getItem('pendingUserSyncs') || '[]');
      pendingSyncs.push({
        userData,
        userType,
        timestamp: new Date().toISOString(),
        attemptCount: 1
      });
      // Only keep last 20 pending syncs to prevent storage overflow
      const trimmedSyncs = pendingSyncs.slice(-20);
      localStorage.setItem('pendingUserSyncs', JSON.stringify(trimmedSyncs));
    } catch (storageError) {
      console.error('Error storing pending sync:', storageError);
    }
    
    return false;
  }
};

// Save user to local storage and attempt server sync
export const saveUserToCollection = async (userData, userType = 'customer') => {
  try {
    // First save to localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUserIndex = users.findIndex(u => u.email === userData.email);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex] = {
        ...users[existingUserIndex],
        ...userData,
        lastUpdated: new Date().toISOString()
      };
    } else {
      // Add new user
      users.push({
        ...userData,
        userType,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    console.log(`User saved locally: ${userData.email} (${userType})`);
    
    // Then attempt to sync with server
    await syncUserData(userData, userType);
    
    return true;
  } catch (error) {
    console.error('Error saving user to collection:', error);
    return false;
  }
};

// Process any pending sync requests
export const processPendingSyncs = async () => {
  try {
    const pendingSyncs = JSON.parse(localStorage.getItem('pendingUserSyncs') || '[]');
    if (pendingSyncs.length === 0) return;
    
    console.log(`Processing ${pendingSyncs.length} pending user syncs`);
    
    const updatedPendingSyncs = [];
    
    for (const syncItem of pendingSyncs) {
      try {
        // Skip items that have been tried too many times
        if (syncItem.attemptCount > 5) {
          console.log(`Skipping sync for ${syncItem.userData.email} - too many attempts`);
          continue;
        }
        
        // Try to sync
        const success = await syncUserData(syncItem.userData, syncItem.userType);
        
        if (!success) {
          // If failed, increment attempt count and keep in pending
          syncItem.attemptCount += 1;
          updatedPendingSyncs.push(syncItem);
        }
      } catch (syncError) {
        console.error('Error processing sync item:', syncError);
        syncItem.attemptCount += 1;
        updatedPendingSyncs.push(syncItem);
      }
    }
    
    // Save updated pending syncs back to localStorage
    localStorage.setItem('pendingUserSyncs', JSON.stringify(updatedPendingSyncs));
    console.log(`Pending syncs remaining: ${updatedPendingSyncs.length}`);
  } catch (error) {
    console.error('Error processing pending syncs:', error);
  }
};

// Initialize sync processing
export const initializeSync = () => {
  // Process pending syncs on page load
  processPendingSyncs();
  
  // Set up interval to process pending syncs
  setInterval(processPendingSyncs, 5 * 60 * 1000); // Every 5 minutes
  
  // Also process when coming back online
  window.addEventListener('online', processPendingSyncs);
};

// Utility function to recover sessions for a specific user
export const recoverUserSession = async (userId, email) => {
  try {
    // Try to get token first
    const token = localStorage.getItem('vendorToken') || sessionStorage.getItem('vendorToken');
    
    if (!token) {
      console.error('No token available for session recovery');
      return { success: false, error: 'No authentication token available' };
    }
    
    // Call the recovery endpoint
    const response = await fetch('http://localhost:5001/api/auth/recover-user-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        email
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to recover session');
    }
    
    return { success: true, result };
  } catch (error) {
    console.error('Session recovery error:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to ensure a user can log in with local credentials
export const ensureUserCanLogin = async (email, savedUserInfo) => {
  try {
    // If we have saved user info for this email
    if (savedUserInfo && savedUserInfo.email === email) {
      // Check if we need to recover session
      const sessionId = savedUserInfo.sessionId || savedUserInfo.currentSessionId;
      
      if (!sessionId) {
        // Try to recover using the user ID
        await recoverUserSession(savedUserInfo._id, email);
        console.log('Session recovery attempted for user:', email);
      }
      
      return { success: true, user: savedUserInfo };
    }
    
    return { success: false, error: 'No saved user information available' };
  } catch (error) {
    console.error('Error ensuring user can login:', error);
    return { success: false, error: error.message };
  }
}; 