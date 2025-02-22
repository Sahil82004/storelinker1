import { products, offers } from './mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProducts() {
  await delay(500); // Simulate network delay
  return products;
}

export async function getProductsByCategory(category) {
  await delay(500);
  return products.filter(product => product.category === category);
}

export async function getOffers() {
  await delay(500);
  return offers;
}

export async function searchProducts(query) {
  await delay(500);
  return products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  );
} 