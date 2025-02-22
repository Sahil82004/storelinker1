import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp as RevenueIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  People as CustomersIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

export default function VendorHome() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch('http://localhost:5000/api/vendor/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('http://localhost:5000/api/vendor/orders/recent', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      const [statsData, ordersData] = await Promise.all([
        statsResponse.json(),
        ordersResponse.json(),
      ]);

      if (statsResponse.ok && ordersResponse.ok) {
        setStats(statsData);
        setRecentOrders(ordersData);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        {error}
      </Typography>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.revenue.toLocaleString()}`,
      icon: <RevenueIcon sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
    },
    {
      title: 'Total Orders',
      value: stats?.orders,
      icon: <OrdersIcon sx={{ fontSize: 40 }} />,
      color: '#2196F3',
    },
    {
      title: 'Products',
      value: stats?.products,
      icon: <ProductsIcon sx={{ fontSize: 40 }} />,
      color: '#FF9800',
    },
    {
      title: 'Customers',
      value: stats?.customers,
      icon: <CustomersIcon sx={{ fontSize: 40 }} />,
      color: '#9C27B0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: `${stat.color}15`,
                      p: 1,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { color: stat.color } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Products</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 