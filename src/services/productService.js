const { connectToDatabase, collections } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all products
async function getAllProducts() {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection(collections.products).find({}).toArray();
    return products;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
}

// Get products by category
async function getProductsByCategory(category) {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection(collections.products)
      .find({ category: category.toLowerCase() })
      .toArray();
    return products;
  } catch (error) {
    console.error(`Error fetching products by category ${category}:`, error);
    throw error;
  }
}

// Get product by ID
async function getProductById(id) {
  try {
    const { db } = await connectToDatabase();
    const product = await db.collection(collections.products).findOne({ 
      $or: [
        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
        { id: parseInt(id) }
      ]
    });
    return product;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
}

// Add a new product
async function addProduct(product) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection(collections.products).insertOne(product);
    return result;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

// Update a product
async function updateProduct(id, product) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection(collections.products).updateOne(
      { $or: [
        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
        { id: parseInt(id) }
      ]},
      { $set: product }
    );
    return result;
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
}

// Delete a product
async function deleteProduct(id) {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection(collections.products).deleteOne({
      $or: [
        { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
        { id: parseInt(id) }
      ]
    });
    return result;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
}

// Seed initial product data
async function seedProducts(products) {
  try {
    const { db } = await connectToDatabase();
    
    // Check if products collection is empty
    const count = await db.collection(collections.products).countDocuments();
    
    if (count === 0) {
      // Insert products if collection is empty
      const result = await db.collection(collections.products).insertMany(products);
      console.log(`${result.insertedCount} products seeded successfully`);
      return result;
    } else {
      console.log('Products collection already has data, skipping seed');
      return { acknowledged: true, skipped: true };
    }
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
}

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  seedProducts
}; 