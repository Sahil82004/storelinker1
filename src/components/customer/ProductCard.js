import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Rating,
  Chip,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const ProductImage = styled(CardMedia)({
  height: 200,
  backgroundSize: 'contain',
  backgroundColor: '#f5f5f5',
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ProductCard({ product, showStoreInfo = false }) {
  const {
    name,
    price,
    originalPrice,
    discount,
    rating,
    reviewCount,
    image,
    store,
  } = product;

  return (
    <StyledCard>
      <ProductImage
        component="img"
        image={image || 'https://via.placeholder.com/300'}
        alt={name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="h2"
          sx={{
            fontSize: '1rem',
            fontWeight: 500,
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {name}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {formatPrice(price)}
          </Typography>
          {originalPrice && originalPrice > price && (
            <>
              <Typography
                variant="body2"
                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
              >
                {formatPrice(originalPrice)}
              </Typography>
              <Chip
                label={`${discount}% off`}
                size="small"
                color="success"
                sx={{ height: 20 }}
              />
            </>
          )}
        </Stack>

        {(rating || reviewCount) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={rating} precision={0.1} size="small" readOnly />
            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              ({reviewCount})
            </Typography>
          </Box>
        )}

        {showStoreInfo && store && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Sold by: {store.name}
            </Typography>
            {store.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating value={store.rating} precision={0.1} size="small" readOnly />
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({store.reviewCount || 0})
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
}
