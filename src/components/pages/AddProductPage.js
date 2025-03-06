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
    discountEnd: ''
  });
  
  const [images, setImages] = useState([]);

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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Calculate discount price if applicable
      let discountPrice = null;
      if (formData.applyDiscount && formData.discountValue) {
        if (formData.discountType === 'percentage') {
          const discountPercentage = parseFloat(formData.discountValue) / 100;
          discountPrice = parseFloat(formData.price) * (1 - discountPercentage);
        } else {
          discountPrice = parseFloat(formData.price) - parseFloat(formData.discountValue);
        }
        // Ensure discount price is not negative
        discountPrice = Math.max(0, discountPrice);
      }
      
      // Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: discountPrice,
        stock: parseInt(formData.stock),
        sku: formData.sku,
        category: formData.category,
        // Use the first image as the main image or a placeholder
        image: images.length > 0 ? images[0].preview : 'https://via.placeholder.com/300',
        vendor: vendorInfo?.storeName || 'Unknown Vendor',
        vendorId: vendorInfo?.id
      };
      
      // Add product using vendor service
      const newProduct = await addProduct(productData);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('productUpdated', { detail: newProduct }));
      
      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/vendor-dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add product. Please try again.');
    } finally {
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