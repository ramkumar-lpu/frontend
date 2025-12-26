import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Box, Send, Heart, Check, Star, User, AlertCircle } from 'lucide-react';

const Suggestion = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      localStorage.removeItem('user');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // --- Download Logic ---
  const handleDownload = async () => {
    if (!image) return;
    
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ShoeCraftify-${Date.now()}.png`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('Image downloaded successfully!', 'success');
    } catch (err) {
      console.error("Download failed", err);
      showToast("Failed to download image", 'error');
    }
  };

// In Suggestions.jsx - update handleSaveDesign
const handleSaveDesign = async () => {
  if (!image || !prompt) {
    showToast("Please generate a design first", 'error');
    return;
  }
  
  if (!user) {
    showToast("Please login to save designs", 'error');
    handleLogin();
    return;
  }
  
  setSaving(true);
  try {
    // Upload AI-generated image to Cloudinary
    let cloudinaryUrl = image; // AI images might already be URLs
    
    // If it's a base64 image, upload to Cloudinary
    if (image.startsWith('data:image')) {
      try {
        showToast("Uploading to cloud storage...", 'info');
        
        const uploadRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/designs/upload-base64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ base64Image: image })
        });
        
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          cloudinaryUrl = uploadData.imageUrl;
          console.log('Uploaded to Cloudinary:', cloudinaryUrl);
        } else {
          console.warn('Cloudinary upload failed, using original image');
          showToast("Using original image (upload failed)", 'warning');
        }
      } catch (uploadError) {
        console.warn('Cloudinary upload error:', uploadError);
        showToast("Using original image (network error)", 'warning');
      }
    }
    
    console.log('Saving design with URL:', cloudinaryUrl.substring(0, 100) + '...');
    
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/designs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        name: prompt.substring(0, 50),
        description: prompt,
        imageUrl: cloudinaryUrl,
        templateId: Date.now(),
        price: 0,
        customization: {
          type: 'ai-generated',
          prompt: prompt,
          cloudinary: cloudinaryUrl !== image
        }
      }),
    });
    
    const data = await res.json();
    
    if (res.status === 401) {
      setUser(null);
      localStorage.removeItem('user');
      showToast("Session expired. Please login again.", 'error');
      return;
    }
    
    if (res.ok && data.success) {
      console.log('Design saved:', data.design);
      setIsSaved(true);
      showToast("Design saved successfully! Redirecting to My Designs...", 'success');
      
      // Also save to localStorage for offline access
      try {
        const saved = localStorage.getItem('savedShoeDesigns') || '[]';
        const designs = JSON.parse(saved);
        const newDesign = {
          id: Date.now(),
          name: prompt.substring(0, 50),
          description: prompt,
          imageUrl: cloudinaryUrl,
          _id: data.design._id, // Reference to backend
          userId: user.id || user._id,
          createdAt: new Date().toISOString(),
          type: 'ai-generated'
        };
        designs.push(newDesign);
        localStorage.setItem('savedShoeDesigns', JSON.stringify(designs));
      } catch (localError) {
        console.warn('Failed to save to localStorage:', localError);
      }
      
      setTimeout(() => {
        navigate('/my-designs', { 
          state: { 
            newlySavedDesign: {
              _id: data.design._id,
              id: Date.now(),
              name: prompt.substring(0, 50),
              description: prompt,
              imageUrl: cloudinaryUrl,
              createdAt: new Date().toISOString(),
              price: 0,
              designType: 'ai-generated'
            }
          }
        });
      }, 1500);
      
      setTimeout(() => setIsSaved(false), 5000);
    } else {
      const errorMsg = data.errors ? data.errors.join(', ') : (data.message || "Failed to save design");
      showToast(errorMsg, 'error');
    }
  } catch (err) {
    console.error("Failed to save design", err);
    showToast("Failed to save design. Please try again.", 'error');
  } finally {
    setSaving(false);
  }
};

  // --- Rate Design Logic ---
  const handleRateDesign = async () => {
    if (!image || !prompt || rating === 0) return;
    
    if (!user) {
      showToast("Please login to rate designs", 'error');
      return;
    }
    
    try {
      showToast(`Thank you for your ${rating} star rating!`, 'success');
      setShowRating(false);
      setRating(0);
    } catch (err) {
      console.error("Failed to rate design", err);
      showToast("Failed to submit rating", 'error');
    }
  };

  // --- Generate Image Logic ---
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast("Please enter a design prompt", 'error');
      return;
    }
    
    setLoading(true);
    setError('');
    setIsSaved(false);
    setShowRating(false);
    setRating(0);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shoe/generate-shoe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          setError('Invalid API Token. Please check your backend configuration.');
          showToast('AI service configuration error', 'error');
        } else if (res.status === 429) {
          setError('AI service is busy. Please try again in 30 seconds.');
          showToast('AI service is busy. Please wait...', 'error');
        } else {
          setError(data.error || 'Failed to generate design');
          showToast(data.error || 'Failed to generate design', 'error');
        }
        return;
      }
      
      if (data.success) {
        setImage(data.imageUrl);
        showToast("Design generated successfully!", 'success');
      } else {
        setError(data.error || 'Failed to generate design');
        showToast(data.error || 'Failed to generate design', 'error');
      }
    } catch (err) {
      console.error("Failed to generate shoe:", err);
      setError('Network error. Please check your connection and try again.');
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render star rating component
  const renderStarRating = () => (
    <div className="mt-4 p-4 bg-neutral-800/50 rounded-xl border border-white/10">
      <p className="text-sm text-neutral-300 mb-2">Rate this design:</p>
      <div className="flex items-center justify-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star 
              className={`w-6 h-6 ${star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`}
            />
          </button>
        ))}
      </div>
      <button
        onClick={handleRateDesign}
        disabled={rating === 0}
        className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        Submit Rating
      </button>
    </div>
  );

  // Clear error when user starts typing
  useEffect(() => {
    if (prompt.trim() && error) {
      setError('');
    }
  }, [prompt, error]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Authentication status indicator */}
      {/* <div className="fixed top-4 right-4 z-50">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm">
              <User className="w-4 h-4" />
              <span>{user.displayName || user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm hover:bg-red-500/30 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm transition-colors flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Login with Google
          </button>
        )}
      </div> */}

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            <p className="text-white font-medium flex items-center gap-2">
              {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col items-center mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            ShoeCraftify
          </h1>
          <p className="mt-4 text-neutral-400 max-w-md text-lg">
            Turn your imagination into premium 3D concepts with the power of generative AI.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="p-8 rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-xl shadow-2xl">
              <label className="block text-sm font-medium text-neutral-400 mb-4 uppercase tracking-wider">
                Design Prompt
              </label>
              <textarea
                rows="4"
                className="w-full bg-neutral-800 border border-white/5 rounded-2xl p-4 text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                placeholder="e.g. Cyberpunk high-top sneakers with neon accents..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              {/* Error message display */}
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full mt-6 bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Generate Design</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Action Buttons */}
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleSaveDesign}
                  disabled={!image || saving || isSaved}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : isSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Redirecting to My Designs...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Save to My Designs</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowRating(!showRating)}
                  disabled={!image}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Star className="w-4 h-4" />
                  <span>{showRating ? 'Cancel Rating' : 'Rate Design'}</span>
                </button>

                {showRating && image && renderStarRating()}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                <Box className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tighter">3D Ready</span>
              </div>
              <button
                onClick={handleDownload}
                disabled={!image}
                className={`p-4 rounded-2xl bg-white/5 border border-white/5 text-center transition-all ${
                  !image ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'
                }`}
              >
                <Download className="w-5 h-5 mx-auto mb-2 text-purple-400" />
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tighter">HD Export</span>
              </button>
              <button
                onClick={() => navigate('/my-designs')}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center hover:bg-white/10 cursor-pointer transition-all"
              >
                <Heart className="w-5 h-5 mx-auto mb-2 text-pink-400" />
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tighter">My Designs</span>
              </button>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                <Star className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-tighter">Rate It</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 aspect-square lg:aspect-video rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm overflow-hidden relative flex items-center justify-center shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" className="flex flex-col items-center gap-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                  <p className="text-neutral-400 animate-pulse font-medium tracking-wide">Synthesizing...</p>
                  <p className="text-neutral-500 text-sm">This may take 30-60 seconds</p>
                </motion.div>
              ) : image ? (
                <motion.div key="result" className="relative group w-full h-full p-8">
                  <img src={image} alt="Generated shoe design" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)]" />
                  <div className="absolute bottom-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={handleDownload}
                      className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={handleSaveDesign}
                      disabled={isSaved || saving}
                      className={`p-3 backdrop-blur-md rounded-full border transition-all ${
                        isSaved ? 'bg-green-500/20 border-green-500' : 'bg-indigo-600/20 border-indigo-500 hover:bg-indigo-500/30'
                      }`}
                      title={isSaved ? "Design Saved" : "Save Design"}
                    >
                      {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
                       isSaved ? <Check className="w-5 h-5" /> : 
                       <Heart className="w-5 h-5" />}
                    </button>

                    <button 
                      onClick={() => setShowRating(!showRating)}
                      className="p-3 bg-yellow-600/20 backdrop-blur-md rounded-full border border-yellow-500 hover:bg-yellow-500/30 transition-all"
                      title="Rate Design"
                    >
                      <Star className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowRating(false);
                        setRating(0);
                        handleGenerate();
                      }}
                      className="p-3 bg-indigo-600 rounded-full border border-indigo-400 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/40" 
                      title="Generate New Design"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="placeholder" className="text-center p-12">
                  <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Box className="w-10 h-10 text-neutral-600" />
                  </div>
                  <p className="text-neutral-500 text-lg max-w-xs mx-auto">
                    {prompt ? "Ready to generate your design!" : "Enter a prompt to generate your shoe design"}
                  </p>
                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg max-w-xs mx-auto">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Suggestion;