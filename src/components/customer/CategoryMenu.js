import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import CategoryIcon from '@mui/icons-material/Category';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import LaptopIcon from '@mui/icons-material/Laptop';
import ShirtIcon from '@mui/icons-material/Checkroom';
import KitchenIcon from '@mui/icons-material/Kitchen';
import WeekendIcon from '@mui/icons-material/Weekend';

const categories = [
  { name: 'Electronics', icon: <SmartphoneIcon />, path: '/category/electronics' },
  { name: 'Computers', icon: <LaptopIcon />, path: '/category/computers' },
  { name: 'Fashion', icon: <ShirtIcon />, path: '/category/fashion' },
  { name: 'Appliances', icon: <KitchenIcon />, path: '/category/appliances' },
  { name: 'Home & Furniture', icon: <WeekendIcon />, path: '/category/home-furniture' },
];

export default function CategoryMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
        startIcon={<CategoryIcon />}
      >
        Categories
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'categories-button',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 220,
            maxHeight: '70vh',
            mt: 1,
          },
        }}
      >
        {categories.map((category) => (
          <MenuItem
            key={category.name}
            component={RouterLink}
            to={category.path}
            onClick={handleClose}
            sx={{
              py: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {category.icon}
            </ListItemIcon>
            <ListItemText primary={category.name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
} 