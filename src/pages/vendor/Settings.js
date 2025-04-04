import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TabletIcon from '@mui/icons-material/Tablet';
import { getVendorSessions, logoutFromAllDevices } from '../../services/vendorService';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [history, setHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [settings, setSettings] = useState({
    storeName: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notifyNewOrders: true,
    notifyLowStock: true,
    autoAcceptOrders: false,
    minStockAlert: 10,
    taxRate: 18,
  });

  useEffect(() => {
    fetchSettings();
    fetchHistory();
    fetchSessions();
  }, [success]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.history && userData.history.length > 0) {
          setHistory(userData.history);
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile history:', err);
    }
  };

  // Function to fetch active sessions
  const fetchSessions = async () => {
    setSessionLoading(true);
    try {
      const activeSessions = await getVendorSessions();
      setSessions(activeSessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/vendor/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setSettings({
          ...settings,
          storeName: userData.storeName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          name: userData.name || ''
        });
      }
    } catch (err) {
      setError('Failed to load settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    setSettings({ ...settings, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const profileData = {
        name: settings.name,
        storeName: settings.storeName,
        phone: settings.phone,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        zipCode: settings.zipCode
      };
      
      const response = await fetch('http://localhost:5000/api/auth/vendor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile settings updated successfully');
        // Other settings would be saved through a separate endpoint if needed
      } else {
        setError(data.message || data.error);
      }
    } catch (err) {
      setError('Failed to update settings');
    }
  };
  
  // Handle logout from all devices
  const handleLogoutAllDevices = async () => {
    try {
      await logoutFromAllDevices();
      // Redirect to login page after successful logout
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to logout from all devices. Please try again.');
    } finally {
      setLogoutAllDialogOpen(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get device icon based on user agent
  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <DevicesIcon />;
    
    userAgent = userAgent.toLowerCase();
    
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return <PhoneAndroidIcon />;
    } else if (userAgent.includes('ipad') || userAgent.includes('tablet')) {
      return <TabletIcon />;
    } else {
      return <ComputerIcon />;
    }
  };
  
  // Determine if a session is current
  const isCurrentSession = (sessionId) => {
    const currentSessionId = JSON.parse(sessionStorage.getItem('vendorInfo'))?.currentSessionId;
    return currentSessionId === sessionId;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Store Settings
        </Typography>
        <Tooltip title="Logout from all devices">
          <IconButton 
            color="error" 
            onClick={() => setLogoutAllDialogOpen(true)}
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Store Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Store Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Store Name"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={settings.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={settings.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={settings.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Zip Code"
                name="zipCode"
                value={settings.zipCode}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Notifications */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifyNewOrders}
                    onChange={handleChange}
                    name="notifyNewOrders"
                  />
                }
                label="Notify on new orders"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifyLowStock}
                    onChange={handleChange}
                    name="notifyLowStock"
                  />
                }
                label="Notify on low stock"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Order Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Order Settings
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoAcceptOrders}
                    onChange={handleChange}
                    name="autoAcceptOrders"
                  />
                }
                label="Auto-accept orders"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Stock Alert"
                name="minStockAlert"
                type="number"
                value={settings.minStockAlert}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                name="taxRate"
                type="number"
                value={settings.taxRate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                Save Settings
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {/* Security & Sessions Section */}
        <Box sx={{ mt: 4 }}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="sessions-content"
              id="sessions-header"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6">Active Sessions</Typography>
                <Chip 
                  label={sessions.length || 0} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {sessionLoading ? (
                <Typography variant="body1">Loading sessions...</Typography>
              ) : sessions.length === 0 ? (
                <Typography variant="body1">No active sessions found.</Typography>
              ) : (
                <List>
                  {sessions.map((session, index) => (
                    <React.Fragment key={session.sessionId}>
                      <ListItem alignItems="flex-start">
                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                          {getDeviceIcon(session.device)}
                        </Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isCurrentSession(session.sessionId) && (
                                <Chip 
                                  label="Current Session" 
                                  color="success" 
                                  size="small" 
                                  sx={{ mr: 1 }} 
                                />
                              )}
                              {`Device: ${session.device?.split('(')[0] || 'Unknown Device'}`}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                IP Address: {session.ipAddress || 'Unknown'}
                              </Typography>
                              <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                Login Time: {formatDate(session.timestamp)}
                              </Typography>
                              <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                Last Active: {formatDate(session.lastUpdated || session.timestamp)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < sessions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => setLogoutAllDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Logout from all devices
              </Button>
            </AccordionDetails>
          </Accordion>
        </Box>
        
        {/* Profile History Section */}
        {history.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="profile-history-content"
                id="profile-history-header"
              >
                <Typography variant="h6">Profile History</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {history.map((entry, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={`Profile as of ${formatDate(entry.modifiedAt)}`}
                          secondary={
                            <>
                              {entry.storeName && (
                                <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                  Store Name: {entry.storeName}
                                </Typography>
                              )}
                              {entry.name && (
                                <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                  Name: {entry.name}
                                </Typography>
                              )}
                              {entry.phone && (
                                <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                  Phone: {entry.phone}
                                </Typography>
                              )}
                              {entry.address && (
                                <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                  Address: {entry.address}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < history.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Paper>
      
      {/* Logout from all devices confirmation dialog */}
      <Dialog
        open={logoutAllDialogOpen}
        onClose={() => setLogoutAllDialogOpen(false)}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will log you out from all devices including this one. You'll need to log in again after this action. Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutAllDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLogoutAllDevices} color="error" variant="contained">
            Logout from all devices
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 