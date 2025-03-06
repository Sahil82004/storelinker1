const API_URL = '/api/vendor';

// Dummy vendor data
const DUMMY_VENDORS = [
  {
    id: 'v1',
    email: 'techstore@example.com',
    password: 'tech123',
    storeName: 'Tech Store',
    name: 'John Tech',
    phone: '123-456-7890',
    address: '123 Tech Street',
    city: 'Silicon Valley',
    state: 'CA',
    zipCode: '94025',
    products: [
      {
        _id: 'p1',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 149.99,
        stock: 50,
        category: 'electronics',
        image: 'https://img.freepik.com/free-photo/wireless-headphones-levitating-blue-background_23-2150271748.jpg',
        status: 'active'
      },
      {
        _id: 'p2',
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health tracking',
        price: 299.99,
        stock: 30,
        category: 'electronics',
        image: 'https://img.freepik.com/free-photo/smartwatch-screen-digital-device_53876-96809.jpg',
        status: 'active'
      }
    ]
  },
  {
    id: 'v2',
    email: 'fashion@example.com',
    password: 'fashion123',
    storeName: 'Fashion Hub',
    name: 'Sarah Style',
    phone: '234-567-8901',
    address: '456 Fashion Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    products: [
      {
        _id: 'p3',
        name: 'Designer T-Shirt',
        description: 'Premium cotton designer t-shirt',
        price: 49.99,
        stock: 100,
        category: 'fashion',
        image: 'https://img.freepik.com/free-photo/white-t-shirts-with-copy-space_53876-102012.jpg',
        status: 'active'
      },
      {
        _id: 'p4',
        name: 'Leather Bag',
        description: 'Handcrafted genuine leather bag',
        price: 199.99,
        stock: 20,
        category: 'fashion',
        image: 'https://img.freepik.com/free-photo/beautiful-elegance-luxury-fashion-women-bag_74190-4900.jpg',
        status: 'active'
      }
    ]
  },
  {
    id: 'v3',
    email: 'test@test.com',
    password: 'test123',
    storeName: 'Test Store',
    name: 'Test Vendor',
    phone: '345-678-9012',
    address: '789 Test Road',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    products: [
      {
        _id: 'p5',
        name: 'Test Product 1',
        description: 'This is a test product',
        price: 99.99,
        stock: 10,
        category: 'electronics',
        image: 'https://img.freepik.com/free-photo/laptop-white-background-3d-rendering-computer-generated-image_1142-48567.jpg',
        status: 'active'
      }
    ]
  },
  {
    id: 'v4',
    email: 'demo@demo.com',
    password: 'demo123',
    storeName: 'Demo Store',
    name: 'Demo Vendor',
    phone: '456-789-0123',
    address: '101 Demo Street',
    city: 'Demo City',
    state: 'DS',
    zipCode: '67890',
    products: []
  }
];

// Store vendors in localStorage if not already present
if (!localStorage.getItem('vendors')) {
  localStorage.setItem('vendors', JSON.stringify(DUMMY_VENDORS));
}

// Helper function to get vendors from localStorage
const getVendors = () => {
  return JSON.parse(localStorage.getItem('vendors')) || DUMMY_VENDORS;
};

// Helper function to save vendors to localStorage
const saveVendors = (vendors) => {
  localStorage.setItem('vendors', JSON.stringify(vendors));
};

// Check if vendor is logged in
export const isVendorLoggedIn = () => {
  const token = localStorage.getItem('vendorToken');
  return !!token;
};

// Get vendor info
export const getVendorInfo = () => {
  const vendorInfo = localStorage.getItem('vendorInfo');
  return vendorInfo ? JSON.parse(vendorInfo) : null;
};

// Mock login function
export const loginVendor = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const vendors = getVendors();
  const vendor = vendors.find(v => v.email === email && v.password === password);

  if (!vendor) {
    throw new Error('Invalid credentials');
  }

  // Create a copy without the password
  const { password: _, ...vendorData } = vendor;
  const token = btoa(vendor.id); // Simple token generation

  // Store vendor token and info
  localStorage.setItem('vendorToken', token);
  localStorage.setItem('vendorInfo', JSON.stringify(vendorData));

  return { token, vendor: vendorData };
};

// Get vendor's products
export const getVendorProducts = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const vendorInfo = getVendorInfo();
  if (!vendorInfo) {
    throw new Error('Not authenticated');
  }

  const vendors = getVendors();
  const vendor = vendors.find(v => v.id === vendorInfo.id);
  return vendor ? vendor.products : [];
};

// Get product by ID
export const getProductById = async (productId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const vendorInfo = getVendorInfo();
  if (!vendorInfo) {
    throw new Error('Not authenticated');
  }

  const vendors = getVendors();
  const vendor = vendors.find(v => v.id === vendorInfo.id);
  const product = vendor?.products.find(p => p._id === productId);

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

// Update product
export const updateProduct = async (productId, productData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const vendorInfo = getVendorInfo();
  if (!vendorInfo) {
    throw new Error('Not authenticated');
  }

  const vendors = getVendors();
  const vendorIndex = vendors.findIndex(v => v.id === vendorInfo.id);
  const productIndex = vendors[vendorIndex].products.findIndex(p => p._id === productId);

  if (productIndex === -1) {
    throw new Error('Product not found');
  }

  // Update product
  vendors[vendorIndex].products[productIndex] = {
    ...vendors[vendorIndex].products[productIndex],
    ...productData,
    _id: productId // Ensure ID doesn't change
  };

  // Save updated vendors
  saveVendors(vendors);

  return vendors[vendorIndex].products[productIndex];
};

// Delete product
export const deleteProduct = async (productId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const vendorInfo = getVendorInfo();
  if (!vendorInfo) {
    throw new Error('Not authenticated');
  }

  const vendors = getVendors();
  const vendorIndex = vendors.findIndex(v => v.id === vendorInfo.id);
  const productIndex = vendors[vendorIndex].products.findIndex(p => p._id === productId);

  if (productIndex === -1) {
    throw new Error('Product not found');
  }

  // Remove product
  vendors[vendorIndex].products.splice(productIndex, 1);
  
  // Save updated vendors
  saveVendors(vendors);

  return { success: true };
};

// Add new product
export const addProduct = async (productData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const vendorInfo = getVendorInfo();
  if (!vendorInfo) {
    throw new Error('Not authenticated');
  }

  const vendors = getVendors();
  const vendorIndex = vendors.findIndex(v => v.id === vendorInfo.id);
  const newProduct = {
    _id: 'p' + Date.now(), // Generate simple unique ID
    ...productData,
    status: 'active'
  };

  // Add product
  vendors[vendorIndex].products.push(newProduct);
  
  // Save updated vendors
  saveVendors(vendors);

  return newProduct;
};

// Vendor logout
export const logoutVendor = () => {
  localStorage.removeItem('vendorToken');
  localStorage.removeItem('vendorInfo');
};

// Register new vendor
export const registerVendor = async (vendorData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get existing vendors
  const vendors = getVendors();

  // Check if email already exists
  if (vendors.find(v => v.email === vendorData.email)) {
    throw new Error('Email already registered');
  }

  // Create new vendor object
  const newVendor = {
    id: 'v' + Date.now(),
    email: vendorData.email,
    password: vendorData.password, // In a real app, this should be hashed
    storeName: vendorData.storeName,
    name: vendorData.name,
    phone: vendorData.phone,
    address: vendorData.address,
    city: vendorData.city,
    state: vendorData.state,
    zipCode: vendorData.zipCode,
    products: [] // Start with empty products array
  };

  // Add new vendor to the list
  vendors.push(newVendor);
  
  // Save updated vendors list
  saveVendors(vendors);

  // Return success without sensitive data
  const { password, ...vendorWithoutPassword } = newVendor;
  return vendorWithoutPassword;
}; 