// Simple authentication service to manage user login state and cart

// Check if user is logged in
const isLoggedIn = () => {
  return localStorage.getItem('user') !== null;
};

// Get current user
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Login user
const login = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
  
  // If there was a guest cart, associate it with the user
  const guestCart = localStorage.getItem('guestCart');
  if (guestCart) {
    localStorage.setItem(`userCart_${userData.id}`, guestCart);
    localStorage.removeItem('guestCart');
  }
  
  // Dispatch login event
  window.dispatchEvent(new Event('userLogin'));
  
  return true;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  
  // Dispatch logout event
  window.dispatchEvent(new Event('userLogout'));
  
  return true;
};

// Get user's cart
const getUserCart = () => {
  const user = getCurrentUser();
  
  if (user) {
    // Get logged-in user's cart
    const userCart = localStorage.getItem(`userCart_${user.id}`);
    return userCart ? JSON.parse(userCart) : [];
  } else {
    // Get guest cart
    const guestCart = localStorage.getItem('guestCart');
    return guestCart ? JSON.parse(guestCart) : [];
  }
};

// Save cart
const saveCart = (cartItems) => {
  const user = getCurrentUser();
  
  if (user) {
    // Save to user's cart
    localStorage.setItem(`userCart_${user.id}`, JSON.stringify(cartItems));
  } else {
    // Save to guest cart
    localStorage.setItem('guestCart', JSON.stringify(cartItems));
  }
  
  // Dispatch cart updated event
  window.dispatchEvent(new Event('cartUpdated'));
};

// Add item to cart
const addToCart = (product, quantity) => {
  const cart = getUserCart();
  
  // Check if product is already in cart
  const existingProductIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingProductIndex !== -1) {
    // Update quantity if product already exists
    cart[existingProductIndex].quantity += quantity;
  } else {
    // Add new product to cart
    cart.push({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0],
      quantity: quantity,
      vendor: product.store.name
    });
  }
  
  // Save updated cart
  saveCart(cart);
  
  return true;
};

// Remove item from cart
const removeFromCart = (productId) => {
  const cart = getUserCart();
  const updatedCart = cart.filter(item => item.id !== productId);
  saveCart(updatedCart);
  return true;
};

// Update item quantity in cart
const updateCartItemQuantity = (productId, quantity) => {
  const cart = getUserCart();
  const productIndex = cart.findIndex(item => item.id === productId);
  
  if (productIndex !== -1) {
    cart[productIndex].quantity = quantity;
    saveCart(cart);
    return true;
  }
  
  return false;
};

// Clear cart
const clearCart = () => {
  saveCart([]);
  return true;
};

// Mock user data for testing
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  }
];

// Mock login function
const mockLogin = (email, password) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Don't include password in stored user data
    const { password, ...userData } = user;
    login(userData);
    return { success: true, user: userData };
  }
  
  return { success: false, message: 'Invalid email or password' };
};

module.exports = {
  isLoggedIn,
  getCurrentUser,
  login,
  logout,
  getUserCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  mockLogin
}; 