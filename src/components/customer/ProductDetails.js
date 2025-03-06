import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  Divider,
  TextField,
  Chip,
  Stack
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function ProductDetails({ open, onClose, product }) {
  const [quantity, setQuantity] = useState(1);

  const handleReserve = () => {
    // Handle reservation logic here
    console.log('Reserved:', { product, quantity });
    onClose();
  };

  if (!product) return null;

  const storeInfo = typeof product.store === 'string'
    ? {
        name: product.store,
        address: "Contact store for address",
        rating: null,
        contact: "Contact store for details"
      }
    : product.store;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" gutterBottom>
          {product.name}
        </Typography>
        <Chip 
          icon={<StorefrontIcon />} 
          label={product.store.name} 
          color="primary" 
          variant="outlined" 
          size="small" 
        />
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', borderRadius: 8 }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              ₹{product.price.toLocaleString()}
              {product.originalPrice && (
                <Typography 
                  component="span" 
                  sx={{ 
                    textDecoration: 'line-through', 
                    color: 'text.secondary',
                    ml: 1 
                  }}
                >
                  ₹{product.originalPrice.toLocaleString()}
                </Typography>
              )}
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Rating value={product.rating} readOnly precision={0.5} />
              <Typography color="text.secondary">
                ({product.reviewCount} reviews)
              </Typography>
            </Stack>

            <Typography paragraph>{product.description}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Store Information</Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="action" />
                <Typography>{storeInfo.address}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon color="action" />
                <Typography>{storeInfo.contact}</Typography>
              </Box>
              {storeInfo.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={storeInfo.rating} readOnly size="small" />
                  <Typography variant="body2">Store Rating</Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            InputProps={{ inputProps: { min: 1 } }}
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleReserve}
          disabled={quantity < 1}
        >
          Reserve Product
        </Button>
      </DialogActions>
    </Dialog>
  );
} 