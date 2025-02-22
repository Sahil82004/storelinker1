import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  IconButton,
  Divider,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export default function Cart() {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customer/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setCart(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await fetch('http://localhost:5000/api/customer/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/customer/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
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

  if (cart.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Your cart is empty
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
          Add items to your cart to continue shopping
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            {cart.items.map((item) => (
              <Box key={item.product._id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3} sm={2}>
                    <Box
                      component="img"
                      src={item.product.image}
                      alt={item.product.name}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  </Grid>
                  <Grid item xs={9} sm={4}>
                    <Typography variant="subtitle1">
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{item.product.price.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        sx={{ width: 60, mx: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Typography variant="subtitle1" align="right">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeItem(item.product._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ my: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>Subtotal</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">
                    ₹{cart.subtotal.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>Tax</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">
                    ₹{cart.tax.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Divider />
            <Box sx={{ my: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h6">Total</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right">
                    ₹{cart.total.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Button variant="contained" fullWidth size="large">
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 