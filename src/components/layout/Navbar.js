import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Container,
  Avatar,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
  InputBase,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  LocalOffer as OfferIcon,
  Compare as CompareIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Smartphone as SmartphoneIcon,
  Checkroom as CheckroomIcon,
  Laptop as LaptopIcon,
  Kitchen as KitchenIcon,
  Weekend as WeekendIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleCategoryMenuOpen = (event) => {
    setCategoryMenuAnchor(event.currentTarget);
  };

  const handleCategoryMenuClose = () => {
    setCategoryMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: '#1E1E1E',
        color: 'white',
        boxShadow: 'none',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px' }}>
          {/* Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: 'flex',
              fontWeight: 700,
              color: '#fff',
              textDecoration: 'none',
              fontSize: '1.5rem',
            }}
          >
            StoreLinker
          </Typography>

          {/* Search Bar */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            bgcolor: '#fff',
            borderRadius: '4px',
            px: 2,
            mx: 2,
            alignItems: 'center'
          }}>
            <InputBase
              placeholder="Search for products..."
              sx={{ 
                flexGrow: 1,
                py: 1,
                color: '#000',
              }}
            />
            <IconButton sx={{ color: '#666' }}>
              <SearchIcon />
            </IconButton>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Categories */}
            <Button
              onClick={handleCategoryMenuOpen}
              startIcon={<CategoryIcon />}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Categories
            </Button>

            {/* Show these buttons only for customers or non-logged in users */}
            {(!user || user.userType === 'customer') && (
              <>
                {/* Compare */}
                <Button
                  component={RouterLink}
                  to="/compare"
                  startIcon={<CompareIcon />}
                  sx={{
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Compare
                </Button>

                {/* Offers */}
                <Button
                  component={RouterLink}
                  to="/offers"
                  startIcon={<OfferIcon />}
                  sx={{
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Offers
                </Button>

                {/* Cart */}
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  sx={{
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  <Badge badgeContent={4} color="error">
                    <CartIcon />
                  </Badge>
                </IconButton>
              </>
            )}

            {/* User Menu or Login Button */}
            {user ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#8B5CF6',
                        fontSize: '1rem',
                      }}
                    >
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  onClick={handleUserMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                    },
                  }}
                >
                  {user.userType === 'customer' && (
                    <>
                      <MenuItem component={RouterLink} to="/profile">
                        <ListItemIcon>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        Profile
                      </MenuItem>
                      <MenuItem component={RouterLink} to="/orders">
                        <ListItemIcon>
                          <HistoryIcon fontSize="small" />
                        </ListItemIcon>
                        Orders
                      </MenuItem>
                      <MenuItem component={RouterLink} to="/settings">
                        <ListItemIcon>
                          <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Settings
                      </MenuItem>
                      <Divider />
                    </>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                sx={{
                  bgcolor: '#8B5CF6',
                  color: 'white',
                  '&:hover': { bgcolor: '#7C3AED' },
                  px: 3,
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Categories Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={handleCategoryMenuClose}
        sx={{ mt: 1 }}
      >
        <MenuItem 
          component={RouterLink} 
          to="/category/electronics" 
          onClick={handleCategoryMenuClose}
        >
          <ListItemIcon>
            <SmartphoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Electronics</ListItemText>
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to="/category/fashion" 
          onClick={handleCategoryMenuClose}
        >
          <ListItemIcon>
            <CheckroomIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Fashion</ListItemText>
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to="/category/computers" 
          onClick={handleCategoryMenuClose}
        >
          <ListItemIcon>
            <LaptopIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Computers</ListItemText>
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to="/category/appliances" 
          onClick={handleCategoryMenuClose}
        >
          <ListItemIcon>
            <KitchenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Appliances</ListItemText>
        </MenuItem>
        <MenuItem 
          component={RouterLink} 
          to="/category/home-furniture" 
          onClick={handleCategoryMenuClose}
        >
          <ListItemIcon>
            <WeekendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Home & Furniture</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
} 