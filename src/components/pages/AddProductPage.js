import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faCloudUploadAlt, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/AddProductPage.css';
import { addProduct, getVendorInfo, isVendorLoggedIn } from '../../services/vendorService';
import { formatPrice } from '../../utils/priceFormatter';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    sku: '',
    description: '',
    applyDiscount: false,
    discountType: 'percentage',
    discountValue: '',
    discountStart: '',
    discountEnd: '',
    imageUrl: '',
    image: ''
  });
  
  const [images, setImages] = useState([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Check if vendor is logged in
    if (!isVendorLoggedIn()) {
      navigate('/vendor-login');
      return;
    }

    // Load vendor info
    const storedVendorInfo = getVendorInfo();
    setVendorInfo(storedVendorInfo);
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      // Limit to 5 images
      const filesToAdd = files.slice(0, 5);
      
      const newImages = filesToAdd.map(file => ({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setImages(prevImages => [...prevImages, ...newImages].slice(0, 5));
    }
  };
  
  const removeImage = (id) => {
    setImages(prevImages => prevImages.filter(image => image.id !== id));
  };
  
  // Error handling helper
  const handleError = (err) => {
    console.error('Error details:', err);
    
    // Set a user-friendly error message
    if (err.message && err.message.includes('Server error')) {
      setError('Server error: Unable to connect to the product database. Please try again later or contact support.');
    } else if (err.message && err.message.includes('Not authenticated')) {
      setError('Authentication error: Your session may have expired. Please log in again.');
      setTimeout(() => {
        navigate('/vendor-login');
      }, 3000);
    } else {
      setError(err.message || 'Failed to add product. Please check your inputs and try again.');
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.category) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Get vendor info - verify it's available
      const vendorInfo = getVendorInfo();
      if (!vendorInfo) {
        setError("Authentication error: Vendor information not available. Please log in again.");
        setTimeout(() => navigate('/vendor-login'), 2000);
        setLoading(false);
        return;
      }

      // Fix the image URL handling
      let imageUrl = '';
      if (formData.imageUrl) {
        imageUrl = formData.imageUrl;
      } else if (images.length > 0) {
        if (images[0].preview && images[0].preview.startsWith('http')) {
          imageUrl = images[0].preview;
        } else {
          imageUrl = 'https://via.placeholder.com/500x500?text=Product+Image';
        }
      } else {
        imageUrl = 'https://via.placeholder.com/500x500?text=Product+Image';
      }

      // Generate a temporary ID for immediate display
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Prepare product data with all required fields
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || `${formData.name.trim()} - Quality product`,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice || formData.price),
        category: formData.category,
        imageUrl: imageUrl,
        image: imageUrl,
        stock: parseInt(formData.stock || 10),
        vendorId: vendorInfo._id,
        vendorName: vendorInfo.storeName || vendorInfo.name,
        status: 'active',
        id: tempId,
        _id: tempId
      };

      // Save to localStorage as backup
      try {
        const existingProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
        const updatedProducts = [productData, ...existingProducts].slice(0, 20); // Keep last 20 products
        localStorage.setItem('vendorProducts', JSON.stringify(updatedProducts));
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
      }

      // Save in sessionStorage for immediate display
      try {
        sessionStorage.setItem('recentlyAddedProduct', JSON.stringify(productData));
        
        // Dispatch event for real-time update
        window.dispatchEvent(new CustomEvent('productUpdated', {
          detail: productData
        }));
      } catch (storageError) {
        console.error('Error storing product in sessionStorage:', storageError);
      }

      // Set success and redirect
      setSuccess(true);
      
      // Call the API in the background
      addProduct(productData)
        .then(savedProduct => {
          console.log('Product saved successfully in API:', savedProduct);
          
          // Update localStorage with the actual product data from API
          try {
            const existingProducts = JSON.parse(localStorage.getItem('vendorProducts') || '[]');
            const updatedProducts = existingProducts.map(p => 
              p._id === tempId ? savedProduct : p
            );
            localStorage.setItem('vendorProducts', JSON.stringify(updatedProducts));
            
            // Update sessionStorage with the actual product data
            sessionStorage.setItem('recentlyAddedProduct', JSON.stringify(savedProduct));
            
            // Dispatch event with updated data
            window.dispatchEvent(new CustomEvent('productUpdated', {
              detail: savedProduct
            }));
          } catch (storageError) {
            console.error('Error updating product in storage:', storageError);
          }
        })
        .catch(apiError => {
          console.error('API error (product will remain in UI but may not be saved permanently):', apiError);
        });

      // Redirect after visual feedback
      setTimeout(() => {
        navigate('/vendor-dashboard');
      }, 1500);
    } catch (error) {
      console.error('Failed to save product:', error);
      if (error.message && error.message.includes('authentication')) {
        setError("Authentication error. Please log in again.");
        setTimeout(() => navigate('/vendor-login'), 2000);
      } else if (error.response && error.response.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(error.message || 'Failed to save product. Please try again.');
      }
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/vendor-dashboard');
  };
  
  return (
    <div className="add-product-page">
      <header>
        <div className="container header-container">
          <div className="logo">
            <h1>Vendor Dashboard</h1>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <span>{vendorInfo?.storeName || 'Vendor'}</span>
            <Link to="/logout" style={{ color: 'white', marginLeft: '15px' }}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container">
        <div className="add-product-container">
          <h2 className="page-title">Add New Product</h2>
          
          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <span>Product added successfully! Redirecting to dashboard...</span>
            </div>
          )}
          
          <form id="add-product-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="product-name">Product Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="product-name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="product-category">Category</label>
                <select 
                  className="form-control" 
                  id="product-category" 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="beauty">Beauty & Personal Care</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="books">Books</option>
                  <option value="toys">Toys & Games</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="product-price">Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    className="form-control" 
                    id="product-price" 
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="product-stock">Stock Quantity</label>
                  <input 
                    type="number" 
                    min="0" 
                    className="form-control" 
                    id="product-stock" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="product-sku">SKU (Stock Keeping Unit)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="product-sku" 
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>
              
              {/* Discount Section */}
              <div className="form-group-full discount-section">
                <h3 className="discount-section-title">Discount Information</h3>
                
                <div className="discount-toggle">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="discount-toggle" 
                      name="applyDiscount"
                      checked={formData.applyDiscount}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">Apply Discount</span>
                </div>
                
                {formData.applyDiscount && (
                  <div id="discount-options">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="discount-type">Discount Type</label>
                        <select 
                          className="form-control" 
                          id="discount-type"
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleChange}
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="discount-value">Discount Value</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          className="form-control" 
                          id="discount-value"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="discount-start">Start Date</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          id="discount-start"
                          name="discountStart"
                          value={formData.discountStart}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="discount-end">End Date</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          id="discount-end"
                          name="discountEnd"
                          value={formData.discountEnd}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-group-full">
                <label className="form-label" htmlFor="product-description">Product Description</label>
                <textarea 
                  className="form-control form-control-textarea" 
                  id="product-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-group-full">
                <label className="form-label">Product Images</label>
                <div className="image-upload-tabs">
                  <button 
                    type="button"
                    className={`tab-button ${!showUrlInput ? 'active' : ''}`}
                    onClick={() => setShowUrlInput(false)}
                  >
                    File Upload
                  </button>
                  <button 
                    type="button"
                    className={`tab-button ${showUrlInput ? 'active' : ''}`}
                    onClick={() => setShowUrlInput(true)}
                  >
                    Image URL
                  </button>
                </div>

                {showUrlInput ? (
                  <div className="url-input-section">
                    <input 
                      type="url" 
                      className="form-control"
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      value={imageUrl}
                      onChange={(e) => {
                        const url = e.target.value;
                        setImageUrl(url);
                        if (url) {
                          const newImage = {
                            id: Date.now(),
                            preview: url
                          };
                          setImages(prev => [...prev, newImage].slice(0, 5));
                        }
                      }}
                    />
                    <p className="url-hint">Enter a valid image URL. Supported formats: JPG, PNG, GIF</p>
                  </div>
                ) : (
                  <>
                    <div 
                      className="upload-area" 
                      id="upload-area"
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      <div className="upload-icon">
                        <FontAwesomeIcon icon={faCloudUploadAlt} />
                      </div>
                      <div className="upload-text">Drag & drop product images here</div>
                      <div className="upload-hint">or click to browse (Max 5 images, JPG, PNG or GIF)</div>
                    </div>
                    <input 
                      type="file" 
                      className="hidden-file-input" 
                      id="file-input" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </>
                )}

                <div className="image-preview-container" id="image-preview-container">
                  {images.map(image => (
                    <div className="image-preview" key={image.id}>
                      <img src={image.preview} alt="Preview" />
                      <div 
                        className="remove-image"
                        onClick={() => removeImage(image.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="btn-container">
              <button 
                type="button" 
                className="btn btn-secondary" 
                id="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Add Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage; 