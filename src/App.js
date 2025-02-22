import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Layouts
import Navbar from './components/layout/Navbar';

// Pages
import Home from './pages/Home';
import VendorDashboard from './pages/vendor/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/customer/Profile';
import Orders from './pages/customer/Orders';
import Compare from './pages/customer/Compare';
import Cart from './pages/customer/Cart';
import Offers from './pages/customer/Offers';
import CategoryProducts from '../src/pages/CategoryProducts';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#8B5CF6',
      dark: '#7C3AED',
    },
    background: {
      default: '#F9FAFB',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect vendors to their dashboard, customers to home
    return <Navigate to={user.role === 'vendor' ? '/vendor/dashboard' : '/'} />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/category/:category" element={<CategoryProducts />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/compare" element={<Compare />} />

            {/* Customer Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Cart />
                </ProtectedRoute>
              }
            />

            {/* Vendor Routes */}
            <Route
              path="/vendor/*"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 