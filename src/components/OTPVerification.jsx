import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const inputRefs = useRef(Array(6).fill(null));
  const timerRef = useRef(null);
  const timeoutRefsRef = useRef(new Set());

  // Memoize loading state
  const loading = useMemo(() => isVerifying || isResending, [isVerifying, isResending]);

  // Safe timeout wrapper
  const createTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      timeoutRefsRef.current.delete(timeoutId);
      callback();
    }, delay);
    
    timeoutRefsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Cleanup all timeouts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timeoutRefsRef.current.forEach(id => clearTimeout(id));
      timeoutRefsRef.current.clear();
    };
  }, []);

  // Initialize component
  useEffect(() => {
    // Get email from sessionStorage (more secure than localStorage)
    const storedEmail = sessionStorage.getItem('pendingVerificationEmail');
    const storedTimestamp = sessionStorage.getItem('otpSentTimestamp');

    const emailFromState = location.state?.email;
    const finalEmail = emailFromState || storedEmail;

    if (!finalEmail) {
      navigate('/login', {
        replace: true,
        state: {
          message: 'Please register first to verify your email.',
          type: 'error'
        }
      });
      return;
    }

    setEmail(finalEmail);

    // Check registration success
    if (location.state?.registrationSuccess || location.state?.message?.includes('success')) {
      setRegistrationSuccess(true);
    }

    // Calculate remaining time
    if (storedTimestamp) {
      const timeElapsed = Date.now() - parseInt(storedTimestamp, 10);
      const remainingTime = Math.max(0, 600 - Math.floor(timeElapsed / 1000));

      if (remainingTime > 0) {
        setCountdown(remainingTime);
        setCanResend(false);
      } else {
        setCanResend(true);
      }
    } else {
      setCanResend(true);
    }

    // Focus first input
    createTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);

  }, [location, navigate, createTimeout]);

  // Countdown timer with useRef
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [countdown]);

  // Memoized time formatter
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Optimized OTP change handler
  const handleOtpChange = useCallback((index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    setOtp(prev => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });

    // Auto-focus next input
    if (value && index < 5) {
      createTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
  }, [createTimeout]);

  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      createTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 10);
    }
  }, [otp, createTimeout]);

  // Optimized paste handler
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);

    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus on last filled input
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    createTimeout(() => {
      inputRefs.current[lastFilledIndex]?.focus();
    }, 10);
  }, [createTimeout]);

  // ✅ FIXED: Optimized verify handler with window.location.href
  const handleVerify = useCallback(async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid 6-digit OTP'
      });
      return;
    }

    setIsVerifying(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/auth/verify-registration-otp', {
        email,
        otp: otpValue
      }, {
        withCredentials: true,
        timeout: 10000
      });

      if (response.data.success) {
        // Clear OTP data from sessionStorage
        sessionStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('otpSentTimestamp');

        // Store success message for flash notification
        sessionStorage.setItem('flashMessage', JSON.stringify({
          type: 'success',
          text: response.data.message || 'Email verified successfully!'
        }));

        // Show success message
        setMessage({
          type: 'success',
          text: 'Email verified! Redirecting to your profile...'
        });

        // ✅ Use window.location.href for full reload to ensure session sync
        const redirectTo = response.data.redirectTo || '/profile';
        
        createTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);

      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'OTP verification failed.'
        });
        setIsVerifying(false);
      }
    } catch (error) {
      let errorMessage = 'OTP verification failed. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });

      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      createTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 10);
      setIsVerifying(false);
    }
  }, [otp, email, createTimeout]);

  // Optimized resend handler
  const handleResend = useCallback(async () => {
    if (!canResend) return;

    setIsResending(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/auth/resend-registration-otp', {
        email
      }, {
        withCredentials: true,
        timeout: 10000
      });

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: response.data.message || 'Verification code sent to your email!'
        });

        // Start countdown
        setCountdown(600);
        setCanResend(false);

        // Clear OTP fields
        setOtp(['', '', '', '', '', '']);

        // Store timestamp
        sessionStorage.setItem('otpSentTimestamp', Date.now().toString());

        // Focus on first input
        createTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);

      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Failed to send verification code.'
        });
        setCanResend(true);
      }
    } catch (error) {
      let errorMessage = 'Failed to send verification code. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many resend attempts. Please wait before trying again.';
      }

      setMessage({
        type: 'error',
        text: errorMessage
      });
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  }, [canResend, email, createTimeout]);

  // Start over handler
  const handleStartOver = useCallback(() => {
    sessionStorage.removeItem('pendingVerificationEmail');
    sessionStorage.removeItem('otpSentTimestamp');
    navigate('/login', {
      replace: true,
      state: {
        message: 'Please register again to receive a new verification code.',
        type: 'info'
      }
    });
  }, [navigate]);

  // Memoize OTP complete state
  const isOtpComplete = useMemo(() => otp.join('').length === 6, [otp]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8">
        {/* Header */}
        <OTPHeader
          countdown={countdown}
          formatTime={formatTime}
          onStartOver={handleStartOver}
        />

        {/* Title Section */}
        <TitleSection
          registrationSuccess={registrationSuccess}
          email={email}
          countdown={countdown}
          canResend={canResend}
          formatTime={formatTime}
        />

        {/* Message Display */}
        <MessageDisplay message={message} />

        {/* OTP Input Form */}
        <OTPForm
          otp={otp}
          inputRefs={inputRefs}
          loading={loading}
          isVerifying={isVerifying}
          isOtpComplete={isOtpComplete}
          onOtpChange={handleOtpChange}
          onOtpKeyDown={handleOtpKeyDown}
          onPaste={handlePaste}
          onSubmit={handleVerify}
        />

        {/* Resend Button */}
        <ResendButton
          canResend={canResend}
          loading={loading}
          isResending={isResending}
          countdown={countdown}
          formatTime={formatTime}
          onResend={handleResend}
        />

        {/* Footer */}
        <OTPFooter onStartOver={handleStartOver} />
      </div>
    </div>
  );
};

// OTP Header Component
const OTPHeader = React.memo(({ countdown, formatTime, onStartOver }) => (
  <div className="flex items-center justify-between mb-6">
    <Link
      to="/login"
      onClick={onStartOver}
      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      Back to Login
    </Link>
    {countdown > 0 && (
      <div className="text-xs text-gray-500 flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        Expires in {formatTime(countdown)}
      </div>
    )}
  </div>
));

OTPHeader.displayName = 'OTPHeader';

// Title Section Component
const TitleSection = React.memo(({
  registrationSuccess,
  email,
  countdown,
  canResend,
  formatTime
}) => (
  <div className="text-center mb-8">
    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
      {registrationSuccess ? (
        <CheckCircle className="w-8 h-8 text-white" />
      ) : (
        <Mail className="w-8 h-8 text-white" />
      )}
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
      Check Your Email
    </h2>
    <p className="text-gray-600 mb-2">
      Registration successful! We sent a 6-digit code to:
    </p>
    <p className="font-medium text-gray-800 text-lg mb-4 break-all bg-gray-50 p-2 rounded">
      {email || 'Loading...'}
    </p>

    {countdown > 0 ? (
      <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
        <Clock className="w-4 h-4 mr-1" />
        <span>Code expires in {formatTime(countdown)}</span>
      </div>
    ) : (
      <div className="text-sm text-blue-600 mb-2">
        {canResend ? 'Click below to receive your verification code' : 'Code has expired'}
      </div>
    )}
  </div>
));

TitleSection.displayName = 'TitleSection';

// Message Display Component
const MessageDisplay = React.memo(({ message }) => {
  if (!message.text) return null;

  return (
    <div className={`mb-6 p-4 rounded-lg ${
      message.type === 'success'
        ? 'bg-green-50 text-green-800 border border-green-200'
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      <div className="flex items-start">
        <AlertCircle className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
          message.type === 'success' ? 'text-green-600' : 'text-red-600'
        }`} />
        <span>{message.text}</span>
      </div>
    </div>
  );
});

MessageDisplay.displayName = 'MessageDisplay';

// OTP Form Component
const OTPForm = React.memo(({
  otp,
  inputRefs,
  loading,
  isVerifying,
  isOtpComplete,
  onOtpChange,
  onOtpKeyDown,
  onPaste,
  onSubmit
}) => (
  <form onSubmit={onSubmit} className="mb-6">
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Enter 6-digit code
      </label>
      <div
        className="flex justify-between gap-2 mb-2"
        onPaste={onPaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => inputRefs.current[index] = el}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => onOtpChange(index, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(index, e)}
            className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            inputMode="numeric"
            disabled={loading}
            placeholder="•"
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label={`OTP digit ${index + 1} of 6`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Tip: You can paste the code (Ctrl+V)
      </p>
    </div>

    <button
      type="submit"
      disabled={loading || !isOtpComplete}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isVerifying ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verifying...
        </span>
      ) : (
        'Verify & Continue'
      )}
    </button>
  </form>
));

OTPForm.displayName = 'OTPForm';

// Resend Button Component
const ResendButton = React.memo(({
  canResend,
  loading,
  isResending,
  countdown,
  formatTime,
  onResend
}) => (
  <div className="text-center mb-6">
    <button
      type="button"
      onClick={onResend}
      disabled={!canResend || loading}
      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
        canResend
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
      }`}
    >
      {isResending ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Sending...
        </span>
      ) : canResend ? (
        'Send Verification Code'
      ) : (
        `Resend code in ${formatTime(countdown)}`
      )}
    </button>
  </div>
));

ResendButton.displayName = 'ResendButton';

// OTP Footer Component
const OTPFooter = React.memo(({ onStartOver }) => (
  <div className="pt-6 border-t border-gray-200">
    <div className="space-y-3">
      <p className="text-gray-600 text-sm">
        <span className="font-medium">Didn't receive the email?</span> Check your spam folder or try a different email.
      </p>
      <div className="text-center">
        <button
          onClick={onStartOver}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          Try with a different email
        </button>
      </div>
    </div>
  </div>
));

OTPFooter.displayName = 'OTPFooter';

export default React.memo(OTPVerification);