import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export default function Cart({ open, onClose }) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Shopping Cart</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <List>
          {/* Mock cart items - replace with actual cart data */}
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="delete">
                <DeleteOutlineIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar variant="square" src="product-image.jpg" />
            </ListItemAvatar>
            <ListItemText
              primary="Product Name"
              secondary={
                <Box>
                  <Typography variant="body2">$99.99</Typography>
                  <Typography variant="caption">Quantity: 1</Typography>
                </Box>
              }
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Total:</Typography>
            <Typography variant="h6">$99.99</Typography>
          </Box>
          <Button variant="contained" fullWidth>
            Checkout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
