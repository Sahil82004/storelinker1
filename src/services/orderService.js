// Order service to handle order creation and retrieval
import { getUserCart, clearCart, getCurrentUser } from './authService';

// Generate a unique order ID
const generateOrderId = () => {
  return 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

// Get order status based on days passed
const getOrderStatus = (daysPassed) => {
  if (daysPassed === 0) return 'Processing';
  if (daysPassed === 1) return 'Confirmed';
  if (daysPassed <= 3) return 'Shipped';
  if (daysPassed <= 5) return 'Out for Delivery';
  return 'Delivered';
};

// Create a new order
const createOrder = (shippingDetails, paymentDetails) => {
  const user = getCurrentUser();
  
  if (!user) {
    return { success: false, message: 'User not logged in' };
  }
  
  const cart = getUserCart();
  
  if (cart.length === 0) {
    return { success: false, message: 'Cart is empty' };
  }
  
  // Calculate order totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  // Create order object
  const order = {
    id: generateOrderId(),
    userId: user.id,
    items: [...cart],
    subtotal,
    shipping,
    tax,
    total,
    shippingDetails,
    paymentDetails: {
      method: paymentDetails.method,
      // Don't store sensitive payment details
      lastFour: paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : null
    },
    status: 'Processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Get existing orders
  const existingOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
  
  // Add new order
  existingOrders.push(order);
  
  // Save to localStorage
  localStorage.setItem(`orders_${user.id}`, JSON.stringify(existingOrders));
  
  // Clear the cart
  clearCart();
  
  return { success: true, order };
};

// Get user orders
const getUserOrders = () => {
  const user = getCurrentUser();
  
  if (!user) {
    return [];
  }
  
  const orders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
  
  // Sort by date (newest first)
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get order by ID
const getOrderById = (orderId) => {
  const user = getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const orders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
  return orders.find(order => order.id === orderId) || null;
};

// Mock orders for testing
const createMockOrders = () => {
  const user = getCurrentUser();
  
  if (!user) {
    return;
  }
  
  // Check if user already has orders
  const existingOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
  
  if (existingOrders.length > 0) {
    return;
  }
  
  // Create mock orders
  const mockOrders = [
    {
      id: 'ORD-1623456789-123',
      userId: user.id,
      items: [
        {
          id: 1,
          name: 'Wireless Bluetooth Headphones',
          price: 149.99,
          image: 'https://img.freepik.com/free-photo/wireless-headphones-levitating-white-background-wireless-earbuds-floating-with-reflection-generative-ai_157027-1448.jpg',
          quantity: 1,
          vendor: 'AudioTech'
        }
      ],
      subtotal: 149.99,
      shipping: 0,
      tax: 12.00,
      total: 161.99,
      shippingDetails: {
        name: user.name,
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentDetails: {
        method: 'Credit Card',
        lastFour: '4242'
      },
      status: 'Delivered',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ORD-1623456999-456',
      userId: user.id,
      items: [
        {
          id: 3,
          name: 'Organic Cotton T-Shirt',
          price: 24.99,
          image: 'https://img.freepik.com/free-photo/white-t-shirts-with-copy-space_53876-102012.jpg',
          quantity: 2,
          vendor: 'EcoClothing'
        },
        {
          id: 5,
          name: 'Leather Crossbody Bag',
          price: 129.99,
          image: 'https://img.freepik.com/free-photo/beautiful-elegance-luxury-fashion-women-bag_74190-4900.jpg',
          quantity: 1,
          vendor: 'FashionStyle'
        }
      ],
      subtotal: 179.97,
      shipping: 0,
      tax: 14.40,
      total: 194.37,
      shippingDetails: {
        name: user.name,
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentDetails: {
        method: 'PayPal'
      },
      status: 'Shipped',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  // Save mock orders
  localStorage.setItem(`orders_${user.id}`, JSON.stringify(mockOrders));
};

export {
  createOrder,
  getUserOrders,
  getOrderById,
  createMockOrders
}; 