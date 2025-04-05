import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Alert,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Edit as EditIcon, Delete as DeleteIcon, Store as StoreIcon, ErrorOutline as ErrorIcon, ExclamationCircle as ExclamationIcon } from '@mui/icons-material';
import { 
  getVendorProducts, 
  getVendorInfo, 
  isVendorLoggedIn, 
  addProduct,
  updateProduct,
  deleteProduct, 
  logoutVendor 
} from '../../services/vendorService';
import '../../assets/css/VendorDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faFilter, faSpinner, faSignOutAlt, faExclamationCircle, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home',
  'Books',
  'Sports',
  'Other',
];

// Configure the API base URL - update this to match your actual API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// Default placeholder image in case the product image fails to load
const DEFAULT_IMAGE = 'https://via.placeholder.com/300';

// Process image URL to make sure it's valid
const getValidImageUrl = (product) => {
  if (!product) return DEFAULT_IMAGE;
  
  // Check all possible image properties
  let url = product.image || product.imageUrl || '';
  
  // If the URL is empty, return the default image
  if (!url || url.trim() === '') {
    return DEFAULT_IMAGE;
  }

  // Return URLs directly - avoid manipulation that could break them
  return url;
};

// Check for newly added products stored in sessionStorage
const checkForNewProducts = () => {
  try {
    const newProductJson = sessionStorage.getItem('recentlyAddedProduct');
    if (newProductJson) {
      console.log('Found recently added product in sessionStorage:', newProductJson);
      const parsedData = JSON.parse(newProductJson);
      
      // Don't remove it to preserve for future page loads
      // sessionStorage.removeItem('recentlyAddedProduct');
      
      // Handle both array and single product formats
      if (Array.isArray(parsedData)) {
        // If it's an array, return the most recent product (first item)
        return parsedData.length > 0 ? parsedData[0] : null;
      } else {
        // If it's a single product object, return as is
        return parsedData;
      }
    }
  } catch (err) {
    console.error('Error checking for new products:', err);
  }
  return null;
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    description: '',
    image: '',
    stock: 10,
  });
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Add the showNotification function
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    // Check if vendor is logged in
    if (!isVendorLoggedIn()) {
      navigate('/vendor-login');
      return;
    }

    // Load vendor info
    const storedVendorInfo = getVendorInfo();
    if (!storedVendorInfo) {
      console.error('Failed to load vendor info');
      setError('Authentication error: Missing vendor information. Please log in again.');
      setTimeout(() => {
        navigate('/vendor-login');
      }, 3000);
      return;
    }
    
    setVendorInfo(storedVendorInfo);

    // Load products
    fetchProducts();

    // Define event handler function for product updates
    const handleProductUpdated = (event) => {
      console.log('Product update event received:', event.detail);
      if (event.detail) {
        // Simply use the original image URL
        const imageUrl = event.detail.image || event.detail.imageUrl || DEFAULT_IMAGE;
        
        // Add the new product to the state without refetching everything
        const newProduct = {
          ...event.detail,
          _id: event.detail._id || event.detail.id || `temp_${Date.now()}`,
          id: event.detail.id || event.detail._id || `temp_${Date.now()}`,
          image: imageUrl,
          imageUrl: imageUrl,
          price: parseFloat(event.detail.price || 0),
          originalPrice: parseFloat(event.detail.originalPrice || event.detail.price || 0),
          stock: parseInt(event.detail.stock || 0),
          category: event.detail.category || 'Other',
          vendorName: storedVendorInfo.storeName || storedVendorInfo.name || 'Unknown Vendor'
        };
        
        // Update products state - add at the beginning
        setProducts(prevProducts => {
          // Check if it already exists (avoid duplicates)
          const exists = prevProducts.some(p => 
            (p._id === newProduct._id) || (p.id === newProduct.id)
          );
          
          if (exists) {
            return prevProducts.map(p => 
              (p._id === newProduct._id || p.id === newProduct.id) ? newProduct : p
            );
          } else {
            // Save the updated products list to localStorage for backup
            const updatedProducts = [newProduct, ...prevProducts];
            saveProductsToLocalStorage(updatedProducts);
            return updatedProducts;
          }
        });
        
        // Remove any error message
        setError('');
        showNotification('Product added successfully', 'success');
      }
    };

    // Listen for product updates
    window.addEventListener('productUpdated', handleProductUpdated);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdated);
    };
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching vendor products...');
      
      // First check for any newly added products in session storage
      const newProduct = checkForNewProducts();
      if (newProduct) {
        console.log('Found new product in sessionStorage:', newProduct);
        
        // Simply use the original image URL
        const imageUrl = newProduct.image || newProduct.imageUrl || DEFAULT_IMAGE;
        
        // Process the product to ensure it has all required fields
        const processedProduct = {
          ...newProduct,
          _id: newProduct._id || newProduct.id || `temp_${Date.now()}`,
          id: newProduct.id || newProduct._id || `temp_${Date.now()}`,
          image: imageUrl,
          imageUrl: imageUrl,
          price: parseFloat(newProduct.price || 0),
          originalPrice: parseFloat(newProduct.originalPrice || newProduct.price || 0),
          stock: parseInt(newProduct.stock || 0),
          category: newProduct.category || 'Other'
        };
        
        // Add the new product to the state
        setProducts(prevProducts => {
          // Check if it already exists (avoid duplicates)
          const exists = prevProducts.some(p => 
            (p._id === processedProduct._id) || (p.id === processedProduct.id)
          );
          
          if (exists) {
            return prevProducts.map(p => 
              (p._id === processedProduct._id || p.id === processedProduct.id) ? processedProduct : p
            );
          } else {
            // Add to beginning of array and save to localStorage as backup
            const updatedProducts = [processedProduct, ...prevProducts];
            saveProductsToLocalStorage(updatedProducts);
            return updatedProducts;
          }
        });
      }
      
      // Try to get products from API
      let productsData = [];
      try {
        productsData = await getVendorProducts();
        console.log('API returned products:', productsData.length);
      } catch (apiError) {
        console.error('API failed, using cached products:', apiError);
        // Try to get products from localStorage
        try {
          const cachedProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
          if (cachedProducts.length > 0) {
            productsData = cachedProducts;
            console.log('Using cached products:', productsData.length);
          }
        } catch (storageError) {
          console.error('Error reading from localStorage:', storageError);
        }
      }
      
      if (productsData && Array.isArray(productsData) && productsData.length > 0) {
        console.log('Processing products data:', productsData.length);
        
        // Process products with simplified image handling
        const processedProducts = productsData.map(product => {
          // Keep the original image URLs
          const imageUrl = product.image || product.imageUrl || DEFAULT_IMAGE;
          
          return {
            ...product,
            _id: product._id || product.id || `api_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            id: product.id || product._id || `api_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            image: imageUrl,
            imageUrl: imageUrl,
            price: parseFloat(product.price || 0),
            originalPrice: parseFloat(product.originalPrice || product.price || 0),
            stock: parseInt(product.stock || 0),
            category: product.category || 'Other'
          };
        });
        
        // Merge with existing products - KEEP BOTH API AND NEW PRODUCTS
        setProducts(prevProducts => {
          // Create a set of existing product IDs
          const existingIds = new Set(prevProducts.map(p => p._id || p.id));
          
          // Filter out products we already have in the state
          const newApiProducts = processedProducts.filter(p => 
            !existingIds.has(p._id) && !existingIds.has(p.id)
          );
          
          if (newApiProducts.length > 0) {
            // Combine the new products with existing ones, preserving the order
            const updatedProducts = [...prevProducts, ...newApiProducts];
            // Save to localStorage as backup
            saveProductsToLocalStorage(updatedProducts);
            return updatedProducts;
          }
          
          return prevProducts;
        });
      }
      
      // After all processing, check if we have any products at all
      setProducts(currentProducts => {
        if (currentProducts.length === 0) {
          setError('No products found. Add your first product to get started.');
        } else {
          // Clear error if we have products
          setError('');
        }
        return currentProducts;
      });
      
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      // Only show error if we truly have no products
      setProducts(currentProducts => {
        if (currentProducts.length === 0) {
          setError('Add your first product to get started.');
        }
        return currentProducts;
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to save products to localStorage as backup
  const saveProductsToLocalStorage = (products) => {
    try {
      // Keep only the most recent 20 products to avoid storage limits
      const productsCopy = [...products].slice(0, 20);
      localStorage.setItem('vendorProducts', JSON.stringify(productsCopy));
    } catch (storageError) {
      console.error('Failed to save products to localStorage:', storageError);
    }
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category || CATEGORIES[0],
        price: product.price || '',
        originalPrice: product.originalPrice || product.price || '',
        description: product.description || '',
        image: product.image || product.imageUrl || 'https://via.placeholder.com/300',
        stock: product.stock || 10,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: CATEGORIES[0],
        price: '',
        originalPrice: '',
        description: '',
        image: '',
        stock: 10,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: CATEGORIES[0],
      price: '',
      originalPrice: '',
      description: '',
      image: '',
      stock: 10,
    });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle numeric fields
    if (type === 'number') {
      // Prevent negative values
      const numValue = parseFloat(value);
      if (value && !isNaN(numValue)) {
        if (numValue < 0) return;
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category) {
        setError("Please fill in all required fields");
        return;
      }
      
      // Simply use the original image URL
      const imageUrl = formData.image || DEFAULT_IMAGE;
      console.log('Using image URL for submission:', imageUrl);

      // Prepare the minimal product data needed by the API
      const productData = {
        name: formData.name,
        description: formData.description || `Description for ${formData.name}`,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock || 10),
        image: imageUrl,
        imageUrl: imageUrl
      };
      
      console.log('Submitting product data:', productData);
      
      let savedProduct;
      
      // Try to save the product to the database
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct._id, productData);
        console.log('Product updated successfully:', savedProduct);
      } else {
        savedProduct = await addProduct(productData);
        console.log('Product added successfully:', savedProduct);
      }
      
      // Update the UI with the saved product
      setProducts(prevProducts => {
        if (editingProduct) {
          // Update existing product
          return prevProducts.map(p => 
            (p._id === editingProduct._id || p.id === editingProduct._id) ? savedProduct : p
          );
        } else {
          // Add new product
          return [...prevProducts, savedProduct];
        }
      });
      
      // Close dialog
      handleClose();
      setError('');
      
    } catch (error) {
      console.error('Failed to save product:', error);
      setError('Server error: ' + (error.message || 'Failed to save product'));
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      // Try to delete through API first
      try {
        await deleteProduct(productId);
      } catch (apiError) {
        console.error('API delete error, removing from UI only:', apiError);
        // Continue to the UI update even if the API fails
      }
      
      // Remove product from local state regardless of API success
      setProducts(prevProducts => prevProducts.filter(p => 
        p._id !== productId && p.id !== productId
      ));
      
      // Try to refresh products
      try {
        const updatedProducts = await getVendorProducts();
        
        // Process products to ensure consistent image display
        const processedProducts = updatedProducts.map(product => ({
          ...product,
          image: product.image || product.imageUrl || DEFAULT_IMAGE
        }));
        
        setProducts(processedProducts);
      } catch (refreshError) {
        console.error('Failed to refresh products after delete, using local state:', refreshError);
        // Already removed from local state above, so no action needed
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error deleting product: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out vendor...');
      // Clear any errors or notifications
      setError('');
      setNotification({ show: false, message: '', type: '' });
      
      // Call the logout function
      await logoutVendor();
      
      console.log('Logout successful, redirecting to login page...');
      // Redirect to login page
      navigate('/vendor-login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if there's an error
      window.location.href = '/vendor-login';
    }
  };

  // Add a refresh button to the header for manual product refresh
  const refreshProducts = () => {
    console.log('Manual refresh requested');
    setLoading(true);
    fetchProducts();
  };

  // Add retry button in the error message section
  const renderError = () => {
    if (!error) return null;

  return (
      <div className="error-container">
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchProducts}
              startIcon={<FontAwesomeIcon icon={faSpinner} />}
            >
              Retry
        </Button>
          }
        >
          {error}
        </Alert>
      </div>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <div className="vendor-dashboard">
      <header className="dashboard-header">
        <div className="vendor-info">
          <FontAwesomeIcon icon={faStore} />
          <div className="vendor-details">
            <h1>{vendorInfo?.storeName || "Style Hub"}</h1>
            <p>{vendorInfo?.email || "demo8@gmail.com"}</p>
          </div>
        </div>
        <div className="dashboard-actions">
          <Link 
            to={`/store/${vendorInfo?._id}`} 
            className="visit-store-link"
          >
            <FontAwesomeIcon icon={faStore} /> Visit Store
          </Link>
          <Link 
            to="/add-product"
            className="add-product-link"
          >
            ADD NEW PRODUCT
          </Link>
          <button 
            onClick={(e) => {
              e.preventDefault();
              console.log('Logout button clicked');
              handleLogout();
            }}
            className="logout-button"
            type="button"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> LOGOUT
          </button>
        </div>
      </header>

      {renderError()}

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-spinner">
            <FontAwesomeIcon icon={faSpinner} spin />
            <p>Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.some(p => p.isMockData) && (
              <div className="info-message">
                <FontAwesomeIcon icon={faExclamationCircle} style={{ color: '#f39c12' }} />
                <p>Server is currently unavailable. Showing placeholder products.</p>
              </div>
            )}
            {products.map((product) => (
              <div key={product._id} className={`product-card ${product.isMockData ? 'mock-product' : ''}`}>
                <div className="product-image">
                  {product.isMockData && (
                    <div className="mock-badge">PLACEHOLDER</div>
                  )}
                  {product.discountPrice && product.price > product.discountPrice && (
                    <div className="discount-badge">
                      20% OFF
                    </div>
                  )}
                  <CardMedia
                    component="img"
                    image={product.image || product.imageUrl || 'https://via.placeholder.com/300'}
                    alt={product.name || 'Product'}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      backgroundColor: '#fff'
                    }}
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = 'https://via.placeholder.com/300';
                    }}
                  />
                </div>
                <div className="product-content">
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-pricing">
                    <span className="current-price">₹{product.discountPrice || product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="original-price">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <div className="product-rating">
                    <div className="stars">
                      {'★'.repeat(Math.round(product.rating || 4.5))}
                      {'☆'.repeat(5 - Math.round(product.rating || 4.5))}
                    </div>
                    <span className="review-count">({product.reviewCount || Math.floor(Math.random() * 100) + 10})</span>
                  </div>
                  <p className="product-description">
                    {product.description || 'No description available'}
                  </p>
                  <div className="store-info">
                    <FontAwesomeIcon icon={faStore} className="store-icon" />
                    <div className="store-details">
                      <span className="store-name">{product.vendorName || vendorInfo?.storeName}</span>
                      <div className="store-rating">
                        <span className="rating-value">{product.vendorRating || '4.7'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="stock-status">
                    <span className={`status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      In Stock ({product.stock})
                    </span>
                  </div>
                </div>
                <div className="product-actions">
                  {!product.isMockData ? (
                    <>
                      <Link to={`/edit-product/${product._id}`} className="edit-button">
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </Link>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(product._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </>
                  ) : (
                    <div className="mock-actions">
                      <button className="retry-server-button" onClick={fetchProducts}>
                        <FontAwesomeIcon icon={faSpinner} /> Retry Server
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products-container">
            <h2>No products found</h2>
            <Link to="/add-product" className="add-first-product">
              ADD YOUR FIRST PRODUCT
            </Link>
          </div>
        )}
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              name="category"
              label="Category"
              select
              value={formData.category}
              onChange={handleChange}
              required
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              name="price"
              label="Price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              name="originalPrice"
              label="Original Price"
              type="number"
              value={formData.originalPrice}
              onChange={handleChange}
              helperText="Leave empty to use the same as price"
            />
            <TextField
              fullWidth
              margin="normal"
              name="stock"
              label="Stock Quantity"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              name="image"
              label="Image URL"
              value={formData.image}
              onChange={handleChange}
              required
              helperText="This image URL will be used to display your product"
            />
            {formData.image && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Image Preview:</Typography>
                <CardMedia
                  component="img"
                  image={formData.image || 'https://via.placeholder.com/300'}
                  alt="Product Preview" 
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px',
                    objectFit: 'contain',
                    mx: 'auto',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    bgcolor: '#fff'
                  }}
                  onError={(e) => {
                    console.error('Preview image failed to load:', formData.image);
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = 'https://via.placeholder.com/300';
                    e.target.style.border = '1px dashed #ff6b6b';
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 