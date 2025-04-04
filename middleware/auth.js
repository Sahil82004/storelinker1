const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'd238d1ca75ce5287a55831d555d73ab170c193c3a6c21da43539c2732445131e3f3a2a8eadb41b3b71186fe308a0fa293b490e81bdd17b66a3b638fdd20e27eb';

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session ID exists in the token
    if (!decoded.sessionId) {
      return res.status(403).json({ message: 'Invalid token: no session ID' });
    }
    
    // Find the user and check if session is still active
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(403).json({ message: 'User no longer exists' });
    }
    
    // Find the session in the user's login history
    const sessionExists = user.loginHistory.find(
      session => session.sessionId === decoded.sessionId && session.active === true
    );
    
    if (!sessionExists) {
      return res.status(403).json({ message: 'Session expired or revoked' });
    }
    
    // Update the session's last activity time
    const sessionIndex = user.loginHistory.findIndex(
      session => session.sessionId === decoded.sessionId
    );
    
    if (sessionIndex !== -1) {
      user.loginHistory[sessionIndex].lastUpdated = new Date();
      // Save the user document to update the session's last activity time
      // We use a non-blocking save to avoid performance issues
      user.save().catch(err => console.error('Error updating session activity:', err));
    }
    
    // Attach user and session info to the request
    req.user = decoded;
    req.sessionId = decoded.sessionId;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}; 