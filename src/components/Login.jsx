
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Separate form states for better performance
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Memoize validation regexes
  const EMAIL_REGEX = useMemo(() => /^\S+@\S+\.\S+$/, []);
  const PASSWORD_MIN_LENGTH = 6;

  // Memoize validation functions
  const validateLoginForm = useCallback(() => {
    const newErrors = {};
    if (!loginForm.email.trim()) newErrors.email = 'Email is required';
    if (!loginForm.password) newErrors.password = 'Password is required';
    if (loginForm.email && !EMAIL_REGEX.test(loginForm.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    return newErrors;
  }, [loginForm, EMAIL_REGEX]);

  const validateSignupForm = useCallback(() => {
    const newErrors = {};
    if (!signupForm.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!signupForm.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!signupForm.email.trim()) newErrors.email = 'Email is required';
    if (!signupForm.password) newErrors.password = 'Password is required';
    if (!signupForm.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    
    if (signupForm.password && signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (signupForm.password && signupForm.password.length < PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }

    if (signupForm.email && !EMAIL_REGEX.test(signupForm.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    return newErrors;
  }, [signupForm, EMAIL_REGEX]);

  // Optimized tab change - no need to reset email
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setErrors({});
  }, []);

  // Login and signup handlers don't reset form
  const handleLoginChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSignupChange = useCallback((e) => {
    const { name, value } = e.target;
    setSignupForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Memoized login handler
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    
    const newErrors = validateLoginForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post('/api/auth/login', {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        onLoginSuccess?.(response.data.user);
        navigate('/profile');
      } else {
        setErrors({ form: response.data.message || 'Login failed' });
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 423) {
        errorMessage = 'Account is temporarily locked. Try again later or reset your password.';
      }
      
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [loginForm, validateLoginForm, navigate, onLoginSuccess]);

  // Memoized signup handler
  const handleSignup = useCallback(async (e) => {
    e.preventDefault();
    
    const newErrors = validateSignupForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post('/api/auth/register', {
        firstName: signupForm.firstName.trim(),
        lastName: signupForm.lastName.trim(),
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        const normalizedEmail = signupForm.email.trim().toLowerCase();
        
        // Use sessionStorage instead of localStorage (more secure)
        sessionStorage.setItem('pendingVerificationEmail', normalizedEmail);
        sessionStorage.setItem('otpSentTimestamp', Date.now().toString());
        
        navigate('/otp-verification', {
          replace: true,
          state: {
            email: normalizedEmail,
            registrationSuccess: true,
            message: 'Registration successful! Please verify your email.'
          }
        });
      } else {
        setErrors({ form: response.data.message || 'Registration failed' });
      }
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (error.response.data.accountType === 'google') {
          errorMessage = 'Account exists with Google. Please use Google login.';
        }
      } else if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
        errorMessage = 'Email already registered. Try logging in instead.';
      }
      
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [signupForm, validateSignupForm, navigate]);

  const handleGoogleLogin = useCallback(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  }, []);

  const toggleForgotPassword = useCallback(() => {
    setShowForgotPassword(prev => !prev);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8">
          
          {/* Left side - Hero/Features */}
          <AuthHeroSection />
          
          {/* Right side - Auth Form */}
          <AuthFormSection
            activeTab={activeTab}
            isLoading={isLoading}
            errors={errors}
            loginForm={loginForm}
            signupForm={signupForm}
            onTabChange={handleTabChange}
            onLoginChange={handleLoginChange}
            onSignupChange={handleSignupChange}
            onLoginSubmit={handleLogin}
            onSignupSubmit={handleSignup}
            onGoogleLogin={handleGoogleLogin}
            onForgotPassword={toggleForgotPassword}
          />
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal onClose={toggleForgotPassword} />
      )}
    </>
  );
};

// Extracted Hero Section Component
const AuthHeroSection = React.memo(() => (
  <div className="hidden lg:block bg-white rounded-2xl shadow-xl p-8">
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        SHOECRAFTIFY
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Design custom shoes with our intuitive 3D editor
      </p>
    </div>

    <div className="space-y-6">
      <FeatureItem emoji="👟" title="3D Design Studio" desc="Create shoes from scratch with our advanced editor" />
      <FeatureItem emoji="🎨" title="Unlimited Customization" desc="Colors, patterns, materials and textures" />
      <FeatureItem emoji="⚡" title="Real-Time Preview" desc="See your designs come to life instantly" />

      <div className="bg-blue-50 rounded-xl p-4 mt-8">
        <div className="flex items-center text-blue-800">
          <CheckIcon />
          <span className="text-sm">No credit card required • Start designing now</span>
        </div>
      </div>
    </div>
  </div>
));

AuthHeroSection.displayName = 'AuthHeroSection';

// Feature Item Component
const FeatureItem = React.memo(({ emoji, title, desc }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl mr-4">
      {emoji}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  </div>
));

FeatureItem.displayName = 'FeatureItem';

// Check Icon Component
const CheckIcon = React.memo(() => (
  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
));

CheckIcon.displayName = 'CheckIcon';

// Auth Form Section
const AuthFormSection = React.memo(({
  activeTab,
  isLoading,
  errors,
  loginForm,
  signupForm,
  onTabChange,
  onLoginChange,
  onSignupChange,
  onLoginSubmit,
  onSignupSubmit,
  onGoogleLogin,
  onForgotPassword
}) => (
  <div className="bg-white rounded-2xl shadow-xl p-8">
    <AuthHeader activeTab={activeTab} />

    <AuthTabs activeTab={activeTab} onTabChange={onTabChange} />

    {/* Form Content */}
    {activeTab === 'login' ? (
      <LoginFormContent
        form={loginForm}
        errors={errors}
        isLoading={isLoading}
        onChange={onLoginChange}
        onSubmit={onLoginSubmit}
        onForgotPassword={onForgotPassword}
      />
    ) : (
      <SignupFormContent
        form={signupForm}
        errors={errors}
        isLoading={isLoading}
        onChange={onSignupChange}
        onSubmit={onSignupSubmit}
      />
    )}

    {/* Divider */}
    <Divider />

    {/* Google Button */}
    <GoogleLoginButton onClick={onGoogleLogin} disabled={isLoading} />

    {/* Terms */}
    <TermsFooter />
  </div>
));

AuthFormSection.displayName = 'AuthFormSection';

// Auth Header
const AuthHeader = React.memo(({ activeTab }) => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
      <span className="text-2xl text-white">👟</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
      {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
    </h2>
    <p className="text-gray-600">
      {activeTab === 'login' 
        ? 'Sign in to continue designing' 
        : 'Join our community of shoe designers'
      }
    </p>
  </div>
));

AuthHeader.displayName = 'AuthHeader';

// Auth Tabs
const AuthTabs = React.memo(({ activeTab, onTabChange }) => (
  <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
    <TabButton active={activeTab === 'login'} onClick={() => onTabChange('login')}>
      Login
    </TabButton>
    <TabButton active={activeTab === 'signup'} onClick={() => onTabChange('signup')}>
      Sign Up
    </TabButton>
  </div>
));

AuthTabs.displayName = 'AuthTabs';

// Tab Button
const TabButton = React.memo(({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 rounded-md font-medium transition-colors ${
      active
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
));

TabButton.displayName = 'TabButton';

// Login Form Content
const LoginFormContent = React.memo(({
  form,
  errors,
  isLoading,
  onChange,
  onSubmit,
  onForgotPassword
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <FormInput
      label="Email Address"
      type="email"
      name="email"
      value={form.email}
      onChange={onChange}
      error={errors.email}
      placeholder="you@example.com"
      autoComplete="email"
    />

    <FormInput
      label="Password"
      type="password"
      name="password"
      value={form.password}
      onChange={onChange}
      error={errors.password}
      placeholder="Enter your password"
      autoComplete="current-password"
    />

    <div className="text-right">
      <button
        type="button"
        onClick={onForgotPassword}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        Forgot Password?
      </button>
    </div>

    <ErrorMessage message={errors.form} />

    <SubmitButton isLoading={isLoading} disabled={isLoading}>
      {isLoading ? 'Signing in...' : 'Sign In'}
    </SubmitButton>
  </form>
));

LoginFormContent.displayName = 'LoginFormContent';

// Signup Form Content
const SignupFormContent = React.memo(({
  form,
  errors,
  isLoading,
  onChange,
  onSubmit
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <FormInput
        label="First Name"
        type="text"
        name="firstName"
        value={form.firstName}
        onChange={onChange}
        error={errors.firstName}
        placeholder="first name"
      />
      <FormInput
        label="Last Name"
        type="text"
        name="lastName"
        value={form.lastName}
        onChange={onChange}
        error={errors.lastName}
        placeholder="last name"
      />
    </div>

    <FormInput
      label="Email Address"
      type="email"
      name="email"
      value={form.email}
      onChange={onChange}
      error={errors.email}
      placeholder="you@example.com"
      autoComplete="email"
    />

    <FormInput
      label="Password"
      type="password"
      name="password"
      value={form.password}
      onChange={onChange}
      error={errors.password}
      placeholder="Enter your password"
      autoComplete="new-password"
    />

    <FormInput
      label="Confirm Password"
      type="password"
      name="confirmPassword"
      value={form.confirmPassword}
      onChange={onChange}
      error={errors.confirmPassword}
      placeholder="Confirm your password"
      autoComplete="new-password"
    />

    <ErrorMessage message={errors.form} />

    <SubmitButton isLoading={isLoading} disabled={isLoading}>
      {isLoading ? 'Creating account...' : 'Create Account'}
    </SubmitButton>
  </form>
));

SignupFormContent.displayName = 'SignupFormContent';

// Form Input Component
const FormInput = React.memo(({
  label,
  type,
  name,
  value,
  onChange,
  error,
  placeholder,
  autoComplete
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 rounded-lg border transition-colors ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
      } focus:ring-2 focus:border-transparent`}
      placeholder={placeholder}
      autoComplete={autoComplete}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
));

FormInput.displayName = 'FormInput';

// Error Message Component
const ErrorMessage = React.memo(({ message }) => {
  if (!message) return null;
  
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600 text-sm text-center">{message}</p>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

// Submit Button
const SubmitButton = React.memo(({ isLoading, disabled, children }) => (
  <button
    type="submit"
    disabled={disabled}
    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
  >
    {isLoading ? (
      <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {children}
      </span>
    ) : (
      children
    )}
  </button>
));

SubmitButton.displayName = 'SubmitButton';

// Divider Component
const Divider = React.memo(() => (
  <div className="my-6 flex items-center">
    <div className="flex-grow border-t border-gray-300" />
    <span className="mx-4 text-gray-500 text-sm">Or continue with</span>
    <div className="flex-grow border-t border-gray-300" />
  </div>
));

Divider.displayName = 'Divider';

// Google Login Button
const GoogleLoginButton = React.memo(({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow"
  >
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
    Continue with Google
  </button>
));

GoogleLoginButton.displayName = 'GoogleLoginButton';

// Terms Footer
const TermsFooter = React.memo(() => (
  <div className="mt-8 pt-6 border-t border-gray-200">
    <p className="text-gray-500 text-xs text-center">
      By continuing, you agree to our{' '}
      <a href="#" className="text-blue-600 hover:text-blue-800">
        Terms of Service
      </a>{' '}
      and{' '}
      <a href="#" className="text-blue-600 hover:text-blue-800">
        Privacy Policy
      </a>
    </p>
  </div>
));

TermsFooter.displayName = 'TermsFooter';

export default React.memo(Login);