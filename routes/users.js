const express = require('express');
const router = express.Router();
const { User, UserSession } = require('../models/User');
const auth = require('../middleware/auth');

// Sync user data
router.post('/sync', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = req.body;

    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields - never update email or password via sync
    const allowedFields = [
      'name', 'phone', 'address', 'city', 'state', 'zipCode', 
      'storeName', 'lastLogin', 'isActive', 'verified'
    ];

    allowedFields.forEach(field => {
      if (userData[field] !== undefined) {
        user[field] = userData[field];
      }
    });

    // Add sync timestamp
    user.lastSyncedAt = new Date();

    await user.save();
    console.log(`User data synced for ${user.email} (${user._id})`);

    // Create or update session info in UserSession collection
    if (userData.sessionId) {
      try {
        let sessionDoc = await UserSession.findOne({ sessionId: userData.sessionId });
        
        if (!sessionDoc) {
          // Create new session entry in UserSession collection
          sessionDoc = new UserSession({
            userId: user._id,
            userEmail: user.email,
            userType: user.userType,
            sessionId: userData.sessionId,
            ipAddress: userData.ipAddress || 'unknown',
            device: userData.device || 'unknown',
            browser: userData.browser || 'Unknown',
            os: userData.os || 'Unknown',
            startTime: new Date(),
            lastActivity: new Date(),
            active: true,
            storeName: user.userType === 'vendor' ? user.storeName : undefined
          });
          
          await sessionDoc.save();
          console.log(`Created session in UserSession collection during sync: ${userData.sessionId}`);
        } else {
          // Update existing session
          sessionDoc.lastActivity = new Date();
          await sessionDoc.save();
        }
      } catch (sessionError) {
        console.error('Error updating session during sync:', sessionError);
        // Continue even if session update fails
      }
    }

    // Return success with minimal user data
    res.json({
      success: true,
      syncedAt: user.lastSyncedAt,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        lastSyncedAt: user.lastSyncedAt
      }
    });
  } catch (error) {
    console.error('Error syncing user data:', error);
    res.status(500).json({ error: 'Failed to sync user data' });
  }
});

// Get user sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all sessions for this user from UserSession collection
    const sessions = await UserSession.find({ 
      userId: userId 
    }).sort({ lastActivity: -1 });
    
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// End user session
router.post('/sessions/end', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Update session in UserSession collection
    const session = await UserSession.findOneAndUpdate(
      { 
        userId: userId,
        sessionId: sessionId 
      },
      { 
        active: false,
        endTime: new Date(),
        logoutMethod: 'manual'
      },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Also update user's loginHistory
    const user = await User.findById(userId);
    if (user) {
      const sessionIndex = user.loginHistory.findIndex(s => s.sessionId === sessionId);
      if (sessionIndex !== -1) {
        user.loginHistory[sessionIndex].active = false;
        user.loginHistory[sessionIndex].lastUpdated = new Date();
        await user.save();
      }
    }
    
    res.json({ 
      message: 'Session ended successfully',
      session
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

module.exports = router; 