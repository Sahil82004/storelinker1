import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ShoppingBag as ShoppingBagIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { getUserOrders } from '../../services/orderService';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Get orders from orderService
      const userOrders = getUserOrders();
      setOrders(userOrders);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders');
      setLoading(false);
    }
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const PaymentDetailsDialog = () => {
    if (!selectedOrder) return null;

    return (
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon color="primary" />
          Payment Details
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Information
                </Typography>
                <Typography variant="body1">
                  Order #{selectedOrder.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Payment Method
                </Typography>
                <Typography variant="body1">
                  {selectedOrder.paymentDetails.method}
                </Typography>
                {selectedOrder.paymentDetails.lastFour && (
                  <Typography variant="body2" color="text.secondary">
                    Card ending in {selectedOrder.paymentDetails.lastFour}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Billing Address
                </Typography>
                <Typography variant="body1">
                  {selectedOrder.shippingDetails.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.shippingDetails.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.shippingDetails.city}, {selectedOrder.shippingDetails.state} {selectedOrder.shippingDetails.zipCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.shippingDetails.country}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Payment Summary
              </Typography>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">₹{selectedOrder.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping:</Typography>
                  <Typography variant="body2">₹{selectedOrder.shipping.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax:</Typography>
                  <Typography variant="body2">₹{selectedOrder.tax.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Total Paid:</Typography>
                  <Typography variant="subtitle2" color="primary.main">
                    ₹{selectedOrder.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            When you place orders, they will appear here
          </Typography>
        </Paper>
      ) : (
        orders.map((order) => (
          <Accordion key={order.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Order #{order.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2">
                    Total: ₹{order.total.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Items: {order.items.length}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    startIcon={<VisibilityIcon />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(order);
                    }}
                  >
                    View Details
                  </Button>
                </Grid>
              </Grid>
            </AccordionSummary>
            
            <AccordionDetails>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                {order.items.map((item, index) => (
                  <Box key={index}>
                    <Grid container spacing={2} alignItems="center" sx={{ my: 1 }}>
                      <Grid item xs={12} sm={2}>
                        <img
                          src={item.image || item.images?.[0]}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxWidth: '100px',
                            objectFit: 'cover',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Vendor: {item.vendor}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2">
                          Quantity: {item.quantity}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography variant="subtitle2">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                    {index < order.items.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
                
                <Box sx={{ mt: 3, bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Shipping Details
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingDetails.name}
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingDetails.address}
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingDetails.country}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Order Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">₹{order.subtotal.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Shipping:</Typography>
                        <Typography variant="body2">₹{order.shipping.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Tax:</Typography>
                        <Typography variant="body2">₹{order.tax.toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">Total:</Typography>
                        <Typography variant="subtitle2">₹{order.total.toFixed(2)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <PaymentDetailsDialog />
    </Container>
  );
} 