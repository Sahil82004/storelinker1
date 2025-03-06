import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Rating,
  Button,
  Box,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export default function Compare() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompareProducts();
  }, []);

  const fetchCompareProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customer/compare', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCompare = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/customer/compare/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter(p => p._id !== productId));
      }
    } catch (err) {
      console.error('Failed to remove product:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          No products to compare
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
          Add products to compare from the product listing page
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Compare Products
      </Typography>

      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Paper sx={{ p: 2, position: 'relative' }}>
              <IconButton
                size="small"
                onClick={() => removeFromCompare(product._id)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <CloseIcon />
              </IconButton>

              <Box
                component="img"
                src={product.image}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'contain',
                  mb: 2,
                }}
              />

              <Typography variant="h6" gutterBottom>
                {product.name}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
                  ₹{product.price.toLocaleString()}
                </Typography>
                {product.originalPrice && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through', ml: 1 }}
                    component="span"
                  >
                    ₹{product.originalPrice.toLocaleString()}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Rating value={product.rating} readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({product.reviewCount} reviews)
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
              </Box>

              <Button variant="contained" fullWidth>
                Add to Cart
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 