import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';

// Memoize regex patterns to prevent recreation
const DIGIT_REGEX = /^\d*$/;
const SINGLE_DIGIT_REGEX = /^\d$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resetToken, setResetToken] = useState('');
  
  const timerRef = useRef(null);
  const timeoutRefsRef = useRef(new Set()); // Track all timeouts
  const otpInputRefs = useRef(Array(6).fill(null));

  // Memoize password validation - computed once per password change
  const passwordValidation = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    matches: newPassword === confirmPassword && confirmPassword !== ''
  }), [newPassword, confirmPassword]);

  const isPasswordValid = useMemo(() => 
    passwordValidation.minLength && 
    passwordValidation.hasUppercase && 
    passwordValidation.hasNumber && 
    passwordValidation.matches,
    [passwordValidation]
  );

  // Memoize email validation
  const isEmailValid = useMemo(() => 
    email.trim() !== '' && EMAIL_REGEX.test(email.trim()),
    [email]
  );

  // Optimized timer with useRef - prevents re-renders during countdown
  const startTimer = useCallback(() => {
    setTimer(60);
    setResendAvailable(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setResendAvailable(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Safe timeout wrapper with cleanup
  const createTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      timeoutRefsRef.current.delete(timeoutId);
      callback();
    }, delay);
    
    timeoutRefsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Cleanup all timers and timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timeoutRefsRef.current.forEach(id => clearTimeout(id));
      timeoutRefsRef.current.clear();
    };
  }, []);

  // Optimized OTP change handler - no factory pattern
  const handleOtpChange = useCallback((index, value) => {
    // Early return if invalid
    if (value.length > 1 || !DIGIT_REGEX.test(value)) return;
    
    setOtp(prev => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });
    
    // Auto-focus next input
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index, e) => {
    // Backspace: focus previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }
    
    // Allow only numbers and navigation keys
    if (e.key.length === 1 && !SINGLE_DIGIT_REGEX.test(e.key)) {
      e.preventDefault();
    }
  }, [otp]);

  // Memoized API handlers - no processing state needed
  const handleRequestOTP = useCallback(async () => {
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/auth/forgot-password', { 
        email: email.trim().toLowerCase() 
      });
      
      if (response.data.success) {
        setStep(2);
        startTimer();
        setSuccess('OTP sent to your email');
        createTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isEmailValid, email, startTimer, createTimeout]);

  const handleVerifyOtp = useCallback(async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/auth/verify-reset-otp', {
        email: email.trim().toLowerCase(),
        otp: otpString
      });
      
      if (response.data.success) {
        if (response.data.resetToken) {
          setResetToken(response.data.resetToken);
        }
        
        setStep(3);
        setSuccess('OTP verified successfully');
        createTimeout(() => setSuccess(''), 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [otp, email, createTimeout]);

  const handleResetPassword = useCallback(async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/auth/reset-password', {
        email: email.trim().toLowerCase(),
        resetToken: resetToken,
        password: newPassword
      });
      
      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting...');
        createTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, isPasswordValid, email, resetToken, onClose, createTimeout]);

  const handleResendOtp = useCallback(async () => {
    if (!resendAvailable || isLoading) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/auth/forgot-password', { 
        email: email.trim().toLowerCase() 
      });
      
      if (response.data.success) {
        startTimer();
        setSuccess('New OTP sent to your email');
        createTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to resend OTP';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [resendAvailable, isLoading, email, startTimer, createTimeout]);

  const handleBackToStep1 = useCallback(() => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccess('');
  }, []);

  const handleBackToStep2 = useCallback(() => {
    setStep(2);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  }, []);

  // Close modal handlers
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 sm:mx-6 md:mx-auto overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <ModalHeader step={step} onClose={onClose} />

          {/* Status Messages */}
          <StatusMessages success={success} error={error} />

          {/* Step Content */}
          {step === 1 && (
            <Step1EmailInput
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              isEmailValid={isEmailValid}
              handleRequestOTP={handleRequestOTP}
            />
          )}

          {step === 2 && (
            <Step2OTPVerification
              email={email}
              otp={otp}
              otpInputRefs={otpInputRefs}
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              timer={timer}
              resendAvailable={resendAvailable}
              handleResendOtp={handleResendOtp}
              isLoading={isLoading}
              handleBackToStep1={handleBackToStep1}
              handleVerifyOtp={handleVerifyOtp}
            />
          )}

          {step === 3 && (
            <Step3NewPassword
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordValidation={passwordValidation}
              isLoading={isLoading}
              isPasswordValid={isPasswordValid}
              handleBackToStep2={handleBackToStep2}
              handleResetPassword={handleResetPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Modal Header Component
const ModalHeader = React.memo(({ step, onClose }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-gray-900">
      {step === 1 && 'Forgot Password'}
      {step === 2 && 'Verify OTP'}
      {step === 3 && 'Reset Password'}
    </h2>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Close modal"
    >
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
));

ModalHeader.displayName = 'ModalHeader';

// Status Messages Component
const StatusMessages = React.memo(({ success, error }) => (
  <>
    {success && (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-600 text-sm text-center font-medium">{success}</p>
      </div>
    )}

    {error && (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm text-center font-medium">{error}</p>
      </div>
    )}
  </>
));

StatusMessages.displayName = 'StatusMessages';

// Step 1: Email Input Component
const Step1EmailInput = React.memo(({ email, setEmail, isLoading, isEmailValid, handleRequestOTP }) => (
  <div className="space-y-4">
    <p className="text-gray-600 text-sm">
      Enter your email address and we'll send you a 6-digit OTP to reset your password.
    </p>
    
    <div>
      <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">
        Email Address
      </label>
      <input
        id="email-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border transition-colors ${
          email && !isEmailValid 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        } focus:ring-2 focus:border-transparent`}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      {email && !isEmailValid && (
        <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
      )}
    </div>

    <p className="text-gray-500 text-xs">
      We will send a 6-digit OTP to your email. It expires in 10 minutes.
    </p>

    <LoadingButton
      onClick={handleRequestOTP}
      isLoading={isLoading}
      disabled={!isEmailValid || isLoading}
      loadingText="Sending OTP..."
      defaultText="Send OTP"
    />
  </div>
));

Step1EmailInput.displayName = 'Step1EmailInput';

// Step 2: OTP Verification Component
const Step2OTPVerification = React.memo(({ 
  email, 
  otp, 
  otpInputRefs, 
  handleOtpChange,
  handleOtpKeyDown,
  timer, 
  resendAvailable, 
  handleResendOtp, 
  isLoading,
  handleBackToStep1,
  handleVerifyOtp
}) => {
  const isOtpComplete = otp.join('').length === 6;

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Enter the 6-digit OTP sent to <span className="font-semibold text-gray-900 break-all">{email}</span>
      </p>
      
      <div className="flex justify-center space-x-1 sm:space-x-2 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => otpInputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            aria-label={`OTP digit ${index + 1} of 6`}
            pattern="[0-9]*"
            autoComplete="one-time-code"
          />
        ))}
      </div>

      <div className="text-center">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend OTP in <span className="font-semibold">{timer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResendOtp}
            disabled={!resendAvailable || isLoading}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Resend OTP
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          onClick={handleBackToStep1}
          className="w-full sm:flex-1 py-2 sm:py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Go back to email step"
        >
          Back
        </button>
        <button
          onClick={handleVerifyOtp}
          disabled={isLoading || !isOtpComplete}
          className="w-full sm:flex-1 py-2 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
});

Step2OTPVerification.displayName = 'Step2OTPVerification';

// Step 3: New Password Component
const Step3NewPassword = React.memo(({ 
  newPassword, 
  setNewPassword, 
  confirmPassword, 
  setConfirmPassword, 
  passwordValidation,
  isLoading,
  isPasswordValid,
  handleBackToStep2,
  handleResetPassword
}) => (
  <div className="space-y-4">
    <p className="text-gray-600 text-sm">
      Create your new strong password
    </p>
    
    <div>
      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
        New Password
      </label>
      <input
        id="new-password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        placeholder="Enter new password"
        autoComplete="new-password"
        required
      />
      <PasswordRequirements validation={passwordValidation} />
    </div>

    <div>
      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
        Confirm Password
      </label>
      <input
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border transition-colors ${
          confirmPassword && !passwordValidation.matches
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        } focus:ring-2 focus:border-transparent`}
        placeholder="Confirm new password"
        autoComplete="new-password"
        required
      />
      {confirmPassword && !passwordValidation.matches && (
        <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
      )}
    </div>

    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
      <button
        onClick={handleBackToStep2}
        className="w-full sm:flex-1 py-2 sm:py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Go back to OTP verification"
      >
        Back
      </button>
      <button
        onClick={handleResetPassword}
        disabled={isLoading || !isPasswordValid}
        className="w-full sm:flex-1 py-2 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </button>
    </div>
  </div>
));

Step3NewPassword.displayName = 'Step3NewPassword';

// Password Requirements Component
const PasswordRequirements = React.memo(({ validation }) => (
  <div className="mt-2 space-y-1">
    <p className={`text-xs flex items-center ${validation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
      <span className="mr-2">{validation.minLength ? '✓' : '○'}</span>
      At least 8 characters
    </p>
    <p className={`text-xs flex items-center ${validation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
      <span className="mr-2">{validation.hasUppercase ? '✓' : '○'}</span>
      Contains uppercase letter
    </p>
    <p className={`text-xs flex items-center ${validation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
      <span className="mr-2">{validation.hasNumber ? '✓' : '○'}</span>
      Contains number
    </p>
  </div>
));

PasswordRequirements.displayName = 'PasswordRequirements';

// Loading Button Component
const LoadingButton = React.memo(({ onClick, isLoading, disabled, loadingText, defaultText }) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    className="w-full py-2 sm:py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
  >
    {isLoading ? (
      <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {loadingText}
      </span>
    ) : (
      defaultText
    )}
  </button>
));

LoadingButton.displayName = 'LoadingButton';

export default React.memo(ForgotPasswordModal);