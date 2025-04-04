const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Register a new vendor
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, storeName, phone, address, city, state, zipCode } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new vendor
    user = new User({
      email,
      password,
      name,
      userType: 'vendor',
      storeName,
      phone,
      address,
      city,
      state,
      zipCode
    });

    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        storeName: user.storeName,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vendor's store details
router.get('/store/:storeId', auth, async (req, res) => {
  try {
    const store = await User.findOne({ 
      _id: req.params.storeId,
      userType: 'vendor',
      isActive: true
    }).select('-password');

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const products = await Product.find({
      vendorId: store._id,
      isActive: true
    });

    res.json({
      store,
      products
    });
  } catch (error) {
    console.error('Error fetching store details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all active stores
router.get('/stores', async (req, res) => {
  try {
    const stores = await User.find({
      userType: 'vendor',
      isActive: true
    }).select('-password');

    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 