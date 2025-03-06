import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Tabs, 
  Tab,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimerIcon from '@mui/icons-material/Timer';
import { Link as RouterLink } from 'react-router-dom';

const OfferCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

// Mock data for offers
const OFFERS = [
  {
    id: 1,
    category: 'electronics',
    title: "Mega Electronics Sale",
    description: "Up to 75% off on Electronics",
    validUntil: "2024-04-30",
    image: "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg",
    discount: 75,
    products: [
      {
        name: "Noise Smart Watch",
        price: 1999,
        originalPrice: 7999,
        image: "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg"
      }
    ]
  },
  {
    id: 2,
    category: 'electronics',
    title: "Printer & Accessories",
    description: "Up to 29% off on Printers",
    validUntil: "2024-04-25",
    image: "https://m.media-amazon.com/images/I/71cX92XQKIL._SL1500_.jpg",
    discount: 29,
    products: [
      {
        name: "Dinojames Batch Coding Machine",
        price: 2498,
        originalPrice: 3500,
        image: "https://m.media-amazon.com/images/I/71cX92XQKIL._SL1500_.jpg"
      }
    ]
  },
  {
    id: 3,
    category: 'computers',
    title: "Laptop Deals",
    description: "Save big on Laptops",
    validUntil: "2024-04-28",
    image: "https://m.media-amazon.com/images/I/71xT5UKxcTL._SL1500_.jpg",
    discount: 10,
    products: [
      {
        name: "Dell XPS 15",
        price: 1799,
        originalPrice: 1999,
        image: "https://m.media-amazon.com/images/I/71xT5UKxcTL._SL1500_.jpg"
      }
    ]
  }
];

export default function Offers() {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const categories = ['All Offers', 'Electronics', 'Computers', 'Fashion', 'Appliances'];
  
  const filteredOffers = selectedTab === 0 
    ? OFFERS 
    : OFFERS.filter(offer => offer.category === categories[selectedTab].toLowerCase());

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Active Offers
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover the best deals and discounts
        </Typography>
      </Box>

      <Tabs 
        value={selectedTab} 
        onChange={handleTabChange}
        sx={{ mb: 4 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {categories.map((category) => (
          <Tab key={category} label={category} />
        ))}
      </Tabs>

      <Grid container spacing={3}>
        {filteredOffers.map((offer) => (
          <Grid item xs={12} sm={6} md={4} key={offer.id}>
            <OfferCard>
              <CardMedia
                component="img"
                height="200"
                image={offer.image}
                alt={offer.title}
                sx={{ objectFit: 'contain', bgcolor: 'grey.50', p: 2 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    icon={<LocalOfferIcon />} 
                    label={`${offer.discount}% OFF`}
                    color="error"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {offer.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {offer.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimerIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Valid until {new Date(offer.validUntil).toLocaleDateString()}
                  </Typography>
                </Box>

                {offer.products.map((product) => (
                  <Box key={product.name} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="primary">
                        ₹{product.price.toLocaleString()}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ textDecoration: 'line-through' }}
                      >
                        ₹{product.originalPrice.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                <Button 
                  component={RouterLink}
                  to={`/category/${offer.category}`}
                  variant="contained" 
                  fullWidth
                >
                  View All Products
                </Button>
              </CardContent>
            </OfferCard>
          </Grid>
        ))}
      </Grid>

      {filteredOffers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No active offers in this category
          </Typography>
        </Box>
      )}
    </Container>
  );
} 