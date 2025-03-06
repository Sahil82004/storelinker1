// Dummy customer data
const DUMMY_CUSTOMERS = [
  {
    id: 'c1',
    email: 'john@example.com',
    password: 'john123',
    name: 'John Doe',
    phone: '123-456-7890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    orders: []
  },
  {
    id: 'c2',
    email: 'jane@example.com',
    password: 'jane123',
    name: 'Jane Smith',
    phone: '234-567-8901',
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    orders: []
  },
  {
    id: 'c3',
    email: 'test@test.com',
    password: 'test123',
    name: 'Test User',
    phone: '345-678-9012',
    address: '789 Test Rd',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    orders: []
  }
];

// Store customers in localStorage if not already present
if (!localStorage.getItem('customers')) {
  localStorage.setItem('customers', JSON.stringify(DUMMY_CUSTOMERS));
}

// Helper function to get customers from localStorage
const getCustomers = () => {
  return JSON.parse(localStorage.getItem('customers')) || DUMMY_CUSTOMERS;
};

// Helper function to save customers to localStorage
const saveCustomers = (customers) => {
  localStorage.setItem('customers', JSON.stringify(customers));
};

// Check if customer is logged in
export const isCustomerLoggedIn = () => {
  const token = localStorage.getItem('customerToken');
  return !!token;
};

// Get customer info
export const getCustomerInfo = () => {
  const customerInfo = localStorage.getItem('customerInfo');
  return customerInfo ? JSON.parse(customerInfo) : null;
};

// Customer login
export const loginCustomer = async (email, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const customers = getCustomers();
  const customer = customers.find(c => c.email === email && c.password === password);

  if (!customer) {
    throw new Error('Invalid credentials');
  }

  // Create a copy without the password
  const { password: _, ...customerData } = customer;
  const token = btoa(customer.id); // Simple token generation

  // Store customer token and info
  localStorage.setItem('customerToken', token);
  localStorage.setItem('customerInfo', JSON.stringify(customerData));

  return { token, customer: customerData };
};

// Register new customer
export const registerCustomer = async (customerData) => {
  // Input validation
  if (!customerData.email || !customerData.password || !customerData.name) {
    throw new Error('Please fill in all required fields');
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get existing customers
  const customers = getCustomers();

  // Check if email already exists
  if (customers.find(c => c.email === customerData.email)) {
    throw new Error('Email already registered');
  }

  // Create new customer object
  const newCustomer = {
    id: 'c' + Date.now(),
    email: customerData.email,
    password: customerData.password,
    name: customerData.name,
    phone: customerData.phone || '',
    address: customerData.address || '',
    city: customerData.city || '',
    state: customerData.state || '',
    zipCode: customerData.zipCode || '',
    orders: []
  };

  try {
    // Add new customer to the list
    customers.push(newCustomer);
    
    // Save updated customers list
    saveCustomers(customers);

    // Return success without sensitive data
    const { password, ...customerWithoutPassword } = newCustomer;
    return customerWithoutPassword;
  } catch (error) {
    throw new Error('Failed to register customer. Please try again.');
  }
};

// Customer logout
export const logoutCustomer = () => {
  localStorage.removeItem('customerToken');
  localStorage.removeItem('customerInfo');
}; 