
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy load helper with retry logic
const lazyLoadComponent = (importFunc) => {
  return lazy(() =>
    importFunc().catch(() => {
      console.error('Failed to load chunk, reloading...');
      return importFunc();
    })
  );
};

// Lazy load components with retry
const Login = lazyLoadComponent(() => import('./components/Login'));
const Profile = lazyLoadComponent(() => import('./components/Profile'));
const LandingPage = lazyLoadComponent(() => import('./components/LandingPage'));
const Designer = lazyLoadComponent(() => import('./components/Designer'));
const Cart = lazyLoadComponent(() => import('./components/Cart'));
const Contact = lazyLoadComponent(() => import('./components/Contact'));
const OTPVerification = lazyLoadComponent(() => import('./components/OTPVerification'));
const Privacy = lazyLoadComponent(() => import('./components/PrivacyPolicy'));
const Terms = lazyLoadComponent(() => import('./components/TermsOfService'));
const MyDesigns = lazyLoadComponent(() => import('./components/my-designs'));
const Suggestions = lazyLoadComponent(() => import('./components/Suggestions'));

// Loading spinner for routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Error fallback for Suspense
const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">Failed to load this page</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Reload Page
      </button>
    </div>
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