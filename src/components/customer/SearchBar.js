import React, { useState, useMemo } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Autocomplete,
  TextField,
  Typography
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ALL_PRODUCTS } from '../../data/products';

const SearchWrapper = styled(Paper)(({ theme }) => ({
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: 600,
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid',
  borderColor: 'rgba(255, 255, 255, 0.2)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  transition: 'all 0.2s ease-in-out',
}));

const SearchInput = styled(Autocomplete)(({ theme }) => ({
  flex: 1,
  '& .MuiInputBase-root': {
    padding: theme.spacing(1, 1, 1, 2),
  }
}));

// Categories for search
const CATEGORIES = [
  { name: "Electronics", value: "electronics" },
  { name: "Computers", value: "computers" },
  { name: "Fashion", value: "fashion" },
  { name: "Appliances", value: "appliances" },
  { name: "Furniture", value: "furniture" },
];

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Generate search suggestions based on input
  const getSearchSuggestions = (searchTerm) => {
    if (!searchTerm) return [];
    
    const term = searchTerm.toLowerCase();
    
    // Search in products
    const productMatches = ALL_PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(term)
    ).map(product => ({
      label: product.name,
      type: 'product',
      category: product.category,
      image: product.image,
      price: product.price
    }));

    return productMatches;
  };

  const handleSearch = (event, value) => {
    if (!value) return;
    
    if (typeof value === 'string') {
      // Handle direct search
      const searchResults = ALL_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      if (searchResults.length > 0) {
        navigate(`/search?q=${encodeURIComponent(value)}`);
      }
    } else {
      // Handle selection from dropdown
      navigate(`/category/${value.category}?search=${encodeURIComponent(value.label)}`);
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <SearchWrapper>
        <SearchInput
          freeSolo
          options={getSearchSuggestions(searchTerm)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search for products..."
              variant="standard"
              fullWidth
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <img 
                src={option.image} 
                alt={option.label}
                style={{ width: 40, height: 40, objectFit: 'contain' }}
              />
              <Box>
                <Typography variant="body1" noWrap>
                  {option.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ₹{option.price.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
          onChange={handleSearch}
          onInputChange={(event, value) => setSearchTerm(value)}
          getOptionLabel={(option) => 
            typeof option === 'string' ? option : option.label
          }
        />
        <IconButton 
          type="button" 
          aria-label="search"
          onClick={() => handleSearch(null, searchTerm)}
        >
          <SearchIcon />
        </IconButton>
      </SearchWrapper>
    </Box>
  );
}
