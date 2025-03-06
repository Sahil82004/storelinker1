const { MongoClient } = require('mongodb');
const { sampleOffers } = require('../src/data/sampleOffers');

const uri = "mongodb+srv://sahil:sahil@storelinker.btnxy.mongodb.net/?retryWrites=true&w=majority&appName=STORELINKER";

async function populateOffers() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('storelinker');
    const offers = database.collection('offers');

    // Clear existing offers
    await offers.deleteMany({});

    // Insert sample offers
    const result = await offers.insertMany(sampleOffers);
    console.log(`${result.insertedCount} offers inserted successfully`);

  } catch (error) {
    console.error('Error populating offers:', error);
  } finally {
    await client.close();
  }
}

populateOffers(); 