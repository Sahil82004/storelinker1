import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Box,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import ProductCard from '../components/customer/ProductCard';

const formatCategoryName = (category) => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function CategoryProducts() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/api/products/category/${category}`);
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
  }, [category]);

  // Filter products based on search term if present
  const filteredProducts = searchTerm 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const formattedCategoryName = formatCategoryName(category);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Typography color="text.primary">
          {formattedCategoryName}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {formattedCategoryName}
        </Typography>
        {searchTerm && (
          <Typography variant="subtitle1" color="text.secondary">
            Search results for: {searchTerm}
          </Typography>
        )}
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : filteredProducts.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography color="text.secondary">
            {searchTerm 
              ? `No products matching "${searchTerm}" in ${formattedCategoryName}`
              : `No products available in ${formattedCategoryName} category`}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard product={product} showStoreInfo />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 