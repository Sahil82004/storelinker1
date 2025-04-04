import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import TabletIcon from '@mui/icons-material/Tablet';
import { useAuth } from '../../context/AuthContext';
import { getCustomerSessions, logoutFromAllDevices } from '../../services/customerService';

export default function Profile() {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [logoutAllDialogOpen, setLogoutAllDialogOpen] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  useEffect(() => {
    // Fetch user history and sessions
    const fetchUserData = async () => {
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
        console.error('Failed to fetch user history:', err);
      }
      
      // Fetch active sessions
      fetchSessions();
    };

    fetchUserData();
  }, [success]); // Refetch when profile is updated successfully
  
  // Function to fetch active sessions
  const fetchSessions = async () => {
    setSessionLoading(true);
    try {
      const activeSessions = await getCustomerSessions();
      setSessions(activeSessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };
  
  // Handle logout from all devices
  const handleLogoutAllDevices = async () => {
    try {
      await logoutFromAllDevices();
      // Redirect to login page after successful logout
      logout();
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
    return user?.currentSessionId === sessionId;
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mr: 3,
              bgcolor: 'primary.main',
              fontSize: '2.5rem',
            }}
          >
            {formData.name[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1">
              Profile Settings
            </Typography>
          </Box>
          <Tooltip title="Logout from all devices">
            <IconButton 
              color="error" 
              onClick={() => setLogoutAllDialogOpen(true)}
              sx={{ ml: 2 }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {/* Active Sessions Accordion */}
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
        
        {/* Profile History Accordion */}
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
                              <Typography component="span" variant="body2" sx={{ display: 'block' }}>
                                Name: {entry.name}
                              </Typography>
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
    </Container>
  );
} 