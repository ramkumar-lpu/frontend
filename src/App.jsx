
import { useState, useEffect } from 'react';
// Remove BrowserRouter import from here
import axios from 'axios';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes'; // Make sure this is your routes file
import Footer from './components/Footer'; // If you have a Footer component
import './App.css';

// Loading spinner for initial auth check
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Configure axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/user');

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  if (!authChecked) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <CartProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Navbar user={user} onLogout={handleLogout} />
          <div className="pt-16">
            <AppRoutes 
              user={user} 
              onLoginSuccess={handleLoginSuccess} 
              updateUser={updateUser} 
            />
          </div>
          <Footer />
        </div>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;