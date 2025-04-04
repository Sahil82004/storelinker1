const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await User.find(
      { userType: 'vendor', status: 'active' },
      { password: 0 } // Exclude password field
    );
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get store details and products by storeId
router.get('/:storeId', async (req, res) => {
  try {
    // Find store (vendor) details
    const store = await User.findOne(
      { 
        _id: req.params.storeId,
        userType: 'vendor',
        status: 'active'
      },
      { password: 0 } // Exclude password field
    );

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Find store's products
    const products = await Product.find({
      vendorId: store._id,
      status: 'active'
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      store: {
        id: store._id,
        name: store.storeName,
        address: store.address,
        city: store.city,
        state: store.state,
        phone: store.phone
      },
      products
    });
  } catch (error) {
    console.error('Error fetching store details:', error);
    res.status(500).json({ error: 'Failed to fetch store details' });
  }
});

// Create new store
router.post('/', auth, async (req, res) => {
  try {
    const { storeName, address, city, state, phone } = req.body;
    
    const store = new Store({
      storeName,
      address,
      city,
      state,
      phone,
      vendorId: req.user.id
    });

    await store.save();
    res.status(201).json(store);
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update store
router.put('/:storeId', auth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Verify store belongs to vendor
    if (store.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { storeName, address, city, state, phone } = req.body;
    
    store.storeName = storeName || store.storeName;
    store.address = address || store.address;
    store.city = city || store.city;
    store.state = state || store.state;
    store.phone = phone || store.phone;

    await store.save();
    res.json(store);
  } catch (err) {
    console.error('Error updating store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 