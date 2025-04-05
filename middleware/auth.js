const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models/User');

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'storelinker_development_secret_key';

module.exports = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (tokenError) {
      console.error('Token verification error:', tokenError.name);
      
      // If it's an expired token, try to recover the session
      if (tokenError.name === 'TokenExpiredError') {
        try {
          // Peek inside expired token without verification
          decoded = jwt.decode(token);
          console.log('Recovered session from expired token:', decoded?.id);
          
          if (decoded?.id) {
            // Try to find the user and provide emergency access
            try {
              const user = await User.findById(decoded.id);
              if (user && user.isActive !== false) {
                console.log('Providing emergency access for expired token:', user.email);
                
                // Generate a new token for the user
                const newToken = user.generateAuthToken();
                
                // Return the new token so client can update it
                return res.status(401).json({ 
                  message: 'Your session has expired. Please refresh with new token.',
                  code: 'TOKEN_EXPIRED',
                  newToken: newToken,
                  userId: user._id
                });
              }
            } catch (userError) {
              console.error('Failed to provide emergency access:', userError);
            }
          }
          
          // Issue a specific expired token error
          return res.status(401).json({ 
            message: 'Your session has expired. Please log in again.',
            code: 'TOKEN_EXPIRED'
          });
        } catch (decodeError) {
          console.error('Failed to decode expired token:', decodeError);
        }
      }
      
      // For any token errors, ask user to log in again
      return res.status(401).json({ 
        message: tokenError.name === 'TokenExpiredError' 
          ? 'Your session has expired. Please log in again.' 
          : 'Invalid authentication token. Please log in again.'
      });
    }
    
    // Find the user by ID from the token
    let user;
    try {
      user = await User.findById(decoded.id);
    } catch (findError) {
      console.error('Error finding user:', findError);
      
      // Attempt to find user by email if included in token
      if (decoded.email) {
        try {
          user = await User.findOne({ email: decoded.email });
          if (user) {
            console.log(`Found user by email recovery: ${user.email}`);
          }
        } catch (emailFindError) {
          console.error('Error finding user by email:', emailFindError);
        }
      }
    }
    
    // If no user found, authentication fails
    if (!user) {
      console.log('Auth failed: User not found:', decoded.id);
      return res.status(403).json({ message: 'User account not found' });
    }
    
    // Check if account is active
    if (user.isActive === false) {
      console.log('Auth failed: User account inactive:', decoded.id);
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }
    
    // Always allow access if token is valid, but with different handling based on session state
    let sessionActive = false;
    let sessionId = null;
    
    // If token includes a sessionId, try to validate it
    if (decoded.sessionId) {
      sessionId = decoded.sessionId;
      
      // Try to find the session in user's login history
      let userSession = user.loginHistory.find(s => s.sessionId === sessionId);
      
      // Also check UserSession collection as a backup
      if (!userSession) {
        try {
          const separateSession = await UserSession.findOne({ 
            $or: [
              { sessionId: sessionId, userId: user._id },
              { userId: user._id, active: true } // Any active session for this user
            ]
          });
          
          if (separateSession) {
            console.log(`Found session in UserSession collection: ${separateSession.sessionId}`);
            sessionActive = true;
            sessionId = separateSession.sessionId;
            
            // Add session to user's login history to fix inconsistency
            try {
              // Check if this session already exists in user history
              const sessionExists = user.loginHistory.some(s => s.sessionId === separateSession.sessionId);
              
              if (!sessionExists) {
                user.loginHistory.push({
                  timestamp: separateSession.startTime || new Date(),
                  ipAddress: separateSession.ipAddress || req.ip || 'unknown',
                  device: separateSession.device || req.headers['user-agent'] || 'unknown',
                  success: true,
                  sessionId: separateSession.sessionId,
                  active: true,
                  browser: separateSession.browser || 'Unknown',
                  os: separateSession.os || 'Unknown',
                  lastUpdated: new Date()
                });
                
                // Save in non-blocking way
                user.save().catch(err => console.error('Error syncing session to user:', err));
              }
            } catch (addError) {
              console.error('Error adding session to user history:', addError);
            }
          }
        } catch (sessionLookupError) {
          console.error('Error looking up separate session:', sessionLookupError);
        }
      } 
      // If found in user document, check if active
      else if (userSession.active !== false) {
        sessionActive = true;
        
        // Update session's last activity time
        userSession.lastUpdated = new Date();
        
        // Update UserSession collection too for consistency
        try {
          await UserSession.findOneAndUpdate(
            { sessionId: sessionId },
            { 
              lastActivity: new Date(),
              active: true
            },
            { upsert: true }
          );
        } catch (updateError) {
          console.error('Error updating UserSession record:', updateError);
        }
        
        // Save user in non-blocking way
        user.save().catch(err => console.error('Error updating session activity:', err));
      }
    }
    
    // If no session found or inactive, create a new emergency session
    if (!sessionActive) {
      try {
        // Generate new session
        const emergencySessionId = require('crypto').randomBytes(16).toString('hex');
        
        // Add to user's login history
        user.loginHistory.push({
          timestamp: new Date(),
          ipAddress: req.ip || 'unknown',
          device: req.headers['user-agent'] || 'unknown',
          success: true,
          sessionId: emergencySessionId,
          active: true,
          browser: 'Emergency',
          os: 'System',
          lastUpdated: new Date()
        });
        
        // Add to UserSession collection
        const emergencySession = new UserSession({
          userId: user._id,
          userEmail: user.email,
          userType: user.userType,
          sessionId: emergencySessionId,
          device: req.headers['user-agent'] || 'unknown',
          ipAddress: req.ip || 'unknown',
          browser: 'Emergency',
          os: 'System',
          startTime: new Date(),
          lastActivity: new Date(),
          active: true,
          storeName: user.userType === 'vendor' ? user.storeName : undefined
        });
        
        await emergencySession.save();
        await user.save();
        
        console.log(`Created emergency session ${emergencySessionId} for user ${user.email}`);
        sessionActive = true;
        sessionId = emergencySessionId;
      } catch (emergencyError) {
        console.error('Error creating emergency session:', emergencyError);
      }
    }
    
    // Attach user info to request
    req.user = {
      id: user._id,
      email: user.email,
      userType: user.userType,
      sessionId: sessionId,
      sessionActive: sessionActive
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    return res.status(403).json({ 
      message: 'Authentication failed',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
  }
}; 