const jwt = require('jsonwebtoken');
const config = require('../config/default');
const { User } = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.header('x-auth-token') || 
                req.query.token;

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No authentication token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Add user and session info to request
    req.user = decoded;
    req.sessionId = decoded.sessionId;
    
    // For critical operations, verify user exists in database
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.originalUrl.includes('/me')) {
      try {
        const user = await User.findById(decoded.id);
        if (!user) {
          console.warn(`Auth token used for deleted user: ${decoded.id}`);
          return res.status(401).json({ error: 'User no longer exists' });
        }
        
        // For emergency use, bypass most checks but log the usage
        const isEmergency = req.header('X-Emergency') === 'true' || req.query.emergency === 'true';
        
        if (isEmergency) {
          console.warn(`🚨 Emergency auth bypass used for ${user.email} (${user._id}) on ${req.originalUrl}`);
        } else {
          // Check if user is active
          if (user.isActive === false) {
            return res.status(403).json({ error: 'Account has been deactivated' });
          }
          
          // Check token matches user type (unless emergency)
          if (decoded.userType !== user.userType) {
            console.warn(`Token type (${decoded.userType}) doesn't match user type (${user.userType})`);
            // Allow it but log the mismatch
          }
        }
        
        // Add full user object to request for routes that need more user data
        req.fullUser = user;
      } catch (userLookupError) {
        console.error('Error looking up user during auth:', userLookupError);
        
        // For GET operations, we can continue even if user lookup fails
        if (req.method !== 'GET') {
          return res.status(500).json({ error: 'Authentication error' });
        }
      }
    }
    
    next();
  } catch (error) {
    // Special handling for token errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      // Handle dev/test environment with simulated tokens
      if (process.env.NODE_ENV !== 'production' && token.startsWith('eyJ')) {
        try {
          // Try to parse a base64 encoded token for development
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            
            // Add user info to request
            req.user = decoded;
            req.sessionId = decoded.sessionId || 'dev-session';
            req.dev = true;
            
            console.warn('⚠️ Using developer token bypass for:', decoded.email || 'unknown');
            return next();
          }
        } catch (parseError) {
          console.error('Dev token parse error:', parseError);
        }
      }
      
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server authentication error' });
  }
}; 