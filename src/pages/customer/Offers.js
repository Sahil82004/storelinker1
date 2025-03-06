import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Timer as TimerIcon,
  ArrowForward as ArrowForwardIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  background: theme.palette.error.main,
  color: 'white',
  padding: '4px 12px',
  borderRadius: '20px',
  fontWeight: 'bold',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const TimeChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  right: 16,
  background: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [categories] = useState(['All Offers', 'Electronics', 'Fashion', 'Home & Furniture', 'Appliances']);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/offers');
      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }
      const data = await response.json();
      setOffers(data);
    } catch (err) {
      setError('Failed to load offers. Please try again later.');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filteredOffers = selectedTab === 0 
    ? offers 
    : offers.filter(offer => offer.category.toLowerCase() === categories[selectedTab].toLowerCase());

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={32} width="80%" />
              <Skeleton variant="text" height={24} width="60%" />
              <Skeleton variant="text" height={24} width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Featured Offers Slider */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Featured Offers
        </Typography>
        {loading ? (
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        ) : (
          <Box sx={{ 
            '.slick-dots': { 
              bottom: 16,
              '& li button:before': {
                color: 'white',
                fontSize: 12,
              },
              '& li.slick-active button:before': {
                color: 'white',
              },
            },
          }}>
            <Slider {...sliderSettings}>
              {offers.slice(0, 5).map((offer) => (
                <Box
                  key={offer._id}
                  sx={{
                    position: 'relative',
                    height: 400,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={offer.image}
                    alt={offer.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 4,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      color: 'white',
                    }}
                  >
                    <Typography variant="h4" gutterBottom>
                      {offer.title}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                      {offer.description}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/category/${offer.category}`}
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        bgcolor: 'white', 
                        color: 'black',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)',
                        },
                      }}
                    >
                      Shop Now
                    </Button>
                  </Box>
                  <DiscountBadge>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalOfferIcon fontSize="small" />
                      Up to {offer.discount}% Off
                    </Typography>
                  </DiscountBadge>
                </Box>
              ))}
            </Slider>
          </Box>
        )}
      </Box>

      {/* Category Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {categories.map((category) => (
            <Tab 
              key={category} 
              label={category}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1rem',
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Offer Cards */}
      {loading ? (
        renderSkeleton()
      ) : (
        <Grid container spacing={3}>
          {filteredOffers.map((offer) => (
            <Grid item xs={12} sm={6} md={4} key={offer._id}>
              <StyledCard component={RouterLink} to={`/category/${offer.category}`} sx={{ textDecoration: 'none' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={offer.image}
                    alt={offer.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <DiscountBadge>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalOfferIcon fontSize="small" />
                      {offer.discount}% Off
                    </Typography>
                  </DiscountBadge>
                  <TimeChip
                    icon={<TimerIcon />}
                    label={`Ends in ${offer.validUntil}`}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {offer.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {offer.description}
                  </Typography>
                  {offer.products && (
                    <Typography variant="body2" color="primary">
                      {offer.products.length} products
                    </Typography>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && filteredOffers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No active offers in this category
          </Typography>
        </Box>
      )}
    </Container>
  );
} 