module.exports = {
  // Server configuration
  port: process.env.PORT || 5001,
  
  // Authentication settings
  jwtSecret: process.env.JWT_SECRET || 'storelinker_development_secret_key',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  
  // Database configuration
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/storelinker',
  
  // Client/API URLs for different environments
  environments: {
    development: {
      apiUrl: 'http://localhost:5001/api',
      clientUrl: 'http://localhost:5002',
      ports: [5000, 5001, 5002, 3000, 8000]
    },
    production: {
      apiUrl: '/api',
      clientUrl: '/'
    }
  },
  
  // Fallback settings for emergency situations
  emergency: {
    enabled: process.env.ALLOW_EMERGENCY_LOGIN === 'true' || process.env.NODE_ENV !== 'production',
    bypassAuth: process.env.EMERGENCY_BYPASS_AUTH === 'true' || process.env.NODE_ENV !== 'production'
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'server.log'
  }
}; 