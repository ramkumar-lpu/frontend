import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { FiLogOut, FiUser, FiFolder } from 'react-icons/fi';
import shoecreatifyLogo from '../assets/logo.png';
import { MdOutlineImage } from 'react-icons/md';

const Navbar = ({ user, onLogout, cartCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/designer', label: 'Studio', requiresAuth: true },
    { path: '/suggestions', label: 'CratMan', requiresAuth: true },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
          isScrolled
            ? 'py-2 md:py-3 bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-sm'
            : 'py-4 md:py-6 bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex justify-between items-center">
          
          {/* LOGO - Responsive */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-black rounded-lg sm:rounded-xl overflow-hidden"
            >
              <img
                src={shoecreatifyLogo}
                alt="Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 object-contain invert"
              />
            </motion.div>
            <span className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-gray-600 whitespace-nowrap">
              ShoeCraftify
            </span>
          </Link>

          {/* DESKTOP NAV - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center bg-gray-100/50 p-1 rounded-full border border-black/5 mx-4">
            {navItems.map((item) => {
              if (item.requiresAuth && !user) return null;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 xl:px-6 py-2 text-[10px] uppercase tracking-[0.15em] font-bold transition-all ${
                    active ? 'text-white' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-black rounded-full"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT ACTIONS - Responsive spacing */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            
            {/* CART - Responsive icon size */}
            <Link 
              to="/cart" 
              className="relative p-2 sm:p-3 bg-gray-100 rounded-full hover:bg-black hover:text-white transition flex items-center justify-center"
            >
              <FaShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[8px] sm:text-[9px] flex items-center justify-center rounded-full font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* USER SECTION - Responsive adjustments */}
            {user ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 sm:gap-3 p-1 pl-2 sm:pl-3 md:pl-4 bg-gray-100 rounded-full border border-black/5"
                  onClick={() => {
                    // On mobile, go straight to profile since hover dropdown is not practical
                    if (isMobile) {
                      navigate('/profile');
                    }
                  }}
                >
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hidden sm:block">
                    {user.firstName || 'Account'}
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.firstName?.charAt(0) || 'U'}
                  </div>
                </button>

                {/* DROPDOWN - Responsive positioning */}
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-black/5 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 sm:p-4 border-b text-xs sm:text-sm font-semibold truncate">
                    {user.email}
                  </div>
                  <div className="space-y-1 text-xs font-bold uppercase tracking-widest">
                    <DropdownLink to="/profile" icon={<FiUser />} label="Profile" />
                    <DropdownLink to="/my-designs" icon={<MdOutlineImage />} label="My Designs" />
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl text-xs"
                    >
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-black text-white px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  Login
                </button>
              </Link>
            )}

            {/* MOBILE MENU BUTTON - Only show on mobile/tablet */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 sm:p-3 bg-gray-100 rounded-full flex items-center justify-center"
              aria-label="Open menu"
            >
              <FaBars className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE MENU - Improved responsive menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/50 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-[201] w-full max-w-sm bg-white flex flex-col shadow-2xl lg:hidden"
            >
              <div className="p-4 sm:p-6 flex justify-between items-center border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <img src={shoecreatifyLogo} alt="Logo" className="w-11 h-11 object-contain invert" />
                  </div>
                  <span className="font-black text-lg sm:text-xl">ShoeCraftify</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  aria-label="Close menu"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="space-y-1 mb-8">
                  {navItems.map((item, i) => {
                    if (item.requiresAuth && !user) return null;
                    
                    return (
                      <motion.div 
                        key={item.path} 
                        initial={{ x: -20 }} 
                        animate={{ x: 0 }} 
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center px-4 py-4 rounded-xl text-lg sm:text-xl font-bold uppercase tracking-tight transition ${
                            isActive(item.path) 
                              ? 'bg-black text-white' 
                              : 'text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          {item.label}
                          {isActive(item.path) && (
                            <span className="ml-auto text-sm font-normal">✓</span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* MOBILE USER SECTION */}
                {user ? (
                  <div className="border-t pt-6 space-y-4">
                    <div className="px-4">
                      <div className="text-sm text-gray-500">Logged in as</div>
                      <div className="font-semibold truncate">{user.email}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <MobileMenuItem 
                        to="/profile" 
                        icon={<FiUser />} 
                        label="Profile" 
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <MobileMenuItem 
                        to="/my-designs" 
                        icon={<MdOutlineImage />} 
                        label="My Designs" 
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 rounded-xl text-left"
                      >
                        <FiLogOut /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-6">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full bg-black text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest">
                        Login / Sign Up
                      </button>
                    </Link>
                  </div>
                )}
              </div>
              
              {/* CART IN MOBILE MENU */}
              <div className="border-t p-4">
                <Link 
                  to="/cart" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  <FaShoppingCart />
                  <span className="font-bold">View Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const DropdownLink = ({ to, icon, label }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-600 hover:bg-gray-50 rounded-lg sm:rounded-xl text-xs sm:text-sm"
  >
    {icon} <span className="whitespace-nowrap">{label}</span>
  </Link>
);

const MobileMenuItem = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-4 text-gray-700 hover:bg-gray-100 rounded-xl transition"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export default Navbar;