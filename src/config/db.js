const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://sahil:sahil123@storelinker.btnxy.mongodb.net/?retryWrites=true&w=majority&appName=STORELINKER";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collection names
const dbName = 'storelinker';
const collections = {
  products: 'products',
  categories: 'categories',
  users: 'users',
  orders: 'orders'
};

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    return {
      db: client.db(dbName),
      collections
    };
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Disconnect from MongoDB
async function disconnectFromDatabase() {
  try {
    await client.close();
    console.log("Disconnected from MongoDB Atlas");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  client,
  collections
}; 