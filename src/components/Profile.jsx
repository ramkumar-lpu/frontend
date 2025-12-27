import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { saveUser, getUser, saveDesign, getDesigns } from '../utils/indexedDB';
import {
  Edit3,
  Share2,
  Bell,
  Calendar,
  Zap,
  CheckCircle,
  Plus,
  AlertCircle,
  Users,
  Camera,
  Lock,
  Mail,
  User,
  LogOut,
  ChevronRight,
  Eye,
  BarChart2
} from 'lucide-react';

const Profile = ({ user, updateUser }) => {
  const [activeTab, setActiveTab] = useState('designs');
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [notification, setNotification] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showAllRecentDesigns, setShowAllRecentDesigns] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Updated Cloudinary upload function with backend integration
  const uploadToCloudinary = useCallback(async (file) => {
    try {
      console.log('Starting profile picture upload for user:', user?.email || user?._id);
      
      // Convert file to base64 for backend
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64Image = await base64Promise;
      
      console.log('Base64 conversion complete, size:', base64Image.length);
      
      // Upload via your new backend route
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANT: sends cookies for authentication
        body: JSON.stringify({
          base64Image,
          // userId will be extracted from auth token in backend
        }),
      });
      
      const data = await response.json();
      
      console.log('Backend response:', data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      console.log('Profile picture uploaded successfully:', data.profilePictureUrl);
      return data.profilePictureUrl;
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      
      // More user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes('No authentication token')) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (error.message.includes('Invalid token')) {
        errorMessage = 'Invalid session. Please log in again.';
      }
      
      throw new Error(errorMessage);
    }
  }, [user]);

  // Notification helper
  const showNotificationMessage = useCallback((message, type = 'success') => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => () => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
  }, []);

  // Sync editForm with user when user changes (preserve profileImage from IndexedDB)
  useEffect(() => {
    if (user) {
      setEditForm(prev => ({
        ...user,
        // Preserve profileImage if it exists in either user or previous editForm
        profileImage: user.profileImage || prev?.profileImage
      }));
    }
  }, [user?.id, user?._id, user?.profileImage, user?.email]);

  // Fetch designs: API first, then IndexedDB (merge both, de-dupe)
  useEffect(() => {
    const fetchDesigns = async () => {
      setIsLoading(true);
      try {
        // Check session auth and refresh user data
        const authRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/user`, { credentials: 'include' });
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.success && authData.user) {
            // Get cached user from IndexedDB to preserve profileImage
            const cachedUser = await getUser();
            const mergedUser = {
              ...authData.user,
              profileImage: authData.user.profileImage || cachedUser?.profileImage
            };
            
            // Save merged data to IndexedDB for persistence
            await saveUser(mergedUser);
            updateUser(mergedUser);
            setEditForm(mergedUser);
          }
        }

        // API designs (Suggestions saves here)
        let apiDesigns = [];
        const apiRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/designs/my-designs`, { credentials: 'include' });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && Array.isArray(apiData.designs)) {
            apiDesigns = apiData.designs.map(d => ({
              id: d._id,
              name: d.name,
              colors: d.customization?.colors || {},
              preview: d.imageUrl,
              imageUrl: d.imageUrl,
              createdAt: d.createdAt,
              category: 'AI Design',
              emoji: '✨'
            }));
          }
        }

        // IndexedDB designs (Designer saves here)
        let localDesigns = [];
        const savedDesigns = await getDesigns(user?._id || user?.id);
        if (Array.isArray(savedDesigns) && savedDesigns.length > 0) {
          localDesigns = savedDesigns.map(d => ({
            id: d.id,
            name: d.name,
            colors: d.colors || {},
            preview: d.preview,
            createdAt: d.createdAt,
            category: 'Custom Design',
            emoji: '👟'
          }));
        }

        // Merge and de-dupe (prefer API version)
        const map = new Map();
        [...localDesigns, ...apiDesigns].forEach(d => {
          const key = d.id || `${d.name}-${d.createdAt}`;
          map.set(key, d);
        });

        const merged = Array.from(map.values()).sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setDesigns(merged);
      } catch (err) {
        console.error('Error loading designs:', err);
        showNotificationMessage('Failed to load designs', 'error');
        setDesigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigns();
  }, []); // Only fetch once on mount

  // Keep in sync with IndexedDB changes (when designs are saved from Designer)
  useEffect(() => {
    const refreshDesigns = async () => {
      try {
        // Get fresh designs from IndexedDB
        const savedDesigns = await getDesigns(user?._id || user?.id);
        if (Array.isArray(savedDesigns) && savedDesigns.length > 0) {
          const localDesigns = savedDesigns.map(d => ({
            id: d.id,
            name: d.name,
            colors: d.colors || {},
            preview: d.preview,
            createdAt: d.createdAt,
            category: 'Custom Design',
            emoji: '👟'
          }));
          
          // Merge with existing to keep API items
          const map = new Map();
          [...localDesigns, ...designs].forEach(d => {
            const key = d.id || `${d.name}-${d.createdAt}`;
            map.set(key, d);
          });
          setDesigns(Array.from(map.values()).sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }));
        }
      } catch (error) {
        console.error('Error syncing designs from IndexedDB:', error);
      }
    };

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'savedShoeDesigns' || e.key === 'user') {
        refreshDesigns();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id, user?._id]); // Only depend on user ID, not designs

  // Stats
  const designStats = useMemo(() => {
    const total = designs?.length || 0;
    const weekAgo = new Date(); 
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(); 
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const thisWeek = (designs || []).filter(d => d?.createdAt && new Date(d.createdAt) >= weekAgo).length;
    const thisMonth = (designs || []).filter(d => d?.createdAt && new Date(d.createdAt) >= monthAgo).length;
    return { total, thisWeek, thisMonth };
  }, [designs]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const designCount = designs.length;
    const level = Math.floor(designCount / 5) + 1;
    const xp = designCount * 100;
    const nextLevelXp = level * 500;
    const rank =
      designCount >= 20 ? 'Expert Designer' :
      designCount >= 10 ? 'Advanced Designer' :
      designCount >= 5 ? 'Intermediate Designer' :
      designCount >= 1 ? 'Beginner Designer' : 'New Designer';
    return { level, xp, nextLevelXp, rank };
  }, [designs.length]);

  // Tabs - Removed Achievements tab
  const tabs = useMemo(() => [
    { id: 'designs', label: 'My Designs', icon: '', count: designs.length },
    { id: 'stats', label: 'Statistics', icon: '', count: null },
    { id: 'settings', label: 'Settings', icon: '⚙️', count: null },
  ], [designs.length]);

  // Handlers
  const handleEditProfile = useCallback(async () => {
    try {
      // Save to database
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          profileImage: editForm.profileImage
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showNotificationMessage(data.error || 'Failed to update profile', 'error');
        return;
      }

      // Update App.jsx state
      await updateUser(data.user);
      setEditingProfile(false);
      showNotificationMessage('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showNotificationMessage('Failed to update profile', 'error');
    }
  }, [editForm, updateUser, showNotificationMessage]);
  
  // Updated handleImageUpload with backend integration
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showNotificationMessage('Upload JPG, PNG, GIF, or WebP', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotificationMessage('Image must be < 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile/upload-profile-picture`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      // ✅ Always check response.ok first
      if (!response.ok) {
        let errorMsg = `Upload failed (${response.status})`;
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error || errorMsg;
        } catch (e) {
          // response is not JSON
        }
        showNotificationMessage(errorMsg, 'error');
        return;
      }

      const data = await response.json();

      // ✅ Validate response exists and has required fields
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid server response');
      }

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      if (!data.profilePictureUrl) {
        throw new Error('No image URL in response');
      }

      console.log('Profile picture uploaded:', data.profilePictureUrl);

      const updatedUser = { ...user, profileImage: data.profilePictureUrl };
      await updateUser(updatedUser);
      
      // Save to IndexedDB for persistence (better than localStorage for large files)
      await saveUser(updatedUser);
      
      setEditForm(prev => ({ ...prev, profileImage: data.profilePictureUrl }));
      showNotificationMessage('Profile picture updated!', 'success');

    } catch (err) {
      console.error('Upload error:', err);
      showNotificationMessage(err?.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [user, updateUser, showNotificationMessage]);

  const handlePasswordChange = useCallback(async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showNotificationMessage('Fill all password fields', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotificationMessage('Passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotificationMessage('Min 6 characters', 'error');
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, { withCredentials: true });
      showNotificationMessage('Password changed!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordFields(false);
    } catch (err) {
      showNotificationMessage(err.response?.data?.message || 'Failed to change password', 'error');
    }
  }, [passwordData, showNotificationMessage]);

  const handleShareDesign = useCallback((design) => {
    const shareText = `Check out my shoe design: ${design.name}`;
    if (navigator.share) {
      navigator.share({ title: design.name, text: shareText, url: window.location.origin + '/my-designs' })
        .catch(err => console.error('Share error:', err));
    } else {
      navigator.clipboard.writeText(window.location.origin + '/my-designs');
      showNotificationMessage('Link copied to clipboard!', 'success');
    }
  }, [showNotificationMessage]);

  const handleLogout = useCallback(async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      showNotificationMessage('Failed to logout', 'error');
    }
  }, [showNotificationMessage]);

  // Recent designs to show in sidebar (limited to 3 or 5 with view all option)
  const recentDesignsToShow = useMemo(() => {
    if (showAllRecentDesigns) {
      return designs.slice(0, 5); // Show 5 when "View All" is clicked
    }
    return designs.slice(0, 3); // Show 3 by default
  }, [designs, showAllRecentDesigns]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-6 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ProfileHeader user={user} designCount={designs.length} />

        {/* Toast */}
        <NotificationToast notification={notification} />

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <ProfileSidebar
            user={user}
            editingProfile={editingProfile}
            editForm={editForm}
            performanceMetrics={performanceMetrics}
            designStats={designStats}
            recentDesignsToShow={recentDesignsToShow}
            designsCount={designs.length}
            showAllRecentDesigns={showAllRecentDesigns}
            fileInputRef={fileInputRef}
            uploadingImage={uploadingImage}
            onEditFormChange={setEditForm}
            onEditProfile={handleEditProfile}
            onCancelEdit={() => setEditingProfile(false)}
            onStartEdit={() => setEditingProfile(true)}
            onImageUpload={handleImageUpload}
            onToggleRecentDesigns={() => setShowAllRecentDesigns(!showAllRecentDesigns)}
          />

          {/* Main */}
          <div className="lg:col-span-2">
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            <AnimatePresence mode="wait">
              {activeTab === 'designs' && (
                <DesignsTab
                  designs={designs}
                  isLoading={isLoading}
                  onShare={handleShareDesign}
                  onSelectDesign={setSelectedDesign}
                />
              )}
              {activeTab === 'stats' && (
                <StatsTab designStats={designStats} designs={designs} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab
                  user={user}
                  fileInputRef={fileInputRef}
                  uploadingImage={uploadingImage}
                  showPasswordFields={showPasswordFields}
                  passwordData={passwordData}
                  onImageUpload={handleImageUpload}
                  onPasswordDataChange={setPasswordData}
                  onTogglePasswordFields={() => setShowPasswordFields(!showPasswordFields)}
                  onPasswordChange={handlePasswordChange}
                  onLogout={handleLogout}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DesignDetailModal design={selectedDesign} onClose={() => setSelectedDesign(null)} />
    </div>
  );
};

// Hook to compute achievements (kept responsive-friendly)
const useAchievements = (designs, designStats) => useMemo(() => {
  const total = designs.length;
  return [
    { id: 1, name: 'First Steps', description: 'Create your first design', icon: '🎯', unlocked: total >= 1, progress: Math.min(total, 1), total: 1 },
    { id: 2, name: 'Getting Started', description: 'Create 5 designs', icon: '🚀', unlocked: total >= 5, progress: Math.min(total, 5), total: 5 },
    { id: 3, name: 'Design Pro', description: 'Create 10 designs', icon: '⭐', unlocked: total >= 10, progress: Math.min(total, 10), total: 10 },
    { id: 4, name: 'Master Creator', description: 'Create 20 designs', icon: '👑', unlocked: total >= 20, progress: Math.min(total, 20), total: 20 },
    { id: 5, name: 'Prolific Designer', description: 'Create 50 designs', icon: '💎', unlocked: total >= 50, progress: Math.min(total, 50), total: 50 },
    { id: 6, name: 'Weekly Warrior', description: 'Create 3 designs in one week', icon: '⚡', unlocked: designStats.thisWeek >= 3, progress: Math.min(designStats.thisWeek, 3), total: 3 },
  ];
}, [designs.length, designStats.thisWeek]);

// Header
const ProfileHeader = React.memo(({ user, designCount }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
          Welcome back, {user?.firstName || 'Designer'}! 👋
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {designCount > 0
            ? `You have ${designCount} custom design${designCount !== 1 ? 's' : ''}`
            : 'Start your creative journey by designing your first shoe'}
        </p>
      </div>
      <button
        onClick={() => window.location.href = '/designer'}
        className="mt-2 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg text-sm sm:text-base"
      >
        <Plus size={18} />
        New Design
      </button>
    </div>
  </motion.div>
));
ProfileHeader.displayName = 'ProfileHeader';

// Toast
const NotificationToast = React.memo(({ notification }) => {
  if (!notification) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 right-4 z-50">
        <div className={`px-4 sm:px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm sm:text-base">{notification.message}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
NotificationToast.displayName = 'NotificationToast';

// Sidebar
const ProfileSidebar = React.memo(({
  user,
  editingProfile,
  editForm,
  performanceMetrics,
  designStats,
  recentDesignsToShow,
  designsCount,
  showAllRecentDesigns,
  fileInputRef,
  uploadingImage,
  onEditFormChange,
  onEditProfile,
  onCancelEdit,
  onStartEdit,
  onImageUpload,
  onToggleRecentDesigns
}) => (
  <div className="lg:col-span-1 space-y-6">
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm backdrop-blur-sm inline-block mb-2">
            {performanceMetrics.rank}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            {user?.firstName || 'Designer'} {user?.lastName || ''}
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm">{user?.email || ''}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
            <Calendar size={12} />
            <span>
              Joined {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'Recently'}
            </span>
          </div>
        </div>
        {!editingProfile && (
          <button onClick={onStartEdit} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Edit3 size={18} />
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="relative mb-8">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-xl overflow-hidden">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { 
                  console.error('Profile image failed to load:', user.profileImage);
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-white">
                      ${user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transition-colors disabled:opacity-50"
          >
            {uploadingImage ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              </div>
            ) : (
              <Camera size={18} />
            )}
          </button>
          <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
          LEVEL {performanceMetrics.level}
        </div>
      </div>

      {/* XP */}
      <div className="mb-8">
        <div className="flex justify-between text-xs sm:text-sm mb-2">
          <span className="text-gray-300">Progress to Level {performanceMetrics.level + 1}</span>
          <span className="text-white font-medium">{performanceMetrics.xp}/{performanceMetrics.nextLevelXp} XP</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(performanceMetrics.xp / performanceMetrics.nextLevelXp) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {performanceMetrics.nextLevelXp - performanceMetrics.xp} XP needed for next level
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <QuickStat label="Total" value={designStats.total} />
        <QuickStat label="This Week" value={designStats.thisWeek} />
        <QuickStat label="This Month" value={designStats.thisMonth} />
      </div>

      {/* Edit form */}
      {editingProfile ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editForm.firstName || ''}
            onChange={(e) => onEditFormChange({ ...editForm, firstName: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            placeholder="First Name"
          />
          <input
            type="text"
            value={editForm.lastName || ''}
            onChange={(e) => onEditFormChange({ ...editForm, lastName: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            placeholder="Last Name"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={onEditProfile} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-opacity">
              Save Changes
            </button>
            <button onClick={onCancelEdit} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => window.location.href = '/designer'}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <div className="flex items-center justify-center gap-2">
            <Plus size={20} />
            <span>Create New Design</span>
          </div>
        </button>
      )}
    </motion.div>

    {/* Recent Designs - Moved to right side and limited */}
    {recentDesignsToShow.length > 0 && (
      <RecentDesignsCard 
        designs={recentDesignsToShow}
        designsCount={designsCount}
        showAll={showAllRecentDesigns}
        onToggleView={onToggleRecentDesigns}
      />
    )}
  </div>
));
ProfileSidebar.displayName = 'ProfileSidebar';

const QuickStat = ({ label, value }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors">
    <div className="text-xl sm:text-2xl font-bold mb-1">{value ?? 0}</div>
    <div className="text-xs text-gray-300">{label}</div>
  </div>
);

// Recent designs - Updated with toggle functionality
const RecentDesignsCard = React.memo(({ designs, designsCount, showAll, onToggleView }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Designs</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {showAll ? 'Showing 5 recent designs' : 'Showing 3 recent designs'}
        </p>
      </div>
      {designsCount > 3 && (
        <button
          onClick={onToggleView}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          <Eye size={16} />
          {showAll ? 'Show Less' : 'View All'}
        </button>
      )}
    </div>
    <div className="space-y-3 mb-4">
      {designs.map((design) => (
        <motion.div key={design.id} whileHover={{ x: 5 }} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" onClick={() => window.location.href = '/my-designs'}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0 shadow-md" style={{ backgroundColor: design.colors?.body || '#FFFFFF', border: '1px solid #e5e7eb' }}>
            {design.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{design.name}</div>
            <div className="text-xs text-gray-500">{new Date(design.createdAt).toLocaleDateString()}</div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </motion.div>
      ))}
    </div>
    {designsCount > 5 && (
      <button onClick={() => window.location.href = '/my-designs'} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-opacity text-sm">
        View All {designsCount} Designs →
      </button>
    )}
  </motion.div>
));
RecentDesignsCard.displayName = 'RecentDesignsCard';

// Tabs
const TabNavigation = React.memo(({ tabs, activeTab, onTabChange }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
    <div className="flex overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 min-w-[120px] py-3 sm:py-4 px-4 sm:px-6 font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
            activeTab === tab.id ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span className="text-base sm:text-lg">{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.count !== null && (
            <span className={`ml-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 text-gray-700'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  </motion.div>
));
TabNavigation.displayName = 'TabNavigation';
const DesignsTab = React.memo(({ designs, isLoading, onShare, onSelectDesign }) => {
  const displayDesigns = designs.slice(0, 4); // show only first 4
  return (
    <motion.div key="designs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          My Designs {designs.length > 0 && `(${designs.length})`}
        </h2>
        <button
          onClick={() => window.location.href = '/designer'}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm sm:text-base"
        >
          <Plus size={16} />
          New Design
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : designs.length === 0 ? (
        <EmptyDesignsState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayDesigns.map((design) => (
              <DesignCard key={design.id} design={design} onShare={onShare} onClick={() => onSelectDesign(design)} />
            ))}
          </div>
          {designs.length > 4 && (
            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = '/my-designs'}
                className="mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View all designs →
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
});

DesignsTab.displayName = 'DesignsTab';

// Empty state
const EmptyDesignsState = React.memo(() => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-10 sm:p-12 text-center">
    <div className="text-6xl sm:text-7xl mb-6 animate-bounce">👟</div>
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Designs Yet</h3>
    <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm sm:text-base">Start your creative journey by designing your first custom shoe. It's easy and fun!</p>
    <button
      onClick={() => window.location.href = '/designer'}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-3 shadow-lg text-sm sm:text-lg font-semibold"
    >
      <Plus size={20} />
      Create Your First Design
    </button>
  </motion.div>
));
EmptyDesignsState.displayName = 'EmptyDesignsState';

// Design card
const DesignCard = React.memo(({ design, onShare, onClick }) => (
  <motion.div whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 cursor-pointer" onClick={onClick}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {design.preview ? (
          <img src={design.preview} alt={design.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 shadow-md object-contain bg-gray-50" />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-md border border-gray-200" style={{ backgroundColor: design.colors?.body || '#FFFFFF' }}>
            {design.emoji}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate mb-1">{design.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500">{design.category}</p>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-1">Created {new Date(design.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 sm:gap-3 mb-4">
      <div className="flex-1 bg-gray-50 rounded-lg p-2.5 sm:p-3 text-center">
        <div className="text-lg sm:text-xl font-bold" style={{ color: design.colors?.body || '#000000' }}>●</div>
        <div className="text-[11px] sm:text-xs text-gray-600">Primary Color</div>
      </div>
      <div className="flex-1 bg-gray-50 rounded-lg p-2.5 sm:p-3 text-center">
        <div className="text-lg sm:text-xl font-bold text-gray-900">
          {new Date(design.createdAt).toLocaleDateString('en-US', { month: 'short' })}
        </div>
        <div className="text-[11px] sm:text-xs text-gray-600">Created</div>
      </div>
    </div>

    <div className="flex gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); window.location.href = '/designer'; }}
        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
      >
        <Edit3 size={16} />
        Edit
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onShare(design); }}
        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-opacity font-medium text-sm"
      >
        <Share2 size={16} />
        Share
      </button>
    </div>
  </motion.div>
));
DesignCard.displayName = 'DesignCard';

// Stats tab
const StatsTab = React.memo(({ designStats, designs }) => {
  const timeStats = useMemo(() => {
    if (!designs || designs.length === 0) return { oldestDate: null, newestDate: null, daysSinceFirst: 0 };
    try {
      const validDates = designs
        .filter(d => d && d.createdAt)
        .map(d => new Date(d.createdAt).getTime())
        .filter(time => !isNaN(time));
      
      if (validDates.length === 0) return { oldestDate: null, newestDate: null, daysSinceFirst: 0 };
      
      const oldest = Math.min(...validDates);
      const daysSinceFirst = Math.floor((Date.now() - oldest) / (1000 * 60 * 60 * 24));
      return { oldestDate: new Date(oldest).toLocaleDateString(), daysSinceFirst };
    } catch (error) {
      console.error('Error calculating time stats:', error);
      return { oldestDate: null, newestDate: null, daysSinceFirst: 0 };
    }
  }, [designs]);

  const avgPerWeek = useMemo(() => {
    if (!designs || designs.length === 0 || !timeStats || timeStats.daysSinceFirst === 0) return 0;
    const weeks = Math.max(timeStats.daysSinceFirst / 7, 1);
    return (designs.length / weeks).toFixed(1);
  }, [designs.length, timeStats.daysSinceFirst]);

  return (
    <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Your Statistics</h2>
      {designs.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-10 sm:p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Statistics Yet</h3>
          <p className="text-gray-600">Create designs to see your statistics</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<BarChart2 className="w-7 h-7 sm:w-8 sm:h-8" />} label="Total Designs" value={designStats.total} color="from-blue-500 to-cyan-500" subtitle={`${designStats.thisWeek} this week`} />
            <StatCard icon={<Zap className="w-7 h-7 sm:w-8 sm:h-8" />} label="Avg per Week" value={avgPerWeek} color="from-purple-500 to-pink-500" subtitle="Design frequency" />
            <StatCard icon={<Calendar className="w-7 h-7 sm:w-8 sm:h-8" />} label="Days Active" value={timeStats.daysSinceFirst} color="from-green-500 to-emerald-500" subtitle={`Since ${timeStats.oldestDate}`} />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Activity Timeline</h3>
            <div className="space-y-4">
              <TimelineRow label="This Week" value={designStats.thisWeek} color="blue" />
              <TimelineRow label="This Month" value={designStats.thisMonth} color="purple" />
              <TimelineRow label="All Time" value={designStats.total} color="green" />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
});
StatsTab.displayName = 'StatsTab';

const StatCard = React.memo(({ icon, label, value, color, subtitle }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg">
    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${color} text-white mb-4`}>{icon}</div>
    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value ?? 0}</div>
    <div className="text-gray-700 font-medium mb-1">{label}</div>
    <div className="text-sm text-gray-500">{subtitle ?? ''}</div>
  </motion.div>
));
StatCard.displayName = 'StatCard';

const TimelineRow = ({ label, value, color }) => (
  <div className={`flex justify-between items-center p-4 bg-${color}-50 rounded-lg`}>
    <div>
      <div className="font-medium text-gray-900">{label}</div>
      <div className="text-sm text-gray-600">Progress</div>
    </div>
    <div className={`text-2xl font-bold text-${color}-600`}>{value ?? 0}</div>
  </div>
);

// Settings tab - REMOVED NOTIFICATIONS SECTION
const SettingsTab = React.memo(({ 
  user, 
  fileInputRef, 
  uploadingImage,
  showPasswordFields,
  passwordData,
  onImageUpload, 
  onPasswordDataChange,
  onTogglePasswordFields,
  onPasswordChange,
  onLogout
}) => (
  <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-6">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Account Settings</h2>

    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-8">
      {/* Profile picture */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera size={18} />
          Profile Picture
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-lg overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
            >
              {uploadingImage ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Camera size={16} />}
            </button>
            <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-gray-700 font-medium mb-1">Update your profile picture</p>
            <p className="text-sm text-gray-500 mb-3">JPG, PNG, GIF or WebP (max 10MB)</p>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {uploadingImage ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={18} />
          Account Information
        </h3>
        <div className="space-y-3">
          <InfoRow label="Full Name" value={`${user?.firstName || ''} ${user?.lastName || ''}`} />
          <InfoRow label="Email Address" value={user?.email || ''} />
          <InfoRow label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'} />
        </div>
      </div>

      {/* Password */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={18} />
          Password & Security
        </h3>
        {!showPasswordFields ? (
          <button onClick={onTogglePasswordFields} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
            Change Password
          </button>
        ) : (
          <div className="space-y-3">
            <input type="password" placeholder="Current Password" value={passwordData.currentPassword} onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500" />
            <input type="password" placeholder="New Password" value={passwordData.newPassword} onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500" />
            <input type="password" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500" />
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={onPasswordChange} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors">Update Password</button>
              <button onClick={onTogglePasswordFields} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="pt-6 border-t border-gray-200">
        <button onClick={onLogout} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  </motion.div>
));
SettingsTab.displayName = 'SettingsTab';

const InfoRow = ({ label, value }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    <div className="font-medium text-gray-900 break-words">{value}</div>
  </div>
);

// Detail modal
const DesignDetailModal = React.memo(({ design, onClose }) => {
  if (!design) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {design.preview ? (
                <img src={design.preview} alt={design.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mb-4 shadow-lg object-contain bg-gray-50" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl mb-4 shadow-lg" style={{ backgroundColor: design.colors?.body || '#FFFFFF' }}>
                  {design.emoji}
                </div>
              )}
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{design.name}</h3>
              <p className="text-gray-600">{design.category}</p>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <Calendar size={14} />
                Created: {new Date(design.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: design.colors?.body || '#000000' }}>●</div>
              <div className="text-sm text-gray-600 font-medium">Primary Color</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {Math.floor((Date.now() - new Date(design.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
              </div>
              <div className="text-sm text-gray-600 font-medium">Days Old</div>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => window.location.href = '/designer'} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold py-3 sm:py-4 rounded-xl transition-opacity flex items-center justify-center gap-2 shadow-lg">
              <Edit3 size={20} />
              Edit Design
            </button>
            <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 sm:py-4 rounded-xl transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
DesignDetailModal.displayName = 'DesignDetailModal';

export default React.memo(Profile);