import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 text-lg">
            Effective Date: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Important Notice */}
          <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <p className="text-yellow-800 font-bold mb-2">⚠️ IMPORTANT NOTICE</p>
            <p className="text-yellow-700">
              Please read these Terms of Service carefully before using ShoeCraftify. 
              By accessing or using our platform, you agree to be bound by these terms.
            </p>
          </div>

          {/* Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-3">
              By accessing and using the <strong>ShoeCraftify</strong> website and services 
              (the "Platform"), you accept and agree to be bound by these Terms of Service 
              ("Terms"). If you do not agree to these Terms, you must not use our Platform.
            </p>
            <p className="text-gray-700">
              These Terms apply to all visitors, users, and others who access or use the Platform.
            </p>
          </section>

          {/* Account Terms */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. Account Terms</h3>
            <ul className="list-disc pl-5 space-y-3 text-gray-700">
              <li>You must be at least 13 years old to use this Platform</li>
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
            </ul>
          </section>

          {/* Design and Intellectual Property */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">3. Design and Intellectual Property</h3>
            
            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">A. Your Designs</h4>
              <p className="text-gray-700 mb-3">
                You retain ownership of your original shoe designs created on our Platform.
              </p>
              <p className="text-gray-700">
                By submitting designs, you grant ShoeCraftify a worldwide, non-exclusive, 
                royalty-free license to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                <li>Store and display your designs on our Platform</li>
                <li>Use designs for promotional purposes (with attribution)</li>
                <li>Improve our design algorithms and tools</li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">B. Our Intellectual Property</h4>
              <p className="text-gray-700 mb-3">
                All Platform content, features, and functionality are owned by ShoeCraftify 
                and are protected by intellectual property laws.
              </p>
              <p className="text-gray-700">
                You may not:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                <li>Copy, modify, or create derivative works</li>
                <li>Use our trademarks or logos without permission</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Remove copyright or proprietary notices</li>
              </ul>
            </div>
          </section>

          {/* Payment and Orders */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">4. Payment and Orders</h3>
            <ul className="list-disc pl-5 space-y-3 text-gray-700">
              <li>All prices are in INR (Indian Rupees) unless stated otherwise</li>
              <li>We use Razorpay for secure payment processing</li>
              <li>Payment must be completed before order processing begins</li>
              <li>We reserve the right to refuse or cancel orders</li>
              <li>Taxes and shipping fees are calculated during checkout</li>
              <li>Digital designs are available immediately after purchase</li>
            </ul>
          </section>

          {/* Refund and Cancellation Policy */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">5. Refund and Cancellation Policy</h3>
            
            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">A. Digital Designs</h4>
              <p className="text-gray-700">
                Due to the digital nature of our designs, we do not offer refunds for:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                <li>Completed digital shoe designs</li>
                <li>Downloaded 3D models</li>
                <li>Design tools and features</li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">B. Physical Products</h4>
              <p className="text-gray-700">
                For physical shoe orders:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                <li>Cancellations must be made within 24 hours of ordering</li>
                <li>Refunds processed within 7-10 business days</li>
                <li>Custom-designed shoes are non-returnable unless defective</li>
              </ul>
            </div>
          </section>

          {/* User Conduct */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">6. User Conduct</h3>
            <p className="text-gray-700 mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Use the Platform for any illegal purpose</li>
              <li>Upload harmful content (viruses, malware)</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with Platform security or functionality</li>
              <li>Design offensive or inappropriate content</li>
              <li>Violate intellectual property rights</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">7. Termination</h3>
            <p className="text-gray-700 mb-3">
              We may terminate or suspend your account immediately, without prior notice, for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>At our sole discretion</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Upon termination, your right to use the Platform will immediately cease.
            </p>
          </section>

          {/* Disclaimers and Limitations */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations</h3>
            
            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">A. Service "As Is"</h4>
              <p className="text-gray-700">
                The Platform is provided "as is" without warranties of any kind. We do not 
                guarantee uninterrupted, error-free, or secure access to our services.
              </p>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">B. Limitation of Liability</h4>
              <p className="text-gray-700">
                To the maximum extent permitted by law, ShoeCraftify shall not be liable for:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data or profits</li>
                <li>Damages resulting from use or inability to use the Platform</li>
                <li>Third-party conduct or content</li>
              </ul>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">9. Governing Law</h3>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes shall be subject to the exclusive jurisdiction of the courts in 
              Creative City, India.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">10. Changes to Terms</h3>
            <p className="text-gray-700 mb-3">
              We reserve the right to modify these Terms at any time. We will notify users of 
              significant changes by:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Posting the new Terms on this page</li>
              <li>Sending email notification</li>
              <li>Displaying a notice on the Platform</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Continued use of the Platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">11. Contact Information</h3>
            <p className="text-gray-700 mb-4">
              For questions about these Terms, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-gray-800">Legal Department</p>
                <p className="text-gray-700">
                  <a href="mailto:legal@shoecraftify.com" className="text-blue-600 hover:text-blue-800">
                    legal@shoecraftify.com
                  </a>
                </p>
              </div>
              <div>
                <p className="font-bold text-gray-800">Customer Support</p>
                <p className="text-gray-700">
                  <a href="mailto:support@shoecraftify.com" className="text-blue-600 hover:text-blue-800">
                    support@shoecraftify.com
                  </a>
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-700">
                <strong>Address:</strong> 123 Design Street, Creative City, CC 12345, India
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> +91 12345 67890 (Mon-Fri, 9 AM - 6 PM IST)
              </p>
            </div>
          </section>

          {/* Agreement Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <p className="text-gray-700 text-center">
              By using ShoeCraftify, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} ShoeCraftify. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800 text-sm">
                  Privacy Policy
                </Link>
                <Link to="/contact" className="text-blue-600 hover:text-blue-800 text-sm">
                  Contact Us
                </Link>
                <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;