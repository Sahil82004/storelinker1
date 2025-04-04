const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'd238d1ca75ce5287a55831d555d73ab170c193c3a6c21da43539c2732445131e3f3a2a8eadb41b3b71186fe308a0fa293b490e81bdd17b66a3b638fdd20e27eb';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://admin:admin123@storelinker.eqk7l.mongodb.net/?retryWrites=true&w=majority&appName=Storelinker';

// MongoDB Connection Options
const mongooseOptions = {
  dbName: 'Storelinker',
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongooseOptions)
.then(async () => {
  console.log('Connected to MongoDB Atlas - Storelinker Database');
  
  try {
    // Create indexes for all collections
    await Promise.all([
      mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true }),
      mongoose.connection.db.collection('products').createIndex({ vendorId: 1 }),
      mongoose.connection.db.collection('stores').createIndex({ vendorId: 1 })
    ]);
    console.log('Database indexes created successfully for users, products, and stores collections');
    
    // Fix any customer records with storeName values
    const { User } = require('./models/User');
    const fixedCount = await User.fixCustomerStoreNames();
    if (fixedCount > 0) {
      console.log(`Fixed ${fixedCount} customer accounts with incorrect storeName values`);
    }
  } catch (indexError) {
    console.error('Error creating indexes or fixing customer records:', indexError);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  mongoose.connect(MONGODB_URI, mongooseOptions);
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/products', require('./routes/products'));
app.use('/api/stores', require('./routes/stores'));

// Add route for user sessions - can access session data without affecting auth routes
const { UserSession } = require('./models/User');
app.get('/api/sessions/stats', async (req, res) => {
  try {
    const totalSessions = await UserSession.countDocuments();
    const activeSessions = await UserSession.countDocuments({ active: true });
    const userCounts = await UserSession.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $count: "uniqueUsers" }
    ]);
    
    res.json({
      totalSessions,
      activeSessions,
      uniqueUsers: userCounts.length > 0 ? userCounts[0].uniqueUsers : 0
    });
  } catch (error) {
    console.error('Error getting session stats:', error);
    res.status(500).json({ error: 'Error fetching session statistics' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please use a different port or close the application using this port.`);
    console.log(`Try running with a different port: $env:PORT=5002; node server.js`);
  } else {
    console.error('Error starting server:', err);
  }
  process.exit(1);
}); 