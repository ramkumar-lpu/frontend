// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import axios from 'axios';

// const Payment = ({ user, cartItems = [], onPaymentSuccess, onClose }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState(null);

//   // Calculate order total
//   const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//   const shipping = subtotal > 5000 ? 0 : 500;
//   const tax = subtotal * 0.18;
//   const total = Math.round(subtotal + shipping + tax);

//   // Load Razorpay Script
//   const loadRazorpay = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handlePayment = async () => {
//     setIsLoading(true);

//     const res = await loadRazorpay();

//     if (!res) {
//       alert('Razorpay SDK failed to load. Are you online?');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       // 1. Create Order on Backend
//       const orderResponse = await axios.post('/api/payment/create-order', {
//         amount: total
//       });

//       if (!orderResponse.data.success) {
//         throw new Error('Server error creating order');
//       }

//       const { order } = orderResponse.data;

//       // 2. Open Razorpay Checkout
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use env variable
//         amount: order.amount,
//         currency: order.currency,
//         name: "ShoeCraftify",
//         description: "Custom Shoe Order",
//         image: "https://via.placeholder.com/150", // You can add a logo here
//         order_id: order.id,
//         handler: async function (response) {
//           // 3. Verify Payment
//           try {
//             const verifyResponse = await axios.post('/api/payment/verify-payment', {
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature
//             });

//             if (verifyResponse.data.success) {
//               setPaymentStatus('success');
//               if (onPaymentSuccess) {
//                 onPaymentSuccess({
//                   orderId: response.razorpay_order_id,
//                   paymentId: response.razorpay_payment_id,
//                   amount: total,
//                   method: 'Razorpay'
//                 });
//               }
//             } else {
//               alert('Payment verification failed');
//             }
//           } catch (error) {
//             console.error('Verification Error:', error);
//             alert('Payment verification failed on server');
//           }
//         },
//         prefill: {
//           name: user?.name,
//           email: user?.email,
//           contact: "" // You can add user phone if available
//         },
//         theme: {
//           color: "#3399cc"
//         }
//       };

//       const paymentObject = new window.Razorpay(options);
//       paymentObject.open();

//     } catch (error) {
//       console.error('Payment Error:', error);
//       alert('Something went wrong initiating payment');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-4xl font-bold text-gray-900">
//                 {paymentStatus === 'success' ? 'Payment Complete!' : 'Secure Checkout'}
//               </h1>
//               <p className="text-gray-600 mt-2">
//                 {paymentStatus === 'success'
//                   ? 'Thank you for your purchase!'
//                   : 'Complete your order securely with Razorpay'
//                 }
//               </p>
//             </div>
//             {onClose && paymentStatus !== 'success' && (
//               <button
//                 onClick={onClose}
//                 className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
//               >
//                 ✕
//               </button>
//             )}
//           </div>
//         </motion.div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main Section */}
//           <div className="lg:col-span-2">
//             {paymentStatus === 'success' ? (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
//               >
//                 <div className="text-6xl mb-4">🎉</div>
//                 <h2 className="text-2xl font-bold text-green-800 mb-2">
//                   Payment Successful!
//                 </h2>
//                 <p className="text-green-700 mb-6">
//                   Your order has been confirmed.
//                 </p>
//                 <button
//                   onClick={onClose}
//                   className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   Continue Shopping
//                 </button>
//               </motion.div>
//             ) : (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="bg-white rounded-2xl shadow-lg p-8"
//               >
//                 <div className="text-center mb-8">
//                   <div className="text-5xl mb-4">💳</div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     Pay ₹{total.toLocaleString()}
//                   </h2>
//                   <p className="text-gray-500">via Razorpay Secure Gateway</p>
//                 </div>

//                 <button
//                   onClick={handlePayment}
//                   disabled={isLoading}
//                   className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                       Processing...
//                     </>
//                   ) : (
//                     'Pay Now'
//                   )}
//                 </button>

//                 <div className="mt-6 flex items-center justify-center space-x-4 grayscale opacity-60">
//                   <span className="text-sm">Secured by Razorpay</span>
//                 </div>
//               </motion.div>
//             )}
//           </div>

//           {/* Order Summary */}
//           <div className="lg:col-span-1">
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
//             >
//               <h2 className="text-xl font-bold text-gray-900 mb-6">
//                 Order Summary
//               </h2>

//               <div className="space-y-3 mb-6">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Subtotal</span>
//                   <span>₹{subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>Shipping</span>
//                   <span className={shipping === 0 ? 'text-green-600' : ''}>
//                     {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>GST (18%)</span>
//                   <span>₹{tax.toLocaleString()}</span>
//                 </div>
//                 <div className="border-t border-gray-200 pt-3">
//                   <div className="flex justify-between text-lg font-bold">
//                     <span>Total</span>
//                     <span>₹{total.toLocaleString()}</span>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Payment;





// filepath: f:\Shoecreatify\frontend\src\components\Payment.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Payment = ({ user, cartItems = [], onPaymentSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  const razorpayInstanceRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  // Validate Razorpay key
  const razorpayKey = useMemo(() => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
      console.error('Razorpay Key ID is missing in environment variables');
    }
    return key;
  }, []);

  // Memoized calculations - computed once per cartItems change
  const orderSummary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 5000 ? 0 : 500;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cartItems]);

  // Load Razorpay Script only once
  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (scriptLoadedRef.current || window.Razorpay) {
        setIsScriptLoaded(true);
        resolve(true);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="razorpay"]');
      if (existingScript) {
        setIsScriptLoaded(true);
        scriptLoadedRef.current = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        scriptLoadedRef.current = true;
        setIsScriptLoaded(true);
        resolve(true);
      };
      
      script.onerror = () => {
        scriptLoadedRef.current = false;
        setIsScriptLoaded(false);
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  }, []);

  // Load script on mount
  useEffect(() => {
    if (!scriptLoadedRef.current) {
      loadRazorpayScript();
    }

    // Cleanup on unmount
    return () => {
      if (razorpayInstanceRef.current) {
        try {
          razorpayInstanceRef.current.close?.();
        } catch (err) {
          console.error('Error closing Razorpay:', err);
        }
      }
    };
  }, [loadRazorpayScript]);

  // Optimized payment handler
  const handlePayment = useCallback(async () => {
    if (!razorpayKey) {
      setError('Payment gateway not configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Ensure script is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Payment gateway failed to load. Please check your internet connection.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create Order on Backend
      const orderResponse = await axios.post('/api/payment/create-order', {
        amount: orderSummary.total,
        currency: 'INR',
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      }, {
        withCredentials: true,
        timeout: 15000
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }

      const { order } = orderResponse.data;

      // 2. Configure Razorpay Options
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: "ShoeCraftify",
        description: `Order for ${orderSummary.itemCount} item(s)`,
        image: "/logo.png", // Add your logo path
        order_id: order.id,
        
        handler: async function (response) {
          try {
            // 3. Verify Payment on Backend
            const verifyResponse = await axios.post('/api/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: orderSummary.total
            }, {
              withCredentials: true,
              timeout: 15000
            });

            if (verifyResponse.data.success) {
              setPaymentStatus('success');
              
              // Call success callback
              if (onPaymentSuccess) {
                onPaymentSuccess({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  amount: orderSummary.total,
                  method: 'Razorpay',
                  timestamp: new Date().toISOString()
                });
              }
            } else {
              setError('Payment verification failed. Please contact support.');
              setPaymentStatus('failed');
            }
          } catch (error) {
            console.error('Verification Error:', error);
            setError(error.response?.data?.message || 'Payment verification failed. Please contact support.');
            setPaymentStatus('failed');
          }
        },
        
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            setError('Payment cancelled by user');
          }
        },
        
        prefill: {
          name: user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        
        notes: {
          userId: user?._id || 'guest',
          orderType: 'custom_shoe'
        },
        
        theme: {
          color: "#3B82F6"
        }
      };

      // 3. Open Razorpay Checkout
      razorpayInstanceRef.current = new window.Razorpay(options);
      razorpayInstanceRef.current.open();

    } catch (error) {
      console.error('Payment Error:', error);
      
      let errorMessage = 'Failed to initiate payment. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [razorpayKey, orderSummary, cartItems, user, onPaymentSuccess, loadRazorpayScript]);

  // Retry payment handler
  const handleRetry = useCallback(() => {
    setError(null);
    setPaymentStatus(null);
    handlePayment();
  }, [handlePayment]);

  // Close handler
  const handleClose = useCallback(() => {
    if (razorpayInstanceRef.current) {
      try {
        razorpayInstanceRef.current.close();
      } catch (err) {
        console.error('Error closing Razorpay:', err);
      }
    }
    onClose?.();
  }, [onClose]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <PaymentHeader
          paymentStatus={paymentStatus}
          onClose={handleClose}
        />

        {/* Error Display */}
        <ErrorMessage error={error} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {paymentStatus === 'success' ? (
                <SuccessView onClose={handleClose} />
              ) : paymentStatus === 'failed' ? (
                <FailedView error={error} onRetry={handleRetry} onClose={handleClose} />
              ) : (
                <PaymentView
                  total={orderSummary.total}
                  isLoading={isLoading}
                  isScriptLoaded={isScriptLoaded}
                  onPayment={handlePayment}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <OrderSummary orderSummary={orderSummary} cartItems={cartItems} />
        </div>
      </div>
    </div>
  );
};

// Payment Header Component
const PaymentHeader = React.memo(({ paymentStatus, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8"
  >
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {paymentStatus === 'success' 
            ? 'Payment Complete!' 
            : paymentStatus === 'failed'
            ? 'Payment Failed'
            : 'Secure Checkout'
          }
        </h1>
        <p className="text-gray-600 mt-2">
          {paymentStatus === 'success'
            ? 'Thank you for your purchase!'
            : paymentStatus === 'failed'
            ? 'There was an issue processing your payment'
            : 'Complete your order securely with Razorpay'
          }
        </p>
      </div>
      {onClose && paymentStatus !== 'success' && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close payment"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  </motion.div>
));

PaymentHeader.displayName = 'PaymentHeader';

// Error Message Component
const ErrorMessage = React.memo(({ error }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div className="flex items-start">
        <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-red-800">{error}</span>
      </div>
    </motion.div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

// Success View Component
const SuccessView = React.memo(({ onClose }) => (
  <motion.div
    key="success"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center shadow-xl"
  >
    <div className="text-6xl mb-4 animate-bounce">🎉</div>
    <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
      Payment Successful!
    </h2>
    <p className="text-green-700 mb-6">
      Your order has been confirmed and will be processed shortly.
    </p>
    <div className="space-y-3">
      <button
        onClick={onClose}
        className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
      >
        Continue Shopping
      </button>
      <button
        onClick={() => window.location.href = '/orders'}
        className="w-full px-6 py-3 bg-white text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors border border-green-300"
      >
        View Orders
      </button>
    </div>
  </motion.div>
));

SuccessView.displayName = 'SuccessView';

// Failed View Component
const FailedView = React.memo(({ error, onRetry, onClose }) => (
  <motion.div
    key="failed"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 text-center shadow-xl"
  >
    <div className="text-6xl mb-4">❌</div>
    <h2 className="text-2xl md:text-3xl font-bold text-red-800 mb-2">
      Payment Failed
    </h2>
    <p className="text-red-700 mb-6">
      {error || 'There was an issue processing your payment. Please try again.'}
    </p>
    <div className="space-y-3">
      <button
        onClick={onRetry}
        className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
      >
        Retry Payment
      </button>
      <button
        onClick={onClose}
        className="w-full px-6 py-3 bg-white text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors border border-red-300"
      >
        Cancel
      </button>
    </div>
  </motion.div>
));

FailedView.displayName = 'FailedView';

// Payment View Component
const PaymentView = React.memo(({ total, isLoading, isScriptLoaded, onPayment }) => (
  <motion.div
    key="payment"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
  >
    <div className="text-center mb-8">
      <div className="text-5xl mb-4">💳</div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Pay ₹{total.toLocaleString()}
      </h2>
      <p className="text-gray-500">via Razorpay Secure Gateway</p>
    </div>

    <button
      onClick={onPayment}
      disabled={isLoading || !isScriptLoaded}
      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </>
      ) : !isScriptLoaded ? (
        <>
          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading Payment Gateway...
        </>
      ) : (
        'Pay Now'
      )}
    </button>

    <div className="mt-6 text-center">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Secured by Razorpay</span>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Your payment information is encrypted and secure
      </p>
    </div>
  </motion.div>
));

PaymentView.displayName = 'PaymentView';

// Order Summary Component
const OrderSummary = React.memo(({ orderSummary, cartItems }) => (
  <div className="lg:col-span-1">
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Order Summary
      </h2>

      {/* Cart Items */}
      {cartItems.length > 0 && (
        <div className="mb-6 max-h-48 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Items ({orderSummary.itemCount})
          </h3>
          <div className="space-y-2">
            {cartItems.map((item, index) => (
              <CartItem key={item.id || index} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6 border-t pt-4">
        <SummaryRow label="Subtotal" value={orderSummary.subtotal} />
        <SummaryRow 
          label="Shipping" 
          value={orderSummary.shipping} 
          isFree={orderSummary.shipping === 0}
        />
        <SummaryRow label="GST (18%)" value={orderSummary.tax} />
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{orderSummary.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Free Shipping Note */}
      {orderSummary.subtotal < 5000 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium">💡 Tip</p>
          <p className="mt-1">
            Add ₹{(5000 - orderSummary.subtotal).toLocaleString()} more for FREE shipping!
          </p>
        </div>
      )}
    </motion.div>
  </div>
));

OrderSummary.displayName = 'OrderSummary';

// Cart Item Component
const CartItem = React.memo(({ item }) => (
  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
      <span className="text-xl">👟</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
    </div>
    <span className="text-sm font-medium text-gray-900">
      ₹{(item.price * item.quantity).toLocaleString()}
    </span>
  </div>
));

CartItem.displayName = 'CartItem';

// Summary Row Component
const SummaryRow = React.memo(({ label, value, isFree }) => (
  <div className="flex justify-between text-gray-600">
    <span>{label}</span>
    <span className={isFree ? 'text-green-600 font-medium' : ''}>
      {isFree ? 'FREE' : `₹${value.toLocaleString()}`}
    </span>
  </div>
));

SummaryRow.displayName = 'SummaryRow';

export default React.memo(Payment);