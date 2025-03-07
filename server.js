const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = "mongodb+srv://sahil:sahil123@storelinker.btnxy.mongodb.net/?retryWrites=true&w=majority&appName=STORELINKER";
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectDB();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;
    const database = client.db('storelinker');
    const users = database.collection('users');

    // Check if user exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      name,
      userType, // 'vendor' or 'customer'
      createdAt: new Date(),
    };

    const result = await users.insertOne(user);
    const userId = result.insertedId;

    // Create token
    const token = jwt.sign(
      { id: userId.toString(), email: user.email, userType: user.userType },
      JWT_SECRET
    );

    res.json({ token, user: { email, name, userType } });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const database = client.db('storelinker');
    const users = database.collection('users');

    // Check if user exists
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Create token with string ID
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, userType: user.userType },
      JWT_SECRET
    );

    res.json({
      token,
      user: {
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const database = client.db('storelinker');
    const products = database.collection('products');
    const result = await products.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Vendor Product Routes (Protected)
app.get('/api/vendor/products', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const database = client.db('storelinker');
    const products = database.collection('products');
    
    console.log('Fetching products for vendor ID:', req.user.id);
    
    const result = await products.find({ 
      vendorId: req.user.id 
    }).toArray();
    
    console.log('Found products:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ error: 'Failed to fetch vendor products' });
  }
});

app.post('/api/vendor/products', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const database = client.db('storelinker');
    const products = database.collection('products');
    
    // Add additional fields to the product data
    const productData = {
      ...req.body,
      vendorId: req.user.id,
      createdAt: new Date(),
      reviewCount: 0,
      rating: 0,
      discount: Math.round(((req.body.originalPrice - req.body.price) / req.body.originalPrice) * 100),
      store: {
        name: req.user.name || 'Store',
        rating: 0,
        reviewCount: 0
      }
    };

    console.log('Creating product with data:', productData);
    const result = await products.insertOne(productData);
    const insertedProduct = { ...productData, _id: result.insertedId };
    res.json(insertedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/vendor/products/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const database = client.db('storelinker');
    const products = database.collection('products');
    
    const result = await products.updateOne(
      { _id: new ObjectId(req.params.id), vendorId: req.user.id },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/vendor/products/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const database = client.db('storelinker');
    const products = database.collection('products');
    
    const result = await products.deleteOne({
      _id: new ObjectId(req.params.id),
      vendorId: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    const database = client.db('storelinker');
    const products = database.collection('products');
    const categories = await products.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    const database = client.db('storelinker');
    const products = database.collection('products');
    const result = await products.find({ category: req.params.category }).toArray();
    res.json(result);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// Offers Routes
app.get('/api/offers', async (req, res) => {
  try {
    const database = client.db('storelinker');
    const offers = database.collection('offers');
    const result = await offers.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.post('/api/offers', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const database = client.db('storelinker');
    const offers = database.collection('offers');
    
    const offerData = {
      ...req.body,
      vendorId: req.user.id,
      createdAt: new Date(),
    };

    const result = await offers.insertOne(offerData);
    res.json({ ...offerData, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

app.put('/api/offers/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const database = client.db('storelinker');
    const offers = database.collection('offers');
    
    const result = await offers.updateOne(
      { _id: new ObjectId(req.params.id), vendorId: req.user.id },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Offer not found or unauthorized' });
    }

    res.json({ message: 'Offer updated successfully' });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

app.delete('/api/offers/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'vendor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const database = client.db('storelinker');
    const offers = database.collection('offers');
    
    const result = await offers.deleteOne({
      _id: new ObjectId(req.params.id),
      vendorId: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Offer not found or unauthorized' });
    }

    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 