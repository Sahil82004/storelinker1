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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  'electronics',
  'computers',
  'fashion',
  'appliances',
  'furniture',
];

export default function VendorDashboard() {
  const { user } = useAuth();
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
  });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/vendor/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('Fetched products:', data); // Debug log
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpen = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        description: product.description,
        image: product.image,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        description: '',
        image: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      originalPrice: '',
      description: '',
      image: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found');
      return;
    }

    try {
      const url = editingProduct
        ? `http://localhost:5000/api/vendor/products/${editingProduct._id}`
        : 'http://localhost:5000/api/vendor/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      handleClose();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Error saving product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/vendor/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error deleting product');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Vendor Dashboard</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add New Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={product.image || 'https://via.placeholder.com/200'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography color="textSecondary">
                  Category: {product.category}
                </Typography>
                <Typography>Price: ₹{product.price}</Typography>
                <Typography>Original Price: ₹{product.originalPrice}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {product.description}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpen(product)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(product._id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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
                  {category.charAt(0).toUpperCase() + category.slice(1)}
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 