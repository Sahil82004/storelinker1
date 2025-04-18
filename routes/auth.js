const express = require('express');
const router = express.Router();
const { User, UserSession } = require('../models/User');
const auth = require('../middleware/auth');

// Register new user (customer or vendor)
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', { 
      email: req.body.email, 
      userType: req.body.userType,
      name: req.body.name
    });

    // Additional validation to ensure we're getting proper user data
    if (!req.body) {
      return res.status(400).json({ error: 'No request body provided' });
    }

    // Extract and normalize data
    const { email, password, name, userType, address, ...otherData } = req.body;

    // Check for specific debugging - log if we're getting a customer userType
    console.log('userType received:', userType);

    // Validate required fields
    if (!email || !password || !name || !userType) {
      return res.status(400).json({ error: 'Email, password, name, and userType are required fields' });
    }

    // Normalize userType to prevent case issues (e.g., "Customer" vs "customer")
    const normalizedUserType = userType.toLowerCase();
    
    // Only allow valid user types 
    if (!['customer', 'vendor', 'user', 'admin'].includes(normalizedUserType)) {
      return res.status(400).json({ 
        error: `Invalid userType: '${userType}'. Allowed values are 'customer', 'vendor', 'user', or 'admin'` 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Registration failed: User already exists', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user object based on type
    const userData = {
        email,
        password,
        name,
      userType: normalizedUserType, // Use normalized value
        phone: otherData.phone || '',
        isActive: true,
        lastLogin: new Date()
    };
    
    // Handle address differently based on structure provided
    if (address && typeof address === 'object') {
      userData.address = {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || address.zipCode || '',
        country: address.country || 'US'
      };
    } else {
      // Legacy address handling
      userData.address = {
        street: otherData.address || '',
        city: otherData.city || '',
        state: otherData.state || '',
        postalCode: otherData.zipCode || '',
        country: 'US'
      };
    }
    
    // Add vendor-specific fields if userType is vendor
    if (normalizedUserType === 'vendor') {
      userData.storeName = otherData.storeName || name + "'s Store";
    }

    console.log('Creating new user with data:', {
      email: userData.email,
      userType: userData.userType,
      // Exclude password for security
      fields: Object.keys(userData).filter(key => key !== 'password')
    });

    try {
    // Create new user
    user = new User(userData);
    
    // Add initial login history entry with sessionId
    const sessionId = require('crypto').randomBytes(16).toString('hex');
      user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip || 'unknown',
      device: req.headers['user-agent'] || 'unknown',
      success: true,
      sessionId: sessionId,
      active: true
    });
    
    // Save user to database
    await user.save();
      console.log(`User saved successfully: ${email} (${userData.userType})`);

    // Generate token with the session ID
    const token = user.generateAuthToken(sessionId);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Add current session ID to the response
    userResponse.currentSessionId = sessionId;
    
    res.status(201).json({
      token,
      user: userResponse,
      sessionId
    });
    
    // Log successful registration
      console.log(`New ${userData.userType} registered: ${email} (${user._id})`);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      
      // Send more detailed error message
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({ 
          error: `Validation error: ${saveError.message}`,
          details: saveError.errors
        });
      } else {
        return res.status(500).json({ 
          error: 'Registration failed: ' + (saveError.message || 'Server error when saving user') 
        });
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed: ' + (error.message || 'Unknown error'),
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Token validation endpoint
router.get('/validate-token', auth, async (req, res) => {
  try {
    // If the auth middleware passed, token is valid
    return res.json({
      valid: true,
      userId: req.user.id,
      email: req.user.email,
      userType: req.user.userType,
      sessionId: req.user.sessionId
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(401).json({
      valid: false,
      error: 'Invalid token'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', { 
      email: req.body.email, 
      userType: req.body.userType || 'not specified',
      emergency: req.body.emergency || false
    });

    const { email, password, userType, deviceInfo, emergency, clearExisting = true } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Direct database check as a fallback for problematic queries
    let user = null;
    
    try {
      // Try a direct lookup by exact email first - most reliable method
      user = await User.findOne({ email: email });
      
      if (!user && email) {
        // If that fails, try case-insensitive search
        const emailRegex = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        user = await User.findOne({ email: emailRegex });
      }
    } catch (directLookupError) {
      console.error('Error with direct user lookup:', directLookupError);
    }

    // If no user found with any query, return error
    if (!user) {
      console.log(`Login failed: No user found matching email: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', { 
      id: user._id, 
      email: user.email, 
      userType: user.userType 
    });

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password for user:', user.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate session ID
    const sessionId = require('crypto').randomBytes(16).toString('hex');

    // Record login in the user document with the session ID
    await user.recordLoginWithSession(
      req.ip || 'unknown',
      deviceInfo?.userAgent || req.headers['user-agent'] || 'unknown',
      true,
      sessionId
    );

    // Explicitly ensure the session is in UserSession collection
    const userSession = new UserSession({
      userId: user._id,
      userEmail: user.email,
      userType: user.userType,
      sessionId: sessionId,
      ipAddress: req.ip || 'unknown',
      device: deviceInfo?.userAgent || req.headers['user-agent'] || 'unknown',
      browser: deviceInfo?.browser || 'Unknown',
      os: deviceInfo?.platform || 'Unknown',
      startTime: new Date(),
      lastActivity: new Date(),
      active: true,
      storeName: user.userType === 'vendor' ? user.storeName : undefined
    });
    
    try {
      // First check if this session already exists
      const existingSession = await UserSession.findOne({ sessionId });
      
      if (!existingSession) {
        await userSession.save();
        console.log(`Created new session in UserSession collection during login: ${sessionId}`);
      } else {
        // Update the existing session
        existingSession.lastActivity = new Date();
        existingSession.active = true;
        await existingSession.save();
        console.log(`Updated existing session in UserSession collection: ${sessionId}`);
      }
    } catch (sessionError) {
      console.error('Error saving session to UserSession collection:', sessionError);
      // Continue execution even if session save fails
    }

    // Generate token with the session ID
    const token = user.generateAuthToken(sessionId);

    // Create sanitized user response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.emailVerificationToken;
    delete userResponse.loginHistory; // Don't send full history to client
    
    // Add useful session info
    userResponse.lastLogin = new Date();
    userResponse.currentSessionId = sessionId;
    
    console.log(`Login successful: ${user.email} (${user.userType}) with session ${sessionId}`);
    
    res.json({
      token,
      user: userResponse,
      sessionId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: error.message || 'Authentication failed. Please try again.'
    });
  }
});

// Store user session data
router.post('/session', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, sessionData } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the session in the user's loginHistory
    const sessionIndex = user.loginHistory.findIndex(
      entry => entry.sessionId === sessionId
    );
    
    if (sessionIndex === -1) {
      // Session not found, create a new login record
      console.log(`Creating new session ${sessionId} for user ${user.email}`);
      user.loginHistory.push({
        timestamp: new Date(),
        ipAddress: req.ip || 'unknown',
        device: req.headers['user-agent'] || 'unknown',
        success: true,
        sessionId: sessionId,
        data: sessionData || {}
      });
    } else {
      // Update existing session data
      console.log(`Updating session ${sessionId} for user ${user.email}`);
      user.loginHistory[sessionIndex].lastUpdated = new Date();
      user.loginHistory[sessionIndex].data = {
        ...user.loginHistory[sessionIndex].data,
        ...sessionData
      };
    }
    
    // Save updated user
    await user.save();
    
    res.json({
      success: true,
      message: 'Session data stored successfully'
    });
  } catch (error) {
    console.error('Error storing session data:', error);
    res.status(500).json({ error: 'Failed to store session data' });
  }
});

// Get user's active sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get only active sessions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeSessions = user.loginHistory
      .filter(session => 
        session.timestamp > thirtyDaysAgo && 
        session.success && 
        session.sessionId
      )
      .map(session => ({
        sessionId: session.sessionId,
        timestamp: session.timestamp,
        device: session.device,
        ipAddress: session.ipAddress,
        lastUpdated: session.lastUpdated || session.timestamp
      }));
    
    res.json({
      sessions: activeSessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer profile
router.get('/customer/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.userType !== 'customer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Completely remove storeName for customers
    const userResponse = user.toObject();
    delete userResponse.storeName;

    res.json(userResponse);
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vendor profile
router.get('/vendor/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update customer profile
router.put('/customer/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.userType !== 'customer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, phone, address } = req.body;

    // Save current data to history before updating
    const historyEntry = {
      name: user.name,
      phone: user.phone,
      address: user.address,
      modifiedAt: new Date()
    };

    // Add to history array
    user.history.push(historyEntry);

    // Update with new values
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update vendor profile
router.put('/vendor/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, phone, address, city, state, zipCode, storeName } = req.body;

    // Save current data to history before updating
    const historyEntry = {
      name: user.name,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      storeName: user.storeName,
      modifiedAt: new Date()
    };

    // Add to history array
    user.history.push(historyEntry);

    // Update with new values
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.city = city || user.city;
    user.state = state || user.state;
    user.zipCode = zipCode || user.zipCode;
    user.storeName = storeName || user.storeName;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout - end the current session
router.post('/logout', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.sessionId;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'No active session ID found' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // End the session using the user model method
    const sessionEnded = await user.endSession(sessionId);
    
    if (sessionEnded) {
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Session not found or already ended'
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Logout from all devices - end all active sessions
router.post('/logout-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Mark all active sessions as ended
    let sessionsEnded = 0;
    for (let i = 0; i < user.loginHistory.length; i++) {
      if (user.loginHistory[i].active && !user.loginHistory[i].endedAt) {
        user.loginHistory[i].active = false;
        user.loginHistory[i].endedAt = new Date();
        sessionsEnded++;
      }
    }
    
    // Update active sessions count
    user.activeSessions = 0;
    
    // Save the user
    await user.save();
    
    res.json({
      success: true,
      message: `Logged out of all devices successfully (${sessionsEnded} sessions ended)`
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Logout from all devices failed' });
  }
});

// Admin route - Get all users (for admins only)
router.get('/users/all', auth, async (req, res) => {
  try {
    // Check if user is admin (you could add an admin field to the User model)
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }

    // Get users with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get users count
    const totalUsers = await User.countDocuments();
    
    // Get users with pagination, sorted by newest first
    const users = await User.find()
      .select('-password -loginHistory -history') // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get users count by type
router.get('/users/count', auth, async (req, res) => {
  try {
    // Check authorization
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get counts by user type
    const customerCount = await User.countDocuments({ userType: 'customer' });
    const vendorCount = await User.countDocuments({ userType: 'vendor' });
    const totalCount = customerCount + vendorCount;

    // Get count of active users (logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeCount = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    res.json({
      total: totalCount,
      customers: customerCount,
      vendors: vendorCount,
      active: activeCount
    });
  } catch (error) {
    console.error('Error fetching user counts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add synchronization endpoint for user data
router.post('/users/sync', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = req.body;

    // Get the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save current data to history before updating
    const historyEntry = {
      name: user.name,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      storeName: user.storeName,
      modifiedAt: new Date()
    };

    // Only add to history if there are actual changes
    const hasChanges = Object.keys(historyEntry).some(key => 
      historyEntry[key] !== undefined && 
      userData[key] !== undefined && 
      String(historyEntry[key]) !== String(userData[key])
    );

    if (hasChanges) {
      // Add to history array
      user.history.push(historyEntry);
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

// Get all user sessions (including historical)
router.get('/all-sessions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get all sessions from UserSession collection
    const allSessions = await UserSession.find({ 
      userId: userId 
    }).sort({ startTime: -1 });
    
    res.json({
      currentSessions: user.loginHistory.filter(session => session.active).length,
      totalSessions: allSessions.length,
      sessions: allSessions.map(session => ({
        sessionId: session.sessionId,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        endTime: session.endTime,
        device: session.device,
        browser: session.browser,
        os: session.os,
        ipAddress: session.ipAddress,
        active: session.active
      }))
    });
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get session stats for current user
router.get('/session-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get count of active sessions
    const activeSessions = await UserSession.countDocuments({ 
      userId: userId,
      active: true
    });
    
    // Get count of total sessions
    const totalSessions = await UserSession.countDocuments({ 
      userId: userId 
    });
    
    // Get most recent sessions
    const recentSessions = await UserSession.find({ 
      userId: userId 
    })
    .sort({ startTime: -1 })
    .limit(5);
    
    // Get last login time
    const user = await User.findById(userId);
    
    res.json({
      activeSessions,
      totalSessions,
      lastLogin: user ? user.lastLogin : null,
      recentSessions: recentSessions.map(session => ({
        sessionId: session.sessionId,
        startTime: session.startTime,
        device: session.device,
        browser: session.browser,
        active: session.active
      }))
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({ error: 'Failed to fetch session statistics' });
  }
});

// Admin route to fix customer records with storeName values
router.post('/admin/fix-customer-store-names', auth, async (req, res) => {
  try {
    // Check if user is admin/vendor
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Run the fix
    const fixedCount = await User.fixCustomerStoreNames();
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} customer accounts`
    });
  } catch (error) {
    console.error('Error fixing customer records:', error);
    res.status(500).json({ error: 'Failed to fix customer records' });
  }
});

// Admin route to initialize system and sync user sessions
router.post('/admin/init-system', auth, async (req, res) => {
  try {
    // Check if user is admin/vendor
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Call the initialization method
    const result = await User.initializeSystem();
    
    res.json({
      success: true,
      message: 'System initialized successfully',
      result
    });
  } catch (error) {
    console.error('Error initializing system:', error);
    res.status(500).json({ error: 'Failed to initialize system' });
  }
});

// Route to recover a specific user's sessions
router.post('/recover-user-sessions', auth, async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    // Check if the request is from the user themselves or an admin
    if (req.user.id !== userId && req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Find user
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({ error: 'Either userId or email is required' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find all sessions for this user in UserSession collection
    const userSessions = await UserSession.find({
      userId: user._id,
      active: true
    }).sort({ lastActivity: -1 });
    
    console.log(`Found ${userSessions.length} active sessions in UserSession collection for ${user.email}`);
    
    // Add any missing sessions to the user document
    let addedSessions = 0;
    
    for (const session of userSessions) {
      // Check if session exists in user's login history
      const sessionExists = user.loginHistory.some(
        s => s.sessionId === session.sessionId
      );
      
      if (!sessionExists) {
        // Add session to user's login history
        user.loginHistory.push({
          timestamp: session.startTime,
          ipAddress: session.ipAddress || 'unknown',
          device: session.device || 'unknown',
          browser: session.browser || 'unknown',
          os: session.os || 'unknown',
          success: true,
          sessionId: session.sessionId,
          active: true,
          lastUpdated: session.lastActivity || new Date()
        });
        
        addedSessions++;
      }
    }
    
    // Update active sessions count
    user.activeSessions = user.loginHistory.filter(session => 
      session.active === true
    ).length;
    
    // Save user document
    await user.save();
    
    res.json({
      success: true,
      message: `User sessions recovered successfully. Added ${addedSessions} sessions.`,
      user: {
        id: user._id,
        email: user.email,
        activeSessions: user.activeSessions
      }
    });
  } catch (error) {
    console.error('Error recovering user sessions:', error);
    res.status(500).json({ error: 'Failed to recover user sessions' });
  }
});

// New route to recover sessions for all database users
router.post('/admin/recover-all-sessions', auth, async (req, res) => {
  try {
    // Check if user is admin/vendor
    const user = await User.findById(req.user.id);
    if (!user || user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Get all users
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} users to process`);
    
    // Count statistics
    let recoveredUsers = 0;
    let totalSessions = 0;
    
    // Process each user
    for (const currentUser of allUsers) {
      try {
        // Make sure the user has at least one active session
        const activeSessions = currentUser.loginHistory.filter(s => s.active === true);
        
        if (activeSessions.length === 0) {
          // Create a new session for this user
          const sessionId = require('crypto').randomBytes(16).toString('hex');
          
          // Add to user's login history
          currentUser.loginHistory.push({
            timestamp: new Date(),
            ipAddress: '127.0.0.1',
            device: 'System recovery',
            browser: 'System',
            os: 'System',
            success: true,
            sessionId: sessionId,
            active: true,
            lastUpdated: new Date()
          });
          
          // Update active sessions count
          currentUser.activeSessions = 1;
          
          // Also add to UserSession collection
          const newSessionDoc = new UserSession({
            userId: currentUser._id,
            userEmail: currentUser.email,
            userType: currentUser.userType,
            sessionId,
            device: 'System recovery',
            ipAddress: '127.0.0.1',
            browser: 'System',
            os: 'System',
            startTime: new Date(),
            lastActivity: new Date(),
            active: true,
            storeName: currentUser.userType === 'vendor' ? currentUser.storeName : undefined
          });
          
          await newSessionDoc.save();
          await currentUser.save();
          
          recoveredUsers++;
          totalSessions++;
        } else {
          // User already has active sessions
          totalSessions += activeSessions.length;
        }
      } catch (userError) {
        console.error(`Error processing user ${currentUser.email}:`, userError);
      }
    }
    
    res.json({
      success: true,
      message: `User session recovery complete`,
      stats: {
        totalUsers: allUsers.length,
        recoveredUsers,
        totalSessions
      }
    });
  } catch (error) {
    console.error('Error in session recovery:', error);
    res.status(500).json({ error: 'Failed to recover sessions' });
  }
});

module.exports = router; 