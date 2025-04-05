const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Add a new product
router.post('/', auth, async (req, res) => {
  try {
    // Log the full request information for debugging
    console.log('Product creation request received:');
    console.log('- Headers:', req.headers);
    console.log('- User ID:', req.user?.id);
    console.log('- Body:', req.body);
    
    const { 
      name, 
      description, 
      price, 
      originalPrice, 
      imageUrl, 
      category, 
      stock,
      vendorId 
    } = req.body;
    
    // Use authenticated user ID if vendorId not provided or not matching
    let actualVendorId;
    
    // If both IDs exist and don't match, this could be problematic
    if (vendorId && req.user.id && vendorId !== req.user.id) {
      console.log(`Warning: Request vendorId (${vendorId}) doesn't match authenticated user (${req.user.id})`);
      // Use the authenticated user ID to prevent security issues
      actualVendorId = req.user.id;
    } else {
      // Otherwise use the provided vendorId or fall back to the authenticated user
      actualVendorId = vendorId || req.user.id;
    }
    
    console.log(`Using vendorId: ${actualVendorId} for product creation`);
    
    // Basic validation - only require name, price, and category
    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    if (!price) {
      return res.status(400).json({ error: 'Product price is required' });
    }
    
    if (!category) {
      return res.status(400).json({ error: 'Product category is required' });
    }
    
    // Create the product with sensible defaults for missing fields
    const product = new Product({
      name,
      description: description || `${name} - Quality product`,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      imageUrl: imageUrl || 'https://via.placeholder.com/500x500?text=Product+Image',
      category,
      stock: stock ? parseInt(stock) : 10,
      vendorId: actualVendorId,
      isActive: true,
      rating: 0,
      reviewCount: 0
    });

    console.log('Saving product to database:', product);
    const savedProduct = await product.save();
    console.log('Product saved successfully with ID:', savedProduct._id);
    
    // Transform the saved product to match frontend expectations
    const savedProductObj = savedProduct.toObject();
    const transformedProduct = {
      ...savedProductObj,
      id: savedProductObj._id,
      image: savedProductObj.imageUrl || 'https://via.placeholder.com/500x500?text=Product+Image',
      vendorId: actualVendorId
    };
    
    console.log('Sending product response:', transformedProduct);
    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Send back a more detailed error message
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationErrors.join(', ')
      });
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        error: 'Duplicate product',
        message: 'A product with that name already exists'
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to save product'
    });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('vendorId', 'name storeName');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vendor's products
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const products = await Product.find({
      vendorId: req.params.vendorId,
      isActive: true
    }).populate('vendorId', 'name storeName');
    
    // Transform products to include consistent fields for frontend
    const transformedProducts = products.map(product => {
      const productObj = product.toObject();
      return {
        ...productObj,
        id: productObj._id,
        image: productObj.imageUrl,
        originalPrice: productObj.originalPrice || productObj.price,
        discountPrice: productObj.discountPrice || null,
        rating: productObj.rating || 4.5,
        reviewCount: productObj.reviewCount || 0,
        stock: productObj.stock || 10,
        vendorName: productObj.vendorId?.storeName || 'Unknown Vendor',
        // Add any other transformations needed for frontend consistency
      };
    });
    
    console.log(`Found ${transformedProducts.length} products for vendor ${req.params.vendorId}`);
    res.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a product
router.put('/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      vendorId: req.user.id
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, description, price, imageUrl, category, stock } = req.body;
    
    product.name = name;
    product.description = description;
    product.price = price;
    product.imageUrl = imageUrl;
    product.category = category;
    product.stock = stock;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a product
router.delete('/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      vendorId: req.user.id
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.isActive = false;
    await product.save();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get products by store ID for public viewing
router.get('/store/:storeId', async (req, res) => {
  try {
    // Get the store ID from the request parameters
    const { storeId } = req.params;
    
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }
    
    console.log(`Fetching products for store: ${storeId}`);
    
    let products = [];
    
    try {
      // Try to fetch products from the database with enhanced query
      // We look for products where either vendorId or storeId matches
      products = await Product.find({
        $or: [
          { vendorId: storeId },
          { storeId: storeId },
          { 'vendor._id': storeId },
          { 'store.id': storeId }
        ],
        isActive: { $ne: false } // Include products where isActive is true or not set
      }).populate('vendorId', 'name storeName');
      
      console.log(`Found ${products.length} products for store ${storeId}`);
      
      // If no products found, try to use a more lenient query
      if (products.length === 0) {
        console.log('No products found, trying backup query...');
        
        // Get all products and manually filter
        const allProducts = await Product.find({}).populate('vendorId', 'name storeName');
        
        // Filter products that might have the storeId in different fields
        products = allProducts.filter(product => {
          const vendorIdString = String(product.vendorId?._id || product.vendorId || '');
          const storeIdString = String(product.storeId || product.store?.id || '');
          const matchesVendor = vendorIdString === storeId;
          const matchesStore = storeIdString === storeId;
          
          console.log(`Product ${product._id}: vendorId=${vendorIdString}, storeId=${storeIdString}, matches=${matchesVendor || matchesStore}`);
          
          return matchesVendor || matchesStore;
        });
        
        console.log(`Backup query found ${products.length} products`);
      }
    } catch (dbError) {
      console.error('Database error fetching products:', dbError);
      // Continue execution even if database query fails
      // We'll return empty products array
    }
    
    // Transform products to include consistent fields for frontend
    const transformedProducts = products.map(product => {
      const productObj = typeof product.toObject === 'function' ? product.toObject() : product;
      return {
        ...productObj,
        id: productObj._id,
        image: productObj.imageUrl || productObj.image,
        imageUrl: productObj.imageUrl || productObj.image,
        originalPrice: productObj.originalPrice || productObj.price,
        discountPrice: productObj.discountPrice || null,
        rating: productObj.rating || 4.5,
        reviewCount: productObj.reviewCount || 0,
        stock: productObj.stock || 10,
        vendorName: productObj.vendorId?.storeName || productObj.vendorName || 'Unknown Vendor',
      };
    });
    
    res.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching store products:', error);
    // Return empty array instead of error - the frontend will handle display
    res.json([]);
  }
});

module.exports = router; 