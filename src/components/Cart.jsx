// import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
// import { motion } from 'framer-motion';
// import { useCart } from '../contexts/CartContext';
// import axios from 'axios';

// // Lazy load Payment component
// const Payment = lazy(() => import('./Payment'));

// const Cart = ({ user }) => {
//   const {
//     cartItems,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     getCartTotal
//   } = useCart();

//   const [showPayment, setShowPayment] = useState(false);

//   // Memoize all calculations
//   const cartTotal = useMemo(() => getCartTotal(), [cartItems]);
  
//   const { shipping, tax, total } = useMemo(() => {
//     const shippingCost = cartTotal > 5000 ? 0 : 50;
//     const taxAmount = cartTotal * 0.18;
//     const totalAmount = cartTotal + shippingCost + taxAmount;
    
//     return {
//       shipping: shippingCost,
//       tax: taxAmount,
//       total: totalAmount
//     };
//   }, [cartTotal]);

//   // Memoize handlers
//   const handlePaymentSuccess = useCallback(async (paymentData) => {
//     console.log('Payment successful:', paymentData);

//     try {
//       const orderData = {
//         items: cartItems.map(item => ({
//           templateId: item.designId || 'custom',
//           name: item.name,
//           quantity: item.quantity,
//           price: item.price,
//           customization: {
//             description: typeof item.customization === 'string' 
//               ? item.customization 
//               : JSON.stringify(item.customization)
//           }
//         })),
//         totalAmount: total,
//         shippingAddress: {
//           street: '123 Main St',
//           city: 'Bangalore',
//           state: 'KA',
//           zipCode: '560001',
//           country: 'India'
//         },
//         paymentStatus: 'completed'
//       };

//       const response = await axios.post('/api/orders', orderData);

//       if (response.data.success) {
//         console.log('Order saved to DB, clearing cart...');
//         clearCart();
//       }
//     } catch (error) {
//       console.error('Error placing order:', error);
//       alert('Payment successful but failed to record order. Please contact support.');
//     }
//   }, [cartItems, total, clearCart]);

//   const handleClosePayment = useCallback(() => {
//     setShowPayment(false);
//   }, []);

//   // Memoize customization renderer
//   const renderCustomization = useCallback((customization) => {
//     if (!customization) return null;
//     if (typeof customization === 'string') return customization;
//     if (typeof customization === 'object') {
//       return Object.entries(customization)
//         .map(([key, val]) => `${key}: ${val}`)
//         .join(', ');
//     }
//     return String(customization);
//   }, []);

//   if (showPayment) {
//     return (
//       <Suspense fallback={<LoadingSpinner />}>
//         <Payment
//           user={user}
//           cartItems={cartItems}
//           onPaymentSuccess={handlePaymentSuccess}
//           onClose={handleClosePayment}
//         />
//       </Suspense>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
//       <div className="max-w-7xl mx-auto">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//           className="mb-8"
//         >
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">
//             Your Shopping Cart
//           </h1>
//           <p className="text-gray-600">
//             Review your custom designs and proceed to checkout
//           </p>
//         </motion.div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2">
//             <CartItemsSection 
//               cartItems={cartItems}
//               removeFromCart={removeFromCart}
//               updateQuantity={updateQuantity}
//               clearCart={clearCart}
//               renderCustomization={renderCustomization}
//             />

//             {cartItems.length > 0 && (
//               <ContinueShoppingLink />
//             )}
//           </div>

//           <div className="lg:col-span-1">
//             <OrderSummary 
//               cartTotal={cartTotal}
//               shipping={shipping}
//               tax={tax}
//               total={total}
//               cartItems={cartItems}
//               onCheckout={() => setShowPayment(true)}
//             />

//             {cartItems.length > 0 ? (
//               <ShippingInfo />
//             ) : (
//               <DesignSuggestions />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Cart Items Section Component
// const CartItemsSection = React.memo(({ 
//   cartItems, 
//   removeFromCart, 
//   updateQuantity, 
//   clearCart,
//   renderCustomization 
// }) => (
//   <motion.div
//     initial={{ opacity: 0, x: -20 }}
//     animate={{ opacity: 1, x: 0 }}
//     transition={{ duration: 0.3 }}
//     className="bg-white rounded-2xl shadow-lg overflow-hidden"
//   >
//     <div className="p-6 border-b border-gray-200">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-bold text-gray-900">
//           Cart Items ({cartItems.length})
//         </h2>
//         {cartItems.length > 0 && (
//           <button
//             onClick={clearCart}
//             className="text-red-600 hover:text-red-700 font-medium transition-colors"
//           >
//             Clear All
//           </button>
//         )}
//       </div>
//     </div>

//     {cartItems.length === 0 ? (
//       <EmptyCart />
//     ) : (
//       <div className="divide-y divide-gray-200">
//         {cartItems.map((item, index) => (
//           <CartItem
//             key={item.id}
//             item={item}
//             index={index}
//             removeFromCart={removeFromCart}
//             updateQuantity={updateQuantity}
//             renderCustomization={renderCustomization}
//           />
//         ))}
//       </div>
//     )}
//   </motion.div>
// ));

// CartItemsSection.displayName = 'CartItemsSection';

// // Cart Item Component
// const CartItem = React.memo(({ item, index, removeFromCart, updateQuantity, renderCustomization }) => {
//   const isHexColor = item.color && item.color.startsWith('#');
//   const colorStyle = isHexColor ? { backgroundColor: item.color } : {};
//   const colorClass = isHexColor
//     ? 'w-32 h-32 rounded-xl flex items-center justify-center text-6xl shadow-lg'
//     : `w-32 h-32 rounded-xl bg-gradient-to-br ${item.color || 'from-blue-500 to-purple-500'} flex items-center justify-center text-6xl shadow-lg`;

//   const handleRemove = useCallback(() => {
//     removeFromCart(item.id);
//   }, [removeFromCart, item.id]);

//   const handleDecrease = useCallback(() => {
//     updateQuantity(item.id, item.quantity - 1);
//   }, [updateQuantity, item.id, item.quantity]);

//   const handleIncrease = useCallback(() => {
//     updateQuantity(item.id, item.quantity + 1);
//   }, [updateQuantity, item.id, item.quantity]);

//   const itemTotal = useMemo(() => 
//     ((item.price || 0) * item.quantity).toLocaleString(),
//     [item.price, item.quantity]
//   );

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.3 }}
//       className="p-6"
//     >
//       <div className="flex flex-col md:flex-row gap-6">
//         <div className="flex-shrink-0">
//           <div className={colorClass} style={colorStyle}>
//             {item.image || '👟'}
//           </div>
//         </div>

//         <div className="flex-1">
//           <div className="flex justify-between items-start">
//             <div>
//               <h3 className="text-lg font-bold text-gray-900 mb-1">
//                 {item.name}
//               </h3>
//               <p className="text-gray-600 text-sm mb-3">
//                 {item.description || 'Custom shoe design'}
//               </p>
//               {item.customization && (
//                 <div className="bg-gray-50 rounded-lg p-3 mb-4">
//                   <div className="text-sm font-medium text-gray-700 mb-1">
//                     Customization:
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     {renderCustomization(item.customization)}
//                   </div>
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={handleRemove}
//               className="text-gray-400 hover:text-red-500 transition-colors"
//               aria-label="Remove item"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center border border-gray-300 rounded-lg">
//                 <button
//                   onClick={handleDecrease}
//                   className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
//                   aria-label="Decrease quantity"
//                 >
//                   −
//                 </button>
//                 <span className="px-4 py-1 text-gray-900 font-medium">
//                   {item.quantity}
//                 </span>
//                 <button
//                   onClick={handleIncrease}
//                   className="px-3 py-1 text-gray-600 hover:text-gray-900 transition-colors"
//                   aria-label="Increase quantity"
//                 >
//                   +
//                 </button>
//               </div>
//               <span className="text-gray-500 text-sm">
//                 ₹{(item.price || 0).toLocaleString()} each
//               </span>
//             </div>
//             <div className="text-lg font-bold text-gray-900">
//               ₹{itemTotal}
//             </div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// });

// CartItem.displayName = 'CartItem';

// // Empty Cart Component
// const EmptyCart = React.memo(() => (
//   <div className="p-12 text-center">
//     <div className="text-6xl mb-4">🛒</div>
//     <h3 className="text-xl font-bold text-gray-900 mb-2">
//       Your cart is empty
//     </h3>
//     <p className="text-gray-600 mb-6">
//       Start designing some amazing shoes!
//     </p>
//     <a
//       href="/designer"
//       className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
//     >
//       Browse Designs
//     </a>
//   </div>
// ));

// EmptyCart.displayName = 'EmptyCart';

// // Continue Shopping Link
// const ContinueShoppingLink = React.memo(() => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ delay: 0.2, duration: 0.3 }}
//     className="mt-6 flex justify-between items-center"
//   >
//     <a
//       href="/designer"
//       className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
//     >
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//       </svg>
//       <span>Continue Shopping</span>
//     </a>
//   </motion.div>
// ));

// ContinueShoppingLink.displayName = 'ContinueShoppingLink';

// // Order Summary Component (Promo Code Removed)
// const OrderSummary = React.memo(({ cartTotal, shipping, tax, total, cartItems, onCheckout }) => (
//   <motion.div
//     initial={{ opacity: 0, x: 20 }}
//     animate={{ opacity: 1, x: 0 }}
//     transition={{ duration: 0.3 }}
//     className="bg-white rounded-2xl shadow-lg p-6 sticky top-6"
//   >
//     <h2 className="text-xl font-bold text-gray-900 mb-6">
//       Order Summary
//     </h2>

//     <div className="space-y-4 mb-6">
//       <div className="flex justify-between">
//         <span className="text-gray-600">Subtotal</span>
//         <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
//       </div>
//       <div className="flex justify-between">
//         <span className="text-gray-600">Shipping</span>
//         <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
//           {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
//         </span>
//       </div>
//       <div className="flex justify-between">
//         <span className="text-gray-600">GST (18%)</span>
//         <span className="font-medium">₹{tax.toLocaleString()}</span>
//       </div>
//       <div className="border-t border-gray-200 pt-4">
//         <div className="flex justify-between">
//           <span className="text-lg font-bold text-gray-900">Total</span>
//           <span className="text-2xl font-bold text-gray-900">
//             ₹{Math.round(total).toLocaleString()}
//           </span>
//         </div>
//         <p className="text-sm text-gray-500 mt-2">
//           Shipping calculated at checkout
//         </p>
//       </div>
//     </div>

//     {cartItems.length > 0 && (
//       <>
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={onCheckout}
//           className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
//         >
//           Proceed to Checkout
//         </motion.button>

//         <PaymentMethods />
//       </>
//     )}
//   </motion.div>
// ));

// OrderSummary.displayName = 'OrderSummary';

// // Payment Methods
// const PaymentMethods = React.memo(() => (
//   <div className="mt-6 pt-6 border-t border-gray-200">
//     <h3 className="text-sm font-medium text-gray-700 mb-3">
//       Secure Payment
//     </h3>
//     <div className="flex space-x-3">
//       {['💳', '🏦', '💰', '📱'].map((method, index) => (
//         <div
//           key={index}
//           className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg"
//         >
//           {method}
//         </div>
//       ))}
//     </div>
//     <p className="text-xs text-gray-500 mt-4 text-center">
//       Your payment information is encrypted and secure
//     </p>
//   </div>
// ));

// PaymentMethods.displayName = 'PaymentMethods';

// // Shipping Info Component
// const ShippingInfo = React.memo(() => {
//   const benefits = useMemo(() => [
//     { emoji: '🚚', title: 'Free Shipping', desc: 'On orders over ₹5,000', color: 'from-blue-500 to-purple-500' },
//     { emoji: '⚡', title: 'Fast Production', desc: '2-3 week delivery', color: 'from-green-500 to-emerald-500' },
//     { emoji: '🔄', title: 'Easy Returns', desc: '30-day return policy', color: 'from-yellow-500 to-orange-500' },
//   ], []);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.2, duration: 0.3 }}
//       className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6"
//     >
//       {benefits.map((item, index) => (
//         <div key={index} className={`flex items-center space-x-3 ${index > 0 ? 'mt-4' : ''}`}>
//           <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
//             {item.emoji}
//           </div>
//           <div>
//             <h3 className="font-bold text-gray-900">{item.title}</h3>
//             <p className="text-sm text-gray-600">{item.desc}</p>
//           </div>
//         </div>
//       ))}
//     </motion.div>
//   );
// });

// ShippingInfo.displayName = 'ShippingInfo';

// // Design Suggestions Component
// const DesignSuggestions = React.memo(() => {
//   const suggestions = useMemo(() => [
//     { name: 'Trending Sneakers', emoji: '👟', color: 'from-blue-400 to-cyan-400' },
//     { name: 'Classic Boots', emoji: '🥾', color: 'from-gray-600 to-gray-800' },
//     { name: 'Summer Sandals', emoji: '👡', color: 'from-orange-400 to-yellow-400' },
//   ], []);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6"
//     >
//       <h3 className="font-bold text-gray-900 mb-4">
//         Design Suggestions
//       </h3>
//       <div className="space-y-3">
//         {suggestions.map((item, index) => (
//           <a
//             key={index}
//             href="/designer"
//             className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg hover:bg-white transition-colors cursor-pointer"
//           >
//             <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl flex-shrink-0`}>
//               {item.emoji}
//             </div>
//             <div>
//               <div className="font-medium text-gray-900">{item.name}</div>
//               <div className="text-sm text-gray-600">Explore designs</div>
//             </div>
//           </a>
//         ))}
//       </div>
//     </motion.div>
//   );
// });

// DesignSuggestions.displayName = 'DesignSuggestions';

// // Loading Spinner for Payment lazy load
// const LoadingSpinner = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
//     <div className="text-center">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//       <p className="text-gray-600">Loading payment...</p>
//     </div>
//   </div>
// );

// export default React.memo(Cart);





import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart,
  IndianRupee,
  Truck,
  Shield,
  CreditCard,
  ArrowLeft,
  Package,
  RefreshCw,
  X,
  Clock,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

// Lazy load Payment component
const Payment = lazy(() => import('./Payment'));

const Cart = ({ user }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal
  } = useCart();

  const [showPayment, setShowPayment] = useState(false);

  // Memoize all calculations
  const cartTotal = useMemo(() => getCartTotal(), [cartItems, getCartTotal]);
  
  const { shipping, tax, total } = useMemo(() => {
    const shippingCost = cartTotal > 5000 ? 0 : 50;
    const taxAmount = Math.round(cartTotal * 0.18);
    const totalAmount = cartTotal + shippingCost + taxAmount;
    
    return {
      shipping: shippingCost,
      tax: taxAmount,
      total: Math.round(totalAmount)
    };
  }, [cartTotal]);

  // Memoize handlers
  const handlePaymentSuccess = useCallback(async (paymentData) => {
    console.log('Payment successful:', paymentData);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          templateId: item.designId || 'custom',
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customization: {
            description: typeof item.customization === 'string' 
              ? item.customization 
              : JSON.stringify(item.customization)
          }
        })),
        totalAmount: total,
        shippingAddress: {
          street: '123 Main St',
          city: 'Bangalore',
          state: 'KA',
          zipCode: '560001',
          country: 'India'
        },
        paymentStatus: 'completed'
      };

      const response = await axios.post('/api/orders', orderData);

      if (response.data.success) {
        console.log('Order saved to DB, clearing cart...');
        clearCart();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Payment successful but failed to record order. Please contact support.');
    }
  }, [cartItems, total, clearCart]);

  const handleClosePayment = useCallback(() => {
    setShowPayment(false);
  }, []);

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (showPayment) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Payment
          user={user}
          cartItems={cartItems}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={handleClosePayment}
        />
      </Suspense>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added any custom designs to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/my-designs"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Browse My Designs
              </Link>
              <Link
                to="/suggestions"
                className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                Create New Design
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            to="/my-designs"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Designs
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Shopping Cart
              </h1>
              <p className="text-gray-600">
                Review your custom designs and proceed to checkout
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-blue-700">
                  <span className="font-bold">{cartItems.length}</span> item{cartItems.length !== 1 ? 's' : ''} • Total {formatPrice(total)}
                </p>
              </div>
              <button
                onClick={clearCart}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <CartItemsSection 
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              updateQuantity={updateQuantity}
              formatPrice={formatPrice}
            />

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over ₹5000</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% secure & encrypted</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <OrderSummary 
              cartTotal={cartTotal}
              shipping={shipping}
              tax={tax}
              total={total}
              formatPrice={formatPrice}
              onCheckout={() => setShowPayment(true)}
            />

            {/* Estimated Delivery */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Estimated Delivery
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time</span>
                  <span className="font-medium text-gray-900">3-5 business days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">5-7 business days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-100">
                  <span className="font-bold text-gray-900">Total Delivery</span>
                  <span className="font-bold text-blue-700">8-12 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Items Section Component
const CartItemsSection = React.memo(({ 
  cartItems, 
  removeFromCart, 
  updateQuantity,
  formatPrice 
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden"
  >
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" />
        Cart Items ({cartItems.length})
      </h2>
    </div>
    
    <div className="divide-y divide-gray-100">
      {cartItems.map((item, index) => (
        <CartItem
          key={item.id}
          item={item}
          index={index}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  </motion.div>
));

CartItemsSection.displayName = 'CartItemsSection';

// Cart Item Component
const CartItem = React.memo(({ item, index, removeFromCart, updateQuantity, formatPrice }) => {
  const handleRemove = useCallback(() => {
    removeFromCart(item.id);
  }, [removeFromCart, item.id]);

  const handleDecrease = useCallback(() => {
    updateQuantity(item.id, item.quantity - 1);
  }, [updateQuantity, item.id, item.quantity]);

  const handleIncrease = useCallback(() => {
    updateQuantity(item.id, item.quantity + 1);
  }, [updateQuantity, item.id, item.quantity]);

  const itemTotal = useMemo(() => 
    (item.price || 0) * item.quantity,
    [item.price, item.quantity]
  );

  // Check if item has design data with colors
  const hasColors = item.designData?.colors || item.colors;
  const colors = item.designData?.colors || item.colors || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.3 }}
      className="p-6 hover:bg-gray-50 transition-colors"
    >
      <div className="flex gap-4">
        {/* Item Image */}
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
          {item.image || item.preview ? (
            <img
              src={item.image || item.preview}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Custom Design • {item.type?.replace('-', ' ') || 'Saved Design'}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-amber-600 flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  {formatPrice(item.price)}
                </span>
                {hasColors && (
                  <div className="flex items-center gap-1">
                    {Object.values(colors).slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove item"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={handleDecrease}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-1 text-gray-900 font-medium">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Item Total</p>
              <p className="text-lg font-bold text-gray-900 flex items-center justify-end">
                <IndianRupee className="w-4 h-4" />
                {formatPrice(itemTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';

// Order Summary Component
const OrderSummary = React.memo(({ cartTotal, shipping, tax, total, formatPrice, onCheckout }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
  >
    <h2 className="text-xl font-bold text-gray-900 mb-6">
      Order Summary
    </h2>

    <div className="space-y-4 mb-6">
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900 flex items-center">
          <IndianRupee className="w-4 h-4" />
          {formatPrice(cartTotal)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Shipping</span>
        <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'} flex items-center`}>
          {shipping === 0 ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            <>
              <IndianRupee className="w-4 h-4" />
              {formatPrice(shipping)}
            </>
          )}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">GST (18%)</span>
        <span className="font-medium text-gray-900 flex items-center">
          <IndianRupee className="w-4 h-4" />
          {formatPrice(tax)}
        </span>
      </div>
      
      {/* Divider */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-5 h-5" />
            {formatPrice(total)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Shipping calculated at checkout
        </p>
      </div>
    </div>

    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onCheckout}
      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
    >
      <CreditCard className="w-5 h-5" />
      Proceed to Checkout
    </motion.button>

    {/* Secure Payment Notice */}
    <div className="text-center pt-6 border-t border-gray-200 mt-6">
      <div className="flex justify-center gap-3 mb-3">
        {['💳', '🏦', '💰', '📱'].map((method, index) => (
          <div
            key={index}
            className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg"
          >
            {method}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        <Shield className="w-3 h-3 inline mr-1" />
        Your payment is secure and encrypted
      </p>
    </div>

    {/* Continue Shopping */}
    <div className="pt-6 border-t border-gray-200 mt-6">
      <Link
        to="/my-designs"
        className="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue Shopping
      </Link>
    </div>
  </motion.div>
));

OrderSummary.displayName = 'OrderSummary';

// Loading Spinner for Payment lazy load
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading payment...</p>
    </div>
  </div>
);

export default React.memo(Cart);