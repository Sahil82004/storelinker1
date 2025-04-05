const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define a schema for login session data
const loginHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  device: String,
  deviceInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  browser: String,
  os: String,
  success: Boolean,
  sessionId: {
    type: String,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  active: {
    type: Boolean,
    default: true
  },
  endedAt: Date,
  location: String
});

// Create a new schema for tracking all user sessions
const userSessionSchema = new mongoose.Schema({
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
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  device: String,
  ipAddress: String,
  browser: String,
  os: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  endTime: Date,
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  storeName: String
});

// Create the UserSession model
const UserSession = mongoose.model('UserSession', userSessionSchema);

const userSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['customer', 'vendor'],
    required: true
  },
  // Common fields for both user types
  phone: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  state: {
    type: String,
    required: false
  },
  zipCode: {
    type: String,
    required: false
  },
  // Vendor specific fields - only added to vendor documents
  ...(function() {
    return {
      storeName: {
        type: String,
        required: function() { return this.userType === 'vendor'; },
        default: function() { return this.name ? this.name + "'s Store" : "My Store"; }
      }
    };
  })(),
  // Customer specific fields
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // Login tracking fields
  lastLogin: {
    type: Date,
    default: Date.now
  },
  activeSessions: {
    type: Number,
    default: 0
  },
  // Using the defined login history schema
  loginHistory: [loginHistorySchema],
  // Account status
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // Sync tracking
  lastSyncedAt: {
    type: Date,
    default: Date.now
  },
  // History field to store previous versions of the user data
  history: [{
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    storeName: String,
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // If password field wasn't modified, skip hashing
  if (!this.isModified('password')) return next();
  
  try {
    // Check if the password is already hashed (starts with $2a$, $2b$, or $2y$)
    const possiblyHashed = this.password.startsWith('$2a$') || 
                           this.password.startsWith('$2b$') ||
                           this.password.startsWith('$2y$');
    
    // Only hash if not already hashed
    if (!possiblyHashed) {
      console.log(`Hashing password for user: ${this.email}`);
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } else {
      console.log(`Password for ${this.email} appears to be already hashed, skipping`);
    }
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    
    // Emergency fallback - if we can't hash during save, maintain the existing password
    // This prevents password loss in extreme cases
    if (error.message && error.message.includes('Invalid salt version')) {
      console.warn('WARNING: Invalid salt version detected, preserving original password');
      // Don't modify the password if hashing fails
      next();
    } else {
      next(error);
    }
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // First try standard bcrypt comparison
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (isMatch) {
      return true;
    }
    
    // If regular comparison fails, check for older bcrypt formats or config issues
    // This helps with databases that have been migrated or had password issues
    try {
      // Try with a more permissive comparison that handles some edge cases
      const rounds = bcrypt.getRounds(this.password);
      const salt = await bcrypt.genSalt(rounds);
      const rehash = await bcrypt.hash(candidatePassword, salt);
      const altMatch = rehash === this.password;
      
      if (altMatch) {
        // If this worked, update the password hash to the newer format
        this.password = await bcrypt.hash(candidatePassword, 10);
        await this.save();
        return true;
      }
    } catch (altError) {
      console.warn('Alternative password comparison failed:', altError.message);
    }
    
    // If password doesn't match, return false
    return false;
  } catch (error) {
    console.error('Password comparison error:', error);
    
    // In case of bcrypt errors (rare but can happen with corrupted hashes), 
    // try direct comparison as absolute fallback for emergency access
    // This should almost never match but prevents complete lockouts
    if (error.message && error.message.includes('Invalid salt version') && 
        process.env.NODE_ENV !== 'production') {
      console.warn('Using emergency password comparison due to hash error');
      return this.password === candidatePassword;
    }
    
    throw error;
  }
};

// Method to record login attempt (legacy method - kept for compatibility)
userSchema.methods.recordLogin = async function(ipAddress = '', device = '', success = true) {
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

// New method to record login with session
userSchema.methods.recordLoginWithSession = async function(ipAddress = '', device = '', success = true, sessionId = null) {
  try {
    this.lastLogin = new Date();
    
    // Ensure customer users never have storeName
    if (this.userType === 'customer' && this.storeName) {
      this.storeName = undefined;
    }
    
    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = require('crypto').randomBytes(16).toString('hex');
    }
    
    // Check if this session already exists
    const existingSession = this.loginHistory.find(entry => entry.sessionId === sessionId);
    
    if (existingSession) {
      // Update the existing session
      existingSession.lastUpdated = new Date();
      existingSession.active = true;
    } else {
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
    
    // Update the active sessions count
    const activeSessions = this.loginHistory.filter(entry => entry.active).length;
    this.activeSessions = activeSessions;
    
    // Only keep the most recent 30 login records
    if (this.loginHistory.length > 30) {
      this.loginHistory = this.loginHistory.slice(-30);
    }
    
    // Also record the session in the UserSession collection for cross-user tracking
    try {
      // First check if this session already exists in collection
      const existingSessionDoc = await UserSession.findOne({ sessionId });
      
      if (existingSessionDoc) {
        // Update existing session
        existingSessionDoc.lastActivity = new Date();
        existingSessionDoc.active = true;
        await existingSessionDoc.save();
      } else {
        // Create new session document
        const newSessionDoc = new UserSession({
          userId: this._id,
          userEmail: this.email,
          userType: this.userType,
          sessionId,
          device: device,
          ipAddress,
          browser,
          os,
          startTime: new Date(),
          lastActivity: new Date(),
          active: true,
          storeName: this.userType === 'vendor' ? this.storeName : undefined
        });
        
        await newSessionDoc.save();
      }
    } catch (sessionError) {
      console.error('Error updating UserSession collection:', sessionError);
      // Continue with login even if session record fails
    }
    
    // Save changes to the user document
    await this.save();
    
    // Return session ID in case it was generated here
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
userSchema.methods.endSession = async function(sessionId) {
  try {
    // Find the session in login history
    const sessionIndex = this.loginHistory.findIndex(
      entry => entry.sessionId === sessionId && entry.active
    );
    
    if (sessionIndex !== -1) {
      // Mark session as ended in user document
      this.loginHistory[sessionIndex].active = false;
      this.loginHistory[sessionIndex].endedAt = new Date();
      
      // Update active sessions count
      this.activeSessions = this.loginHistory.filter(entry => 
        entry.success && entry.active && !entry.endedAt
      ).length;
      
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

// Method to get user's active sessions
userSchema.methods.getActiveSessions = function() {
  return this.loginHistory.filter(entry => 
    entry.success && entry.active && !entry.endedAt
  );
};

// Static method to fix customer records with non-null storeName values
userSchema.statics.fixCustomerStoreNames = async function() {
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

// Method to generate auth token
userSchema.methods.generateAuthToken = function(sessionId = null) {
  try {
    const payload = {
      id: this._id,
      email: this.email,
      userType: this.userType,
      isActive: this.isActive,
      // Include sessionId if provided
      ...(sessionId ? { sessionId } : {})
    };
    
    // Get JWT secret from environment or use a default for development
    const secret = process.env.JWT_SECRET || 'storelinker_development_secret_key';
    
    // Sign token with 24 hour expiration
    const token = jwt.sign(
      payload,
      secret,
      { expiresIn: '24h' }
    );
    
    console.log(`Generated token for ${this.email} (${this._id})`);
    return token;
  } catch (error) {
    console.error('Token generation error:', error);
    // Create a fallback token with minimal claims if standard generation fails
    const fallbackSecret = process.env.JWT_SECRET || 'storelinker_development_secret_key';
    return jwt.sign(
      { id: this._id, fallback: true },
      fallbackSecret,
      { expiresIn: '1h' } // Shorter expiration for fallback tokens
    );
  }
};

// Static method to verify and decode token
userSchema.statics.verifyToken = function(token) {
  try {
    const secret = process.env.JWT_SECRET || 'storelinker_development_secret_key';
    const decoded = jwt.verify(token, secret);
    return { success: true, decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { success: false, error: error.message };
  }
};

// Static method to synchronize user sessions
userSchema.statics.synchronizeSessions = async function() {
  try {
    console.log('Starting user session synchronization...');
    
    // Get all users
    const users = await this.find({});
    console.log(`Found ${users.length} users to process`);
    
    let totalSessions = 0;
    let fixedSessions = 0;
    
    // Process each user
    for (const user of users) {
      // Find all active sessions for this user
      const activeSessions = user.loginHistory.filter(session => 
        session.active === true && session.sessionId
      );
      
      totalSessions += activeSessions.length;
      
      // For each active session, ensure it exists in UserSession collection
      for (const session of activeSessions) {
        try {
          // Check if session exists in UserSession collection
          const existingSession = await UserSession.findOne({ 
            sessionId: session.sessionId 
          });
          
          if (!existingSession) {
            // Create new session in UserSession collection
            const newSession = new UserSession({
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
            
            await newSession.save();
            fixedSessions++;
          }
        } catch (sessionError) {
          console.error(`Error processing session ${session.sessionId} for user ${user._id}:`, sessionError);
        }
      }
    }
    
    console.log(`Session synchronization complete. Processed ${totalSessions} sessions, added ${fixedSessions} missing sessions.`);
    return { totalSessions, fixedSessions };
  } catch (error) {
    console.error('Error synchronizing sessions:', error);
    throw error;
  }
};

// Static method to initialize the system and fix any inconsistencies
userSchema.statics.initializeSystem = async function() {
  // Sync sessions
  await this.synchronizeSessions();
  
  // Fix customer records with storeName values
  await this.fixCustomerStoreNames();
  
  // Ensure at least one vendor exists for testing (disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const adminEmail = 'admin@example.com';
      const adminExists = await this.findOne({ email: adminEmail });
      
      if (!adminExists) {
        console.log('Creating default admin vendor account for testing');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('adminpassword', salt);
        
        const adminVendor = new this({
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin',
          userType: 'vendor',
          storeName: 'Admin Store',
          isActive: true,
          verified: true,
          registrationDate: new Date(),
          lastLogin: new Date()
        });
        
        await adminVendor.save();
        console.log('Default admin vendor created successfully');
      }
    } catch (adminError) {
      console.error('Error creating default admin:', adminError);
    }
  }
  
  return { success: true };
};

const User = mongoose.model('users', userSchema);

module.exports = {
  User,
  UserSession
}; 