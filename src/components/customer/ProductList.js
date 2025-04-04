import React, { useState, useEffect } from 'react';
import {
  Grid,
  Container,
  Typography,
  Box,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ProductCard from './ProductCard';
import CategoryCard from './CategoryCard';

// Feature cards for the bottom section
const FEATURE_CARDS = [
  {
    id: 1,
    name: "Discover Local Stores",
    description: "Find and connect with local businesses in your area",
    icon: "StorefrontIcon",
  },
  {
    id: 2,
    name: "Compare Prices",
    description: "Get the best deals by comparing prices across different stores",
    icon: "CompareIcon",
  },
  {
    id: 3,
    name: "Exclusive Offers",
    description: "Access special discounts and promotions from local retailers",
    icon: "LocalOfferIcon",
  }
];

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const url = selectedCategory
        ? `http://localhost:5001/api/products/category/${selectedCategory}`
        : 'http://localhost:5001/api/products';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Browse Products
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Explore more categories : Shop now
          </Typography>
          <Grid container spacing={3}>
            {FEATURE_CARDS.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.id}>
                <CategoryCard category={feature} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
