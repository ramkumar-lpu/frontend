
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load components
const Login = lazy(() => import('./components/Login'));
const Profile = lazy(() => import('./components/Profile'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const Designer = lazy(() => import('./components/Designer'));
const Cart = lazy(() => import('./components/Cart'));
const Contact = lazy(() => import('./components/Contact'));
const OTPVerification = lazy(() => import('./components/OTPVerification'));
const Privacy = lazy(() => import('./components/PrivacyPolicy'));
const Terms = lazy(() => import('./components/TermsOfService'));
const MyDesigns = lazy(() => import('./components/my-designs'));
const Suggestions = lazy(() => import('./components/Suggestions'));
// Loading spinner for routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Main Routes component
const AppRoutes = ({ user, onLoginSuccess, updateUser }) => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/profile" replace />
            ) : (
              <Login onLoginSuccess={onLoginSuccess} />
            )
          }
        />
      
        
        <Route
          path="/otp-verification"
          element={
            user ? (
              <Navigate to="/profile" replace />
            ) : (
              <OTPVerification />
            )
          }
        />
        
        <Route
          path="/profile"
          element={
            user ? (
              <Profile user={user} updateUser={updateUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/designer"
          element={
            user ? (
              <Designer user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/my-designs"
          element={
            user ? (
              <MyDesigns user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/suggestions"
          element={
            user ? (
              <Suggestions user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/cart"
          element={
            user ? (
              <Cart user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Public routes */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;