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
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
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
    
    // Parse user agent to get browser and OS info
    let browser = 'Unknown';
    let os = 'Unknown';
    if (device) {
      // Simple parsing - in production, use a proper user-agent parser library
      if (device.includes('Chrome')) browser = 'Chrome';
      else if (device.includes('Firefox')) browser = 'Firefox';
      else if (device.includes('Safari')) browser = 'Safari';
      else if (device.includes('Edge')) browser = 'Edge';
      
      if (device.includes('Windows')) os = 'Windows';
      else if (device.includes('Mac')) os = 'MacOS';
      else if (device.includes('Linux')) os = 'Linux';
      else if (device.includes('Android')) os = 'Android';
      else if (device.includes('iOS')) os = 'iOS';
    }
    
    // Create new login history entry with session ID
    const loginEntry = {
      timestamp: new Date(),
      ipAddress,
      device,
      browser,
      os,
      success,
      sessionId,
      active: true,
      data: {}
    };
    
    // Add to login history in user document
    this.loginHistory.push(loginEntry);
    
    // Update active sessions count
    if (success) {
      this.activeSessions = this.loginHistory.filter(entry => 
        entry.success && entry.active && !entry.endedAt
      ).length;
    }
    
    // No longer limit to 30 entries - keep full history
    
    // Save the changes to the user document
    await this.save();
    
    // Also create a separate session record in the UserSession collection
    if (success) {
      try {
        const sessionData = {
          userId: this._id,
          userEmail: this.email,
          userType: this.userType,
          sessionId,
          device,
          ipAddress,
          browser,
          os,
          startTime: new Date(),
          lastActivity: new Date(),
          active: true,
          data: {}
        };
        
        // If this is a customer, ensure no storeName is saved
        if (this.userType === 'customer') {
          sessionData.storeName = undefined;
        } else if (this.userType === 'vendor') {
          sessionData.storeName = this.storeName;
        }
        
        const sessionRecord = new UserSession(sessionData);
        await sessionRecord.save();
        console.log(`Session record created for user ${this.email} with session ID ${sessionId}`);
      } catch (sessionError) {
        console.error('Error creating session record:', sessionError);
        // Continue with user login even if session record creation fails
      }
    }
    
    // Return the new login entry
    return loginEntry;
  } catch (error) {
    console.error('Error recording login with session:', error);
    throw error;
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

// Generate JWT token
userSchema.methods.generateAuthToken = function(sessionId = null) {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      userType: this.userType,
      sessionId: sessionId || (this.loginHistory.length > 0 ? this.loginHistory[this.loginHistory.length - 1].sessionId : null)
    },
    process.env.JWT_SECRET || 'd238d1ca75ce5287a55831d555d73ab170c193c3a6c21da43539c2732445131e3f3a2a8eadb41b3b71186fe308a0fa293b490e81bdd17b66a3b638fdd20e27eb',
    { expiresIn: '7d' }
  );
};

const User = mongoose.model('users', userSchema);

module.exports = {
  User,
  UserSession
}; 