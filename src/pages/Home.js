import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  InputBase,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import ProductCard from '../components/customer/ProductCard';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#8B5CF6',
          borderRadius: '0 0 24px 24px',
          py: 8,
          mb: 4,
          textAlign: 'center',
          color: 'white',
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            StoreLinker
          </Typography>
          
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              fontWeight: 400,
              mb: 4,
              opacity: 0.9,
            }}
          >
            Your one-stop shop for comparing prices and finding the best deals
          </Typography>

          {/* Search Bar */}
          <Box
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              bgcolor: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              px: 3,
              py: 1,
            }}
          >
            <InputBase
              placeholder="Search for products..."
              sx={{
                flex: 1,
                fontSize: '1.1rem',
                color: '#000',
              }}
            />
            <IconButton sx={{ color: '#666' }}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Products Section */}
      <Container maxWidth="xl">
        <Typography
          variant="h5"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 600,
            mb: 3,
          }}
        >
          Latest Products
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {products.slice(0, 8).map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Feature Cards Section */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontSize: '1.5rem',
              fontWeight: 600,
              mb: 3,
            }}
          >
            Explore more categories : Shop now
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: "Electronics & Gadgets",
                description: "Explore the latest electronics and smart devices",
                path: "/category/electronics",
                icon: "SmartphoneIcon"
              },
              {
                title: "Fashion & Apparel",
                description: "Discover trending fashion and accessories",
                path: "/category/fashion",
                icon: "CheckroomIcon"
              },
              {
                title: "Home & Furniture",
                description: "Find perfect pieces for your home",
                path: "/category/home-furniture",
                icon: "WeekendIcon"
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  component={RouterLink}
                  to={feature.path}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'white',
                      p: 4,
                      borderRadius: '16px',
                      textAlign: 'center',
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
