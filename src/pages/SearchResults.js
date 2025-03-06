import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Box,
  Breadcrumbs,
  Link 
} from '@mui/material';
import ProductCard from '../components/customer/ProductCard';

// Import the ALL_PRODUCTS array from SearchBar or a common data file
import { ALL_PRODUCTS } from '../data/products';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  
  const searchResults = ALL_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/" color="inherit">Home</Link>
        <Typography color="text.primary">Search Results</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Search Results
        <Typography variant="subtitle1" color="text.secondary">
          {searchResults.length} results for "{searchQuery}"
        </Typography>
      </Typography>

      <Grid container spacing={3}>
        {searchResults.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.name}>
            <ProductCard product={product} showStoreInfo />
          </Grid>
        ))}
      </Grid>

      {searchResults.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products found matching "{searchQuery}"
          </Typography>
        </Box>
      )}
    </Container>
  );
} 