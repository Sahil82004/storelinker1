import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { cartItems, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Grid container spacing={4}>
        {/* Login Form */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Cart Preview */}
        <Grid item xs={12} md={6}>
          <Box sx={{ marginTop: 8 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Cart ({cartItems.length} items)
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {cartItems.length > 0 ? (
                <>
                  {cartItems.map((item) => (
                    <Box key={item.id} sx={{ mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3}>
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle1">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="subtitle1">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                    </Box>
                  ))}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" align="right">
                      Total: ₹{getCartTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="body1" align="center">
                  Your cart is empty
                </Typography>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
} 