import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to ShoeCraftify
            </h2>
            <p className="text-gray-700 mb-4">
              At <strong>ShoeCraftify</strong> ("we," "us," or "our"), we are committed to protecting 
              your privacy and ensuring the security of your personal information. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you visit 
              our website and use our 3D shoe design platform.
            </p>
            <p className="text-gray-700">
              By using ShoeCraftify, you agree to the collection and use of information in accordance 
              with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h3>
            
            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">A. Personal Information</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Account Information:</strong> Name, email address, phone number when you create an account</li>
                <li><strong>Profile Data:</strong> Profile picture, username, shipping addresses</li>
                <li><strong>Payment Information:</strong> Payment method details (processed securely via Razorpay)</li>
                <li><strong>Communication:</strong> Messages, inquiries, and feedback you send us</li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">B. Design Information</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Design Data:</strong> Your custom shoe designs, including colors, materials, patterns, and decals</li>
                <li><strong>3D Models:</strong> Generated 3D models of your designs</li>
                <li><strong>Design Preferences:</strong> Your saved templates and design history</li>
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-gray-800 mb-2">C. Technical Information</h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
                <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h3>
            <ul className="list-disc pl-5 space-y-3 text-gray-700">
              <li>
                <strong>To Provide Services:</strong> Process orders, manage your account, and enable 3D design features
              </li>
              <li>
                <strong>To Improve Our Platform:</strong> Analyze usage patterns to enhance user experience
              </li>
              <li>
                <strong>To Communicate:</strong> Send order confirmations, updates, and respond to inquiries
              </li>
              <li>
                <strong>For Security:</strong> Protect against fraud and unauthorized access
              </li>
              <li>
                <strong>For Marketing:</strong> Send promotional offers (only with your consent)
              </li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">3. Data Sharing and Disclosure</h3>
            <p className="text-gray-700 mb-3">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-700">
              <li>
                <strong>Payment Processors:</strong> Razorpay for payment processing
              </li>
              <li>
                <strong>Service Providers:</strong> Cloud hosting, analytics, and customer support
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In case of merger, acquisition, or sale
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">4. Data Security</h3>
            <p className="text-gray-700 mb-3">
              We implement appropriate security measures including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure servers with firewalls</li>
              <li>Regular security audits</li>
              <li>Limited employee access to personal data</li>
              <li>Secure payment processing through Razorpay</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">5. Your Rights</h3>
            <p className="text-gray-700 mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your design data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, contact us at: 
              <a href="mailto:privacy@shoecraftify.com" className="text-blue-600 hover:text-blue-800 ml-2">
                privacy@shoecraftify.com
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">6. Cookies</h3>
            <p className="text-gray-700 mb-3">
              We use cookies for:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Essential Cookies:</strong> Authentication and session management</li>
              <li><strong>Preference Cookies:</strong> Remember your design preferences</li>
              <li><strong>Analytics Cookies:</strong> Understand how users interact with our platform</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You can control cookies through your browser settings. However, disabling essential 
              cookies may affect platform functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">7. Children's Privacy</h3>
            <p className="text-gray-700">
              ShoeCraftify is not intended for children under 13. We do not knowingly collect 
              personal information from children under 13. If you believe we have collected 
              information from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h3>
            <p className="text-gray-700 mb-3">
              We may update this Privacy Policy periodically. We will notify you of significant 
              changes by:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Posting the updated policy on this page</li>
              <li>Sending an email notification</li>
              <li>Displaying a notice on our platform</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">9. Contact Us</h3>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> 
                <a href="mailto:privacy@shoecraftify.com" className="text-blue-600 hover:text-blue-800 ml-2">
                  privacy@shoecraftify.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> 
                <span className="ml-2">123 Design Street, Creative City, CC 12345</span>
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> 
                <a href="tel:+911234567890" className="text-blue-600 hover:text-blue-800 ml-2">
                  +91 12345 67890
                </a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} ShoeCraftify. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="/terms" className="text-blue-600 hover:text-blue-800 text-sm">
                  Terms of Service
                </Link>
                <Link to="/contact" className="text-blue-600 hover:text-blue-800 text-sm">
                  Contact Us
                </Link>
                <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;