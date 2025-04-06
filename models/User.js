const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || 'storelinker_development_secret_key';

// User Session Schema for tracking login sessions
const UserSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['user', 'vendor', 'customer', 'admin'],
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  device: {
    type: String,
    default: 'unknown'
  },
  browser: {
    type: String,
    default: 'unknown'
  },
  os: {
    type: String,
    default: 'unknown'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  },
  logoutMethod: {
    type: String,
    enum: ['manual', 'expired', 'system', 'forced', null],
    default: null
  },
  storeName: {
    type: String
  }
}, { timestamps: true });

// Login history entry schema
const LoginHistoryEntrySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  device: {
    type: String
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  success: {
    type: Boolean,
    default: false
  },
  failureReason: {
    type: String
  },
  sessionId: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Main User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    enum: ['user', 'vendor', 'customer', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'US' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  loginHistory: [LoginHistoryEntrySchema],
  storeName: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
      type: Date,
      default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash the password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update the updatedAt timestamp
    this.updatedAt = Date.now();
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Handle the case when password might be missing
    if (!this.password) {
      console.error(`User ${this.email} has no password stored`);
      return false;
    }
    
    // If it's a development environment and we're using a special test password
    if (process.env.NODE_ENV === 'development' && 
        process.env.DEV_MASTER_PASSWORD && 
        candidatePassword === process.env.DEV_MASTER_PASSWORD) {
      console.log(`Using development master password for user ${this.email}`);
      return true;
    }
    
    // Normal password comparison using bcrypt
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    // If normal comparison fails, but we're in a development or test environment
    // and using a plain text fallback for old accounts
    if (!isMatch && 
        (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && 
        candidatePassword === this.password) {
      console.warn(`User ${this.email} using plain text password comparison as fallback`);
      
      // Auto-update the password to be hashed for future logins
      this.password = candidatePassword; // This will get hashed by the pre-save hook
      await this.save();
      
      return true;
    }
    
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function(sessionId = null) {
  // Generate a session ID if not provided
  if (!sessionId) {
    sessionId = require('crypto').randomBytes(16).toString('hex');
  }
  
  // Create payload with essential user data
  const payload = {
    id: this._id,
    email: this.email,
    userType: this.userType,
    sessionId: sessionId
  };
  
  // Add storeName for vendors
  if (this.userType === 'vendor' && this.storeName) {
    payload.storeName = this.storeName;
  }
  
  // Sign the token with payload and expiration
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: '1d' } // Token expires in 1 day
  );
};

// Create a sanitized user object without sensitive info
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  return user;
};

// Static method to fix customer records with non-null storeName values
UserSchema.statics.fixCustomerStoreNames = async function() {
  try {
    // Find all customer accounts with a storeName field
    const customers = await this.find({ 
      userType: 'customer', 
      storeName: { $exists: true } 
    });
    
    console.log(`Found ${customers.length} customer accounts with storeName field`);
    
    // Completely remove storeName field from each customer document
    for (const customer of customers) {
      await this.updateOne(
        { _id: customer._id },
        { $unset: { storeName: 1 } }
      );
    }
    
    console.log(`Fixed ${customers.length} customer accounts by removing storeName field`);
    return customers.length;
  } catch (error) {
    console.error('Error removing storeName from customer records:', error);
    throw error;
  }
};

// Static method to initialize the system and fix any inconsistencies
UserSchema.statics.initializeSystem = async function() {
  try {
    console.log('Initializing system...');
    let results = {
      sessionsCorrected: 0,
      customersFixed: 0
    };
    
    // Fix customer records with storeName values
    try {
      const fixedCount = await this.fixCustomerStoreNames();
      results.customersFixed = fixedCount;
    } catch (customerError) {
      console.error('Error fixing customer store names:', customerError);
    }
    
    // Synchronize sessions between User documents and UserSession collection
    try {
      // Find all users with active sessions
      const users = await this.find({ 
        "loginHistory.active": true,
        "loginHistory.sessionId": { $exists: true }
      });
      
      console.log(`Found ${users.length} users with active sessions to synchronize`);
      
      let sessionCount = 0;
      
      // Process each user's sessions
      for (const user of users) {
        const activeSessions = user.loginHistory.filter(
          session => session.active && session.sessionId
        );
        
        // Skip users with no active sessions
        if (activeSessions.length === 0) continue;
        
        for (const session of activeSessions) {
          // Check if session exists in UserSession collection
          let sessionDoc = await UserSession.findOne({ sessionId: session.sessionId });
          
          if (!sessionDoc) {
            // Create new entry in UserSession collection
            sessionDoc = new UserSession({
              userId: user._id,
              userEmail: user.email,
              userType: user.userType,
              sessionId: session.sessionId,
              device: session.device || 'Unknown',
              ipAddress: session.ipAddress || 'Unknown',
              browser: session.browser || 'Unknown',
              os: session.os || 'Unknown',
              startTime: session.timestamp || new Date(),
              lastActivity: session.lastUpdated || new Date(),
              active: true,
              storeName: user.userType === 'vendor' ? user.storeName : undefined
            });
            
            await sessionDoc.save();
            sessionCount++;
          }
        }
      }
      
      results.sessionsCorrected = sessionCount;
      console.log(`Created ${sessionCount} missing session entries in UserSession collection`);
    } catch (sessionError) {
      console.error('Error synchronizing sessions:', sessionError);
    }
    
    console.log('System initialization complete');
    return results;
  } catch (error) {
    console.error('Error in system initialization:', error);
    throw error;
  }
};

// Method to record login attempt (legacy method - kept for compatibility)
UserSchema.methods.recordLogin = async function(ipAddress = '', device = '', success = true) {
  try {
    this.lastLogin = new Date();
    this.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      device,
      success
    });
    
    // Only keep the most recent 30 login records
    if (this.loginHistory.length > 30) {
      this.loginHistory = this.loginHistory.slice(-30);
    }
    
    await this.save();
    return true;
  } catch (error) {
    console.error('Error recording login:', error);
    return false;
  }
};

// Method to record login with session
UserSchema.methods.recordLoginWithSession = async function(ipAddress = '', device = '', success = true, sessionId = null) {
  try {
    this.lastLogin = new Date();
    
    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = require('crypto').randomBytes(16).toString('hex');
    }
    
    // Check if this session already exists in login history
    const existingSession = this.loginHistory.find(entry => entry.sessionId === sessionId);
    
    // Parse user agent data
    const userAgent = device;
    let browser = 'Unknown';
    let os = 'Unknown';
      
    try {
      if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
      } else if (userAgent.includes('Chrome')) {
        browser = 'Chrome';
      } else if (userAgent.includes('Safari')) {
        browser = 'Safari';
      } else if (userAgent.includes('Edge')) {
        browser = 'Edge';
      } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
        browser = 'Internet Explorer';
      }
      
      if (userAgent.includes('Windows')) {
        os = 'Windows';
      } else if (userAgent.includes('Mac OS')) {
        os = 'MacOS';
      } else if (userAgent.includes('Linux')) {
        os = 'Linux';
      } else if (userAgent.includes('Android')) {
        os = 'Android';
      } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        os = 'iOS';
      }
    } catch (parsingError) {
      console.error('Error parsing user agent:', parsingError);
    }
    
    // Update loginHistory in User document
    if (existingSession) {
      // Update the existing session
      existingSession.lastUpdated = new Date();
      existingSession.active = true;
    } else {
      // Add new login history entry with sessionId
      this.loginHistory.push({
        timestamp: new Date(),
        ipAddress,
        device: userAgent,
        browser,
        os,
        success,
        sessionId,
        active: true,
        lastUpdated: new Date()
      });
    }
    
    // Only keep the most recent 30 login records
    if (this.loginHistory.length > 30) {
      this.loginHistory = this.loginHistory.slice(-30);
    }
    
    // Save changes to the user document
    await this.save();
    
    // ALWAYS create or update entry in UserSession collection
    try {
      const UserSession = mongoose.model('UserSession');
      
      // First check if session exists
      let sessionDoc = await UserSession.findOne({ sessionId });
      
      if (!sessionDoc) {
        // Create new session document
        sessionDoc = new UserSession({
          userId: this._id,
          userEmail: this.email,
          userType: this.userType,
          sessionId,
          device: userAgent,
          ipAddress,
          browser,
          os,
          startTime: new Date(),
          lastActivity: new Date(),
          active: true,
          storeName: this.userType === 'vendor' ? this.storeName : undefined
        });
        
        await sessionDoc.save();
        console.log(`Created new session in UserSession collection: ${sessionId}`);
      } else {
        // Update existing session
        sessionDoc.lastActivity = new Date();
        sessionDoc.active = true;
        await sessionDoc.save();
        console.log(`Updated existing session in UserSession collection: ${sessionId}`);
      }
    } catch (sessionError) {
      console.error('Error managing session in UserSession collection:', sessionError);
      // Continue even if UserSession update fails
    }
    
    // Return session ID
    return {
      success: true,
      sessionId
    };
  } catch (error) {
    console.error('Error recording login with session:', error);
    // Return session ID even if there was an error, to allow login to continue
    return {
      success: false,
      sessionId,
      error
    };
  }
};

// Method to end a session
UserSchema.methods.endSession = async function(sessionId) {
  try {
    // Find the session in login history
    const sessionIndex = this.loginHistory.findIndex(
      entry => entry.sessionId === sessionId && entry.active
    );
    
    if (sessionIndex !== -1) {
      // Mark session as ended in user document
      this.loginHistory[sessionIndex].active = false;
      this.loginHistory[sessionIndex].endedAt = new Date();
      
      // Save user document changes
      await this.save();
      
      // Also update the session in UserSession collection
      try {
        await UserSession.findOneAndUpdate(
          { sessionId: sessionId },
          { 
            active: false, 
            endTime: new Date(),
            lastActivity: new Date()
          }
        );
        console.log(`Session ${sessionId} marked as ended in UserSession collection`);
      } catch (sessionError) {
        console.error('Error updating session in UserSession collection:', sessionError);
        // Continue even if session update in separate collection fails
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error ending session:', error);
    return false;
  }
};

// Create models
const User = mongoose.model('User', UserSchema);
const UserSession = mongoose.model('UserSession', UserSessionSchema);

module.exports = {
  User,
  UserSession
}; 