import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowRight, Mail, Phone, MapPin, Clock, Send, 
  CheckCircle, AlertCircle, ChevronRight, Sparkles,
  MessageSquare, Palette, Target, Zap
} from 'lucide-react';

const Contact = () => {
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactType: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const contactTypes = [
    { value: 'general', label: 'General', icon: '💬', color: 'from-blue-500 to-cyan-500' },
    { value: 'support', label: 'Support', icon: '🔧', color: 'from-purple-500 to-pink-500' },
    { value: 'design', label: 'Design', icon: '🎨', color: 'from-pink-500 to-rose-500' },
    { value: 'order', label: 'Order', icon: '📦', color: 'from-emerald-500 to-green-500' },
    { value: 'business', label: 'Business', icon: '🤝', color: 'from-indigo-500 to-blue-500' },
    { value: 'feedback', label: 'Feedback', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/contact/send', {
        ...formData,
        toEmail: 'ramkumar9219447537@gmail.com',
        replyTo: formData.email,
      });

      if (response.data.success) {
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          contactType: 'general'
        });
        setSubmitStatus('success');
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        throw new Error('Failed to send message');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGoogleMaps = () => {
    window.open("https://goo.gl/maps/9UwvR8PJhN8tE8b49", '_blank');
  };

  const floatAnimation = {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <div className="bg-[#050505] text-white selection:bg-white selection:text-black min-h-screen mt-2">
      {/* HERO SECTION */}
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#050505] z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-pink-900/10" />
        
        <motion.div
          style={{ opacity: opacityHero, scale: scaleHero }}
          className="relative z-20 text-center max-w-5xl w-full"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
            <span className="h-px w-8 sm:w-10 md:w-12 bg-white/30" />
            <span className="uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[9px] sm:text-[10px] font-bold text-white/60">
              Connect With Creators
            </span>
            <span className="h-px w-8 sm:w-10 md:w-12 bg-white/30" />
          </div>

          <h1 className="mb-4 sm:mb-6 md:mb-8 leading-[0.9] tracking-tight px-2">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-[8rem] font-light bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Contact Us.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Have questions about 3D shoe customization? Our design team is ready to help.
          </p>
        </motion.div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-10 sm:py-14 md:py-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
          {/* LEFT COLUMN - INFO CARDS */}
          <div className="space-y-6 sm:space-y-8">
            {/* CONTACT INFO CARD */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 flex items-center">
                <MessageSquare className="mr-3 sm:mr-4 text-blue-400" size={24} />
                Quick Contact
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                <a 
                  href="mailto:ramkumar9219447537@gmail.com"
                  className="group flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 transition-all"
                >
                  <motion.div 
                    animate={floatAnimation}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0"
                  >
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-400" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm uppercase tracking-widest text-white/50">Email</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mt-1 truncate">
                      ramkumar9219447537@gmail.com
                    </p>
                    <p className="text-xs sm:text-sm text-white/40 mt-1 sm:mt-2">24-hour response</p>
                  </div>
                  <ChevronRight className="text-white/30 group-hover:text-blue-400 transition-colors flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                </a>

                <a 
                  href="https://wa.me/919219447537"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 transition-all"
                >
                  <motion.div 
                    animate={floatAnimation}
                    style={{ animationDelay: '0.5s' }}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0"
                  >
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-400" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm uppercase tracking-widest text-white/50">Phone / WhatsApp</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mt-1">+91 92194 47537</p>
                    <p className="text-xs sm:text-sm text-white/40 mt-1 sm:mt-2">Available now</p>
                  </div>
                  <ArrowRight className="text-white/30 group-hover:text-green-400 transition-colors flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                </a>

                <button
                  onClick={openGoogleMaps}
                  className="group w-full flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 transition-all text-left"
                >
                  <motion.div 
                    animate={floatAnimation}
                    style={{ animationDelay: '1s' }}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0"
                  >
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-400" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm uppercase tracking-widest text-white/50">Studio Location</p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mt-1">Lovely Professional University</p>
                    <p className="text-xs sm:text-sm text-white/40 mt-1 sm:mt-2">Phagwara, Punjab</p>
                  </div>
                  <ArrowRight className="text-white/30 group-hover:text-red-400 transition-colors flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </motion.div>

            {/* HOURS CARD */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                <Clock className="mr-3 sm:mr-4 text-purple-400" size={20} />
                Design Studio Hours
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM', highlight: true },
                  { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
                  { day: 'Sunday', hours: 'By Appointment', special: true },
                ].map((schedule, idx) => (
                  <div 
                    key={idx}
                    className={`flex justify-between items-center p-3 sm:p-4 rounded-lg sm:rounded-xl ${schedule.highlight ? 'bg-white/10' : 'bg-white/5'} text-sm sm:text-base`}
                  >
                    <span className="font-medium truncate pr-2">{schedule.day}</span>
                    <span className={`font-bold ${schedule.special ? 'text-yellow-400' : 'text-white/70'} whitespace-nowrap`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                <p className="text-xs sm:text-sm text-white/60">
                  <span className="text-purple-400 font-bold">LPU Students:</span> Get 20% off on all custom designs with valid ID.
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN - FORM */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8"
            >
              {/* STATUS MESSAGES */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-400 mr-3 sm:mr-4" />
                    <div>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-green-300">Message Sent!</p>
                      <p className="text-xs sm:text-sm md:text-base text-green-400/80">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-400 mr-3 sm:mr-4" />
                    <div>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-red-300">Error Sending</p>
                      <p className="text-xs sm:text-sm md:text-base text-red-400/80">Please try again or contact us directly.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Send Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* NAME & EMAIL */}
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-2 sm:mb-3">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-white/30 text-sm sm:text-base"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-2 sm:mb-3">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-white/30 text-sm sm:text-base"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* SUBJECT */}
                <div>
                  <label className="block text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-2 sm:mb-3">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-white/30 text-sm sm:text-base"
                    placeholder="Design consultation request"
                  />
                </div>

                {/* CONTACT TYPE */}
                <div>
                  <label className="block text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-3 sm:mb-4">
                    Inquiry Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {contactTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`
                          relative flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center
                          ${formData.contactType === type.value 
                            ? `border-white bg-gradient-to-br ${type.color}/20` 
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="contactType"
                          value={type.value}
                          checked={formData.contactType === type.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-xl sm:text-2xl mb-1 sm:mb-2">{type.icon}</span>
                        <span className="text-[10px] sm:text-xs font-medium">
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="block text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-2 sm:mb-3">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-white/30 text-sm sm:text-base"
                    placeholder="Tell us about your 3D shoe design vision..."
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2 sm:pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full py-3 sm:py-4 md:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm
                      bg-gradient-to-r from-blue-600 to-purple-600 
                      hover:from-blue-700 hover:to-purple-700
                      disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed
                      text-white shadow-xl sm:shadow-2xl transition-all duration-300
                      flex items-center justify-center gap-2 sm:gap-3
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* FAQ SECTION */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="mt-6 sm:mt-8 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 md:p-8"
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 md:mb-8">Common Questions</h3>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  {
                    q: "How long does custom shoe production take?",
                    a: "Production takes 2-3 weeks. Rush orders (5-7 days) available for an additional 25% fee."
                  },
                  {
                    q: "Can LPU students visit the design studio?",
                    a: "Yes! Visit Block 32, LPU Campus. Book appointments via WhatsApp for personalized tours."
                  },
                  {
                    q: "Do you offer revisions on designs?",
                    a: "Unlimited revisions during design phase. Post-production modifications have additional charges."
                  },
                  {
                    q: "What materials do you work with?",
                    a: "Premium leather, sustainable fabrics, 3D-printed components, and smart materials."
                  }
                ].map((faq, index) => (
                  <div 
                    key={index}
                    className="group border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 hover:border-blue-500/30 transition-all cursor-pointer"
                  >
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer">
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold group-hover:text-blue-300 transition-colors pr-2">
                          {faq.q}
                        </h4>
                        <span className="text-white/50 group-open:rotate-180 transition-transform text-xs">▼</span>
                      </summary>
                      <p className="mt-2 sm:mt-3 md:mt-4 text-white/60 leading-relaxed text-sm sm:text-base">
                        {faq.a}
                      </p>
                    </details>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LOCATION SECTION */}
      <section className="py-10 sm:py-14 md:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden"
          >
            <div className="p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Design Studio Location</h3>
                  <p className="text-white/60 text-sm sm:text-base">Lovely Professional University Campus</p>
                </div>
                
                <button
                  onClick={openGoogleMaps}
                  className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold uppercase tracking-widest text-[10px] sm:text-xs hover:scale-105 transition whitespace-nowrap"
                >
                  Get Directions
                </button>
              </div>
              
              <div className="h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 mb-6 sm:mb-8">
                <iframe
                  title="LPU Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3410.8654506643735!2d75.70286257531632!3d31.254999374365718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5a5747a9e91f%3A0xb74c8d90d2f0170e!2sLovely%20Professional%20University!5e0!3m2!1sen!2sin!4v1702400000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-1 sm:mb-2">Address</p>
                  <p className="text-sm sm:text-base md:text-lg">Block 32, Design Innovation Center</p>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">LPU, Phagwara, Punjab 144411</p>
                </div>
                <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-1 sm:mb-2">Campus Hours</p>
                  <p className="text-sm sm:text-base md:text-lg">Mon-Sat: 9AM-6PM</p>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">Sunday: By Appointment</p>
                </div>
                <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs sm:text-sm uppercase tracking-widest text-white/50 mb-1 sm:mb-2">Student Benefits</p>
                  <p className="text-sm sm:text-base md:text-lg">20% Discount</p>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">Valid LPU ID Required</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 sm:py-20 md:py-32 text-center px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[6rem] font-light mb-4 sm:mb-6 md:mb-8 leading-tight">
          Ready to design <br />
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            your masterpiece?
          </span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8 sm:mt-12">
          <Link
            to="/designer"
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition inline-flex items-center justify-center gap-2"
          >
            <Palette size={14} />
            Start Designing
          </Link>
          
          <a
            href="https://wa.me/919219447537"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 bg-white/10 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition inline-flex items-center justify-center gap-2"
          >
            <Zap size={14} />
            Quick Chat
          </a>
        </div>
      </section>
    </div>
  );
};

export default Contact;