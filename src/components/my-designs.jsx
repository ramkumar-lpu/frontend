

// // // import React, { useState, useEffect } from 'react';
// // // import { useNavigate, useLocation } from 'react-router-dom';
// // // import { Download, Trash2, Edit, Heart, RefreshCw, ArrowLeft } from 'lucide-react';

// // // const MyDesigns = () => {
// // //   const [designs, setDesigns] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [user, setUser] = useState(null);
// // //   const [error, setError] = useState('');
// // //   const [deletingId, setDeletingId] = useState(null);
  
// // //   const navigate = useNavigate();
// // //   const location = useLocation();

// // //   // Check for newly saved design from navigation state
// // //   useEffect(() => {
// // //     if (location.state?.newlySavedDesign) {
// // //       console.log('Received newly saved design:', location.state.newlySavedDesign);
      
// // //       // Add the new design to the beginning of the list
// // //       setDesigns(prev => [location.state.newlySavedDesign, ...prev]);
      
// // //       // Clear the navigation state
// // //       window.history.replaceState({}, document.title);
// // //     }
// // //   }, [location.state]);

// // //   // Fetch designs from backend API
// // //   useEffect(() => {
// // //     fetchDesigns();
// // //   }, []);

// // //   // Helper function to validate MongoDB ObjectId
// // //   const isValidObjectId = (id) => {
// // //     // MongoDB ObjectId is 24 hex characters
// // //     return id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
// // //   };

// // //   // Get image URL from design object
// // //   const getDesignImageUrl = (design) => {
// // //     return design.cloudinaryUrl || design.imageUrl || design.preview || null;
// // //   };

// // //   const fetchDesigns = async () => {
// // //     try {
// // //       const userData = user || JSON.parse(localStorage.getItem('user'));
      
// // //       // 1. Try to fetch from backend API
// // //       let apiDesigns = [];
// // //       if (userData) {
// // //         try {
// // //           const res = await fetch('http://localhost:5000/api/designs/my-designs', {
// // //             credentials: 'include'
// // //           });
          
// // //           if (res.ok) {
// // //             const data = await res.json();
// // //             if (data.success) {
// // //               apiDesigns = data.designs || [];
// // //               console.log('API designs:', apiDesigns.length);
              
// // //               // Log design IDs for debugging
// // //               apiDesigns.forEach((design, index) => {
// // //                 console.log(`API Design ${index}:`, {
// // //                   _id: design._id,
// // //                   id: design.id,
// // //                   templateId: design.templateId,
// // //                   name: design.name
// // //                 });
// // //               });
// // //             }
// // //           }
// // //         } catch (apiError) {
// // //           console.warn('API fetch failed:', apiError.message);
// // //         }
// // //       }
      
// // //       // 2. Get designs from localStorage
// // //       let localDesigns = [];
// // //       try {
// // //         const saved = localStorage.getItem('savedShoeDesigns');
// // //         if (saved) {
// // //           const parsed = JSON.parse(saved);
// // //           // Filter by user if logged in
// // //           if (userData) {
// // //             localDesigns = parsed.filter(design => 
// // //               !design.userId || 
// // //               design.userId === userData.id || 
// // //               design.userId === userData._id
// // //             );
// // //           } else {
// // //             localDesigns = parsed.filter(design => !design.userId);
// // //           }
// // //           console.log('Local designs:', localDesigns.length);
          
// // //           // Log design IDs for debugging
// // //           localDesigns.forEach((design, index) => {
// // //             console.log(`Local Design ${index}:`, {
// // //               _id: design._id,
// // //               id: design.id,
// // //               templateId: design.templateId,
// // //               name: design.name
// // //             });
// // //           });
// // //         }
// // //       } catch (localError) {
// // //         console.error('Error loading localStorage:', localError);
// // //       }
      
// // //       // 3. Merge both sources, remove duplicates
// // //       const allDesigns = [...apiDesigns, ...localDesigns];
      
// // //       // Remove duplicates based on unique identifier
// // //       const uniqueDesigns = allDesigns.reduce((acc, design) => {
// // //         // Use _id for backend designs, id for local designs
// // //         const designId = design._id || design.id;
// // //         const existing = acc.find(d => (d._id === design._id) || (d.id === design.id));
// // //         if (!existing) {
// // //           acc.push(design);
// // //         }
// // //         return acc;
// // //       }, []);
      
// // //       console.log('Total unique designs:', uniqueDesigns.length);
// // //       setDesigns(uniqueDesigns);
      
// // //       // Set user if not already set
// // //       if (userData && !user) {
// // //         setUser(userData);
// // //       }
      
// // //     } catch (error) {
// // //       console.error('Error fetching designs:', error);
// // //       setError('Failed to load designs');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };
  
// // //   // Fixed delete function
// // //   const handleDeleteDesign = async (design) => {
// // //     if (window.confirm(`Are you sure you want to delete "${design.name}"?`)) {
// // //       setDeletingId(design._id || design.id);
      
// // //       try {
// // //         // Debug: Check what IDs we have
// // //         console.log('Delete attempt - Design info:', {
// // //           _id: design._id,
// // //           id: design.id,
// // //           templateId: design.templateId,
// // //           name: design.name,
// // //           hasMongoId: !!design._id,
// // //           hasLocalId: !!design.id,
// // //           isValidObjectId: isValidObjectId(design._id)
// // //         });

// // //         let deleteSuccess = false;
        
// // //         // Check if this is a backend design (has MongoDB _id)
// // //         if (design._id && isValidObjectId(design._id)) {
// // //           console.log('Attempting to delete from backend with _id:', design._id);
          
// // //           try {
// // //             const res = await fetch(`http://localhost:5000/api/designs/${design._id}`, {
// // //               method: 'DELETE',
// // //               credentials: 'include'
// // //             });
            
// // //             const data = await res.json();
            
// // //             if (res.ok && data.success) {
// // //               console.log('Successfully deleted from backend:', design._id);
// // //               deleteSuccess = true;
// // //             } else {
// // //               console.warn('Backend delete failed:', data?.message || 'Unknown error');
// // //             }
// // //           } catch (backendError) {
// // //             console.error('Backend delete error:', backendError);
// // //           }
// // //         }
        
// // //         // Also delete from localStorage (if it exists there)
// // //         try {
// // //           const saved = localStorage.getItem('savedShoeDesigns');
// // //           if (saved) {
// // //             const designs = JSON.parse(saved);
// // //             const filtered = designs.filter(d => {
// // //               // Remove by id (localStorage) or _id (backend reference)
// // //               return d.id !== design.id && 
// // //                      (!design._id || d._id !== design._id);
// // //             });
// // //             localStorage.setItem('savedShoeDesigns', JSON.stringify(filtered));
// // //             console.log('Removed from localStorage');
            
// // //             // If backend delete wasn't attempted or failed, mark as success
// // //             if (!design._id) {
// // //               deleteSuccess = true;
// // //             }
// // //           }
// // //         } catch (localError) {
// // //           console.warn('LocalStorage delete error:', localError);
// // //         }
        
// // //         // Remove from React state
// // //         setDesigns(prev => prev.filter(d => {
// // //           // Remove by _id (backend) or id (local)
// // //           return (d._id !== design._id) && (d.id !== design.id);
// // //         }));
        
// // //         if (deleteSuccess) {
// // //           alert('Design deleted successfully!');
// // //         } else {
// // //           alert('Design removed from local collection (backend delete may have failed)');
// // //         }
        
// // //       } catch (error) {
// // //         console.error('Error in delete process:', error);
// // //         alert(`Failed to delete design: ${error.message}`);
// // //       } finally {
// // //         setDeletingId(null);
// // //       }
// // //     }
// // //   };

// // //   const handleDownloadImage = (design) => {
// // //     const imageUrl = getDesignImageUrl(design);
    
// // //     if (!imageUrl) {
// // //       alert('No image available to download');
// // //       return;
// // //     }

// // //     try {
// // //       const link = document.createElement('a');
// // //       link.href = imageUrl;
// // //       link.download = `${design.name.replace(/\s+/g, '-')}-design.jpg`;
// // //       document.body.appendChild(link);
// // //       link.click();
// // //       document.body.removeChild(link);
// // //       alert(`"${design.name}" image downloaded!`);
// // //     } catch (error) {
// // //       console.error('Error downloading image:', error);
// // //       alert('Failed to download image');
// // //     }
// // //   };

// // //   const handleGenerateNew = () => {
// // //     navigate('/suggestions');
// // //   };

// // //   const formatDate = (dateString) => {
// // //     if (!dateString) return 'Recently';
// // //     try {
// // //       const date = new Date(dateString);
// // //       if (isNaN(date.getTime())) return 'Recently';
// // //       return date.toLocaleDateString('en-IN', {
// // //         year: 'numeric',
// // //         month: 'short',
// // //         day: 'numeric',
// // //         hour: '2-digit',
// // //         minute: '2-digit'
// // //       });
// // //     } catch {
// // //       return 'Recently';
// // //     }
// // //   };

// // //   // Render image section component
// // //   const DesignImage = ({ design }) => {
// // //     const imageUrl = getDesignImageUrl(design);
    
// // //     return (
// // //       <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative">
// // //         {imageUrl ? (
// // //           <>
// // //             <img
// // //               src={imageUrl}
// // //               alt={design.name}
// // //               className="w-full h-full object-contain"
// // //               onError={(e) => {
// // //                 console.error('Image failed to load:', design.name);
// // //                 e.target.style.display = 'none';
// // //                 const fallback = e.target.nextElementSibling;
// // //                 if (fallback) fallback.style.display = 'flex';
// // //               }}
// // //             />
// // //             <div 
// // //               className="hidden absolute inset-0 flex-col items-center justify-center bg-white"
// // //             >
// // //               <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mb-4">
// // //                 <Heart className="w-10 h-10 text-indigo-500" />
// // //               </div>
// // //               <span className="text-gray-500 font-medium">Image Unavailable</span>
// // //             </div>
// // //           </>
// // //         ) : (
// // //           <div className="flex flex-col items-center justify-center">
// // //             <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mb-4">
// // //               <Heart className="w-10 h-10 text-indigo-500" />
// // //             </div>
// // //             <span className="text-gray-500 font-medium">No Preview</span>
// // //           </div>
// // //         )}
// // //       </div>
// // //     );
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
// // //         <div className="text-center">
// // //           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
// // //           <p className="text-gray-600 text-lg">Loading your designs...</p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
// // //       <div className="max-w-7xl mx-auto">
// // //         {/* Header */}
// // //         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
// // //           <div>
// // //             <button
// // //               onClick={() => navigate('/')}
// // //               className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
// // //             >
// // //               <ArrowLeft className="w-4 h-4" />
// // //               Back to Home
// // //             </button>
// // //             <h1 className="text-4xl font-bold text-gray-900 mb-2">My Saved Designs</h1>
// // //             <p className="text-gray-600">
// // //               {designs.length} design{designs.length !== 1 ? 's' : ''} saved
// // //               {user && <span> by {user.displayName || user.email}</span>}
// // //             </p>
// // //           </div>
// // //           <div className="flex gap-3">
// // //             <button
// // //               onClick={handleGenerateNew}
// // //               className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
// // //             >
// // //               <RefreshCw className="w-4 h-4" />
// // //               Generate New Design
// // //             </button>
// // //             <button
// // //               onClick={fetchDesigns}
// // //               className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
// // //             >
// // //               Refresh
// // //             </button>
// // //           </div>
// // //         </div>

// // //         {/* Error Message */}
// // //         {error && (
// // //           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
// // //             <p className="text-red-700">{error}</p>
// // //           </div>
// // //         )}

// // //         {/* Empty State */}
// // //         {designs.length === 0 ? (
// // //           <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
// // //             <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
// // //               <Heart className="w-12 h-12 text-indigo-500" />
// // //             </div>
// // //             <h2 className="text-2xl font-bold text-gray-900 mb-3">No Saved Designs Yet</h2>
// // //             <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
// // //               Start creating AI-generated shoe designs and save them to your collection!
// // //             </p>
// // //             <button
// // //               onClick={handleGenerateNew}
// // //               className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
// // //             >
// // //               Create Your First Design
// // //             </button>
// // //           </div>
// // //         ) : (
// // //           <>
// // //             {/* Designs Grid */}
// // //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
// // //               {designs.map((design) => {
// // //                 const isDeleting = deletingId === (design._id || design.id);
                
// // //                 return (
// // //                   <div
// // //                     key={design._id || design.id}
// // //                     className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
// // //                   >
// // //                     {/* Design Image */}
// // //                     <DesignImage design={design} />

// // //                     {/* Design Info */}
// // //                     <div className="p-6">
// // //                       <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
// // //                         {design.name}
// // //                       </h3>
                      
// // //                       {design.description && (
// // //                         <p className="text-sm text-gray-600 mb-3 line-clamp-2">
// // //                           {design.description}
// // //                         </p>
// // //                       )}
                      
// // //                       <div className="flex justify-between items-center mb-4">
// // //                         <span className="text-sm text-gray-500">
// // //                           Created {formatDate(design.createdAt)}
// // //                         </span>
// // //                         <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
// // //                           {design.price === 0 ? 'Free' : `$${design.price || 0}`}
// // //                         </span>
// // //                       </div>

// // //                       {/* Debug Info (remove in production) */}
// // //                       <div className="mb-2 text-xs text-gray-400">
// // //                         ID: {design._id ? `Backend: ${design._id.substring(0, 8)}...` : `Local: ${design.id}`}
// // //                       </div>

// // //                       {/* Action Buttons */}
// // //                       <div className="grid grid-cols-3 gap-2">
// // //                         <button
// // //                           onClick={() => handleDownloadImage(design)}
// // //                           disabled={!getDesignImageUrl(design)}
// // //                           className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
// // //                             getDesignImageUrl(design)
// // //                               ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
// // //                               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
// // //                           }`}
// // //                           title={getDesignImageUrl(design) ? 'Download Image' : 'No image available'}
// // //                         >
// // //                           <Download className="w-4 h-4" />
// // //                           <span className="hidden sm:inline">Download</span>
// // //                         </button>
                        
// // //                         <button
// // //                           onClick={() => {
// // //                             // You can implement edit functionality here
// // //                             navigate('/designer', { 
// // //                               state: { editDesign: design } 
// // //                             });
// // //                           }}
// // //                           className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
// // //                         >
// // //                           <Edit className="w-4 h-4" />
// // //                           <span className="hidden sm:inline">Edit</span>
// // //                         </button>
                        
// // //                         <button
// // //                           onClick={() => handleDeleteDesign(design)}
// // //                           disabled={isDeleting}
// // //                           className={`px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1 ${
// // //                             isDeleting ? 'opacity-50 cursor-not-allowed' : ''
// // //                           }`}
// // //                           title="Delete Design"
// // //                         >
// // //                           {isDeleting ? (
// // //                             <span className="animate-spin">⟳</span>
// // //                           ) : (
// // //                             <>
// // //                               <Trash2 className="w-4 h-4" />
// // //                               <span className="hidden sm:inline">Delete</span>
// // //                             </>
// // //                           )}
// // //                         </button>
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                 );
// // //               })}
// // //             </div>

// // //             {/* Statistics */}
// // //             <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
// // //               <h3 className="text-lg font-bold text-gray-900 mb-4">Design Statistics</h3>
// // //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // //                 <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
// // //                   <div className="text-2xl font-bold text-gray-900">{designs.length}</div>
// // //                   <div className="text-sm text-gray-600">Total Designs</div>
// // //                 </div>
// // //                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
// // //                   <div className="text-2xl font-bold text-gray-900">
// // //                     {designs.filter(d => d.price === 0 || !d.price).length}
// // //                   </div>
// // //                   <div className="text-sm text-gray-600">Free Designs</div>
// // //                 </div>
// // //                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
// // //                   <div className="text-2xl font-bold text-gray-900">
// // //                     {new Set(designs.map(d => {
// // //                       try {
// // //                         const date = new Date(d.createdAt);
// // //                         return isNaN(date.getTime()) ? 'unknown' : date.toDateString();
// // //                       } catch {
// // //                         return 'unknown';
// // //                       }
// // //                     }).filter(d => d !== 'unknown')).size}
// // //                   </div>
// // //                   <div className="text-sm text-gray-600">Active Days</div>
// // //                 </div>
// // //               </div>
// // //             </div>

// // //             {/* Call to Action */}
// // //             <div className="text-center">
// // //               <button
// // //                 onClick={handleGenerateNew}
// // //                 className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
// // //               >
// // //                 <RefreshCw className="w-5 h-5" />
// // //                 Generate More Designs
// // //               </button>
// // //             </div>
// // //           </>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default MyDesigns;


// // import React, { useState, useEffect } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import { Download, Trash2, Edit, Heart, RefreshCw, ArrowLeft,ShoppingCart } from 'lucide-react';

// // const MyDesigns = () => {
// //   const [designs, setDesigns] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [user, setUser] = useState(null);
// //   const [error, setError] = useState('');
// //   const [deletingId, setDeletingId] = useState(null);
  
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   // Check for newly saved design from navigation state
// //   useEffect(() => {
// //     if (location.state?.newlySavedDesign) {
// //       console.log('Received newly saved design:', location.state.newlySavedDesign);
      
// //       // Add the new design to the beginning of the list
// //       setDesigns(prev => [location.state.newlySavedDesign, ...prev]);
      
// //       // Clear the navigation state
// //       window.history.replaceState({}, document.title);
// //     }
// //   }, [location.state]);

// //   // Fetch designs from backend API
// //   useEffect(() => {
// //     fetchDesigns();
// //   }, []);

// //   // Helper function to validate MongoDB ObjectId
// //   const isValidObjectId = (id) => {
// //     if (!id) return false;
    
// //     // Handle both string and ObjectId types
// //     const idStr = id.toString ? id.toString() : String(id);
    
// //     // MongoDB ObjectId is 24 hex characters
// //     return idStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(idStr);
// //   };

// //   // Get image URL from design object
// //   const getDesignImageUrl = (design) => {
// //     return design.cloudinaryUrl || design.imageUrl || design.preview || null;
// //   };

// //   // Normalize design ID for consistent comparison
// //   const getDesignId = (design) => {
// //     if (!design) return null;
    
// //     // Handle _id (string or ObjectId)
// //     if (design._id) {
// //       return design._id.toString ? design._id.toString() : String(design._id);
// //     }
    
// //     // Handle id (string or ObjectId)
// //     if (design.id) {
// //       return design.id.toString ? design.id.toString() : String(design.id);
// //     }
    
// //     return null;
// //   };

// //   // Normalize design object for consistent structure
// //   const normalizeDesign = (design) => {
// //     const normalized = { ...design };
    
// //     // Ensure _id and id are strings
// //     if (normalized._id) {
// //       normalized._id = normalized._id.toString ? normalized._id.toString() : String(normalized._id);
// //     }
    
// //     if (normalized.id) {
// //       normalized.id = normalized.id.toString ? normalized.id.toString() : String(normalized.id);
// //     }
    
// //     return normalized;
// //   };

// //   const fetchDesigns = async () => {
// //     try {
// //       const userData = user || JSON.parse(localStorage.getItem('user'));
      
// //       // 1. Try to fetch from backend API
// //       let apiDesigns = [];
// //       if (userData) {
// //         try {
// //           const res = await fetch('http://localhost:5000/api/designs/my-designs', {
// //             credentials: 'include'
// //           });
          
// //           if (res.ok) {
// //             const data = await res.json();
// //             if (data.success) {
// //               // Normalize designs from API
// //               apiDesigns = (data.designs || []).map(normalizeDesign);
// //               console.log('API designs:', apiDesigns.length);
              
// //               // Log design IDs for debugging
// //               apiDesigns.forEach((design, index) => {
// //                 console.log(`API Design ${index}:`, {
// //                   _id: design._id,
// //                   id: design.id,
// //                   name: design.name,
// //                   typeOf_id: typeof design._id,
// //                   typeOfId: typeof design.id
// //                 });
// //               });
// //             }
// //           }
// //         } catch (apiError) {
// //           console.warn('API fetch failed:', apiError.message);
// //         }
// //       }
      
// //       // 2. Get designs from localStorage
// //       let localDesigns = [];
// //       try {
// //         const saved = localStorage.getItem('savedShoeDesigns');
// //         if (saved) {
// //           const parsed = JSON.parse(saved);
// //           // Filter by user if logged in
// //           if (userData) {
// //             localDesigns = parsed.filter(design => 
// //               !design.userId || 
// //               design.userId === userData.id || 
// //               design.userId === userData._id
// //             );
// //           } else {
// //             localDesigns = parsed.filter(design => !design.userId);
// //           }
          
// //           // Normalize local designs
// //           localDesigns = localDesigns.map(normalizeDesign);
// //           console.log('Local designs:', localDesigns.length);
          
// //           // Log design IDs for debugging
// //           localDesigns.forEach((design, index) => {
// //             console.log(`Local Design ${index}:`, {
// //               _id: design._id,
// //               id: design.id,
// //               name: design.name,
// //               typeOf_id: typeof design._id,
// //               typeOfId: typeof design.id
// //             });
// //           });
// //         }
// //       } catch (localError) {
// //         console.error('Error loading localStorage:', localError);
// //       }
      
// //       // 3. Merge both sources, remove duplicates using normalized IDs
// //       const allDesigns = [...apiDesigns, ...localDesigns];
      
// //       // Remove duplicates based on normalized IDs
// //       const uniqueDesigns = [];
// //       const seenIds = new Set();
      
// //       allDesigns.forEach(design => {
// //         const designId = getDesignId(design);
        
// //         if (!designId || !seenIds.has(designId)) {
// //           if (designId) seenIds.add(designId);
// //           uniqueDesigns.push(design);
// //         }
// //       });
      
// //       console.log('Total unique designs:', uniqueDesigns.length);
// //       setDesigns(uniqueDesigns);
      
// //       // Set user if not already set
// //       if (userData && !user) {
// //         setUser(userData);
// //       }
      
// //     } catch (error) {
// //       console.error('Error fetching designs:', error);
// //       setError('Failed to load designs');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   // Fixed delete function
// //   const handleDeleteDesign = async (design) => {
// //     if (window.confirm(`Are you sure you want to delete "${design.name}"?`)) {
// //       const designId = getDesignId(design);
// //       setDeletingId(designId);
      
// //       try {
// //         // Debug: Check what IDs we have
// //         console.log('Delete attempt - Design info:', {
// //           original_id: design._id,
// //           originalId: design.id,
// //           normalizedId: designId,
// //           name: design.name,
// //           isValidObjectId: isValidObjectId(design._id || design.id)
// //         });

// //         let deleteSuccess = false;
// //         const mongoId = design._id || (design.id && isValidObjectId(design.id) ? design.id : null);
        
// //         // Check if this is a backend design (has MongoDB _id)
// //         if (mongoId && isValidObjectId(mongoId)) {
// //           console.log('Attempting to delete from backend with id:', mongoId);
          
// //           try {
// //             const res = await fetch(`http://localhost:5000/api/designs/${mongoId}`, {
// //               method: 'DELETE',
// //               credentials: 'include'
// //             });
            
// //             const data = await res.json();
            
// //             if (res.ok && data.success) {
// //               console.log('Successfully deleted from backend:', mongoId);
// //               deleteSuccess = true;
// //             } else {
// //               console.warn('Backend delete failed:', data?.message || 'Unknown error');
// //             }
// //           } catch (backendError) {
// //             console.error('Backend delete error:', backendError);
// //           }
// //         }
        
// //         // Also delete from localStorage (if it exists there)
// //         try {
// //           const saved = localStorage.getItem('savedShoeDesigns');
// //           if (saved) {
// //             const designs = JSON.parse(saved);
// //             const filtered = designs.filter(d => {
// //               const dId = getDesignId(d);
// //               return dId !== designId;
// //             });
// //             localStorage.setItem('savedShoeDesigns', JSON.stringify(filtered));
// //             console.log('Removed from localStorage');
            
// //             // If backend delete wasn't attempted or failed, mark as success
// //             if (!mongoId) {
// //               deleteSuccess = true;
// //             }
// //           }
// //         } catch (localError) {
// //           console.warn('LocalStorage delete error:', localError);
// //         }
        
// //         // Remove from React state
// //         setDesigns(prev => prev.filter(d => {
// //           const dId = getDesignId(d);
// //           return dId !== designId;
// //         }));
        
// //         if (deleteSuccess) {
// //           alert('Design deleted successfully!');
// //         } else {
// //           alert('Design removed from local collection (backend delete may have failed)');
// //         }
        
// //       } catch (error) {
// //         console.error('Error in delete process:', error);
// //         alert(`Failed to delete design: ${error.message}`);
// //       } finally {
// //         setDeletingId(null);
// //       }
// //     }
// //   };

// //   const handleDownloadImage = (design) => {
// //     const imageUrl = getDesignImageUrl(design);
    
// //     if (!imageUrl) {
// //       alert('No image available to download');
// //       return;
// //     }

// //     try {
// //       const link = document.createElement('a');
// //       link.href = imageUrl;
// //       link.download = `${design.name.replace(/\s+/g, '-')}-design.jpg`;
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //       alert(`"${design.name}" image downloaded!`);
// //     } catch (error) {
// //       console.error('Error downloading image:', error);
// //       alert('Failed to download image');
// //     }
// //   };
// //  // handle cart add 
 
// //  const handleAddToCart = (design) => {
// //   const designId = getDesignId(design);
// //   const item = {
// //     id: designId,
// //     name: design.name,
// //     price: typeof design.price === 'number' ? design.price : 0,
// //     image: getDesignImageUrl(design),
// //   };

// //   try {
// //     const stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
// //     const idx = stored.findIndex(i => i.id === designId);

// //     if (idx === -1) {
// //       stored.push({ ...item, quantity: 1 });
// //       alert('Added to cart!');
// //     } else {
// //       stored[idx].quantity = (stored[idx].quantity || 1) + 1;
// //       alert('Quantity updated in cart!');
// //     }

// //     localStorage.setItem('cartItems', JSON.stringify(stored));
// //   } catch (e) {
// //     console.error('Cart error:', e);
// //     alert('Failed to add to cart');
// //   }
// // };
// //   const handleGenerateNew = () => {
// //     navigate('/suggestions');
// //   };

// //   const formatDate = (dateString) => {
// //     if (!dateString) return 'Recently';
// //     try {
// //       const date = new Date(dateString);
// //       if (isNaN(date.getTime())) return 'Recently';
// //       return date.toLocaleDateString('en-IN', {
// //         year: 'numeric',
// //         month: 'short',
// //         day: 'numeric',
// //         hour: '2-digit',
// //         minute: '2-digit'
// //       });
// //     } catch {
// //       return 'Recently';
// //     }
// //   };

// //   // Render image section component
// //   const DesignImage = ({ design }) => {
// //     const imageUrl = getDesignImageUrl(design);
    
// //     return (
// //       <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative">
// //         {imageUrl ? (
// //           <>
// //             <img
// //               src={imageUrl}
// //               alt={design.name}
// //               className="w-full h-full object-contain"
// //               onError={(e) => {
// //                 console.error('Image failed to load:', design.name);
// //                 e.target.style.display = 'none';
// //                 const fallback = e.target.nextElementSibling;
// //                 if (fallback) fallback.style.display = 'flex';
// //               }}
// //             />
// //             <div 
// //               className="hidden absolute inset-0 flex-col items-center justify-center bg-white"
// //             >
// //               <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mb-4">
// //                 <Heart className="w-10 h-10 text-indigo-500" />
// //               </div>
// //               <span className="text-gray-500 font-medium">Image Unavailable</span>
// //             </div>
// //           </>
// //         ) : (
// //           <div className="flex flex-col items-center justify-center">
// //             <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mb-4">
// //               <Heart className="w-10 h-10 text-indigo-500" />
// //             </div>
// //             <span className="text-gray-500 font-medium">No Preview</span>
// //           </div>
// //         )}
// //       </div>
// //     );
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600 text-lg">Loading your designs...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
// //           <div>
// //             <button
// //               onClick={() => navigate('/')}
// //               className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
// //             >
// //               <ArrowLeft className="w-4 h-4" />
// //               Back to Home
// //             </button>
// //             <h1 className="text-4xl font-bold text-gray-900 mb-2">My Saved Designs</h1>
// //             <p className="text-gray-600">
// //               {designs.length} design{designs.length !== 1 ? 's' : ''} saved
// //               {user && <span> by {user.displayName || user.email}</span>}
// //             </p>
// //           </div>
// //           <div className="flex gap-3">
// //             <button
// //               onClick={handleGenerateNew}
// //               className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
// //             >
// //               <RefreshCw className="w-4 h-4" />
// //               Generate New Design
// //             </button>
// //             <button
// //               onClick={fetchDesigns}
// //               className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
// //             >
// //               Refresh
// //             </button>
// //           </div>
// //         </div>

// //         {/* Error Message */}
// //         {error && (
// //           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
// //             <p className="text-red-700">{error}</p>
// //           </div>
// //         )}

// //         {/* Empty State */}
// //         {designs.length === 0 ? (
// //           <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
// //             <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
// //               <Heart className="w-12 h-12 text-indigo-500" />
// //             </div>
// //             <h2 className="text-2xl font-bold text-gray-900 mb-3">No Saved Designs Yet</h2>
// //             <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
// //               Start creating AI-generated shoe designs and save them to your collection!
// //             </p>
// //             <button
// //               onClick={handleGenerateNew}
// //               className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
// //             >
// //               Create Your First Design
// //             </button>
// //           </div>
// //         ) : (
// //           <>
// //             {/* Designs Grid */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
// //               {designs.map((design) => {
// //                 const designId = getDesignId(design);
// //                 const isDeleting = deletingId === designId;
                
// //                 return (
// //                   <div
// //                     key={designId}
// //                     className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100"
// //                   >
// //                     {/* Design Image */}
// //                     <DesignImage design={design} />

// //                     {/* Design Info */}
// //                     <div className="p-6">
// //                       <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
// //                         {design.name}
// //                       </h3>
                      
// //                       {design.description && (
// //                         <p className="text-sm text-gray-600 mb-3 line-clamp-2">
// //                           {design.description}
// //                         </p>
// //                       )}
                      
// //                       <div className="flex justify-between items-center mb-4">
// //                         <span className="text-sm text-gray-500">
// //                           Created {formatDate(design.createdAt)}
// //                         </span>
// //                         <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
// //                           {design.price === 0 ? 'Free' : `$${design.price || 0}`}
// //                         </span>
// //                       </div>

// //                       {/* Debug Info (remove in production) */}
// //                       <div className="mb-2 text-xs text-gray-400">
// //                         ID: {design._id ? `Backend: ${design._id.substring(0, 8)}...` : `Local: ${designId?.substring(0, 8)}...`}
// //                       </div>

// //                       {/* Action Buttons */}
// //                       {/* <div className="grid grid-cols-3 gap-2">
// //                         <button
// //                           onClick={() => handleDownloadImage(design)}
// //                           disabled={!getDesignImageUrl(design)}
// //                           className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
// //                             getDesignImageUrl(design)
// //                               ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
// //                               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
// //                           }`}
// //                           title={getDesignImageUrl(design) ? 'Download Image' : 'No image available'}
// //                         >
// //                           <Download className="w-4 h-4" />
// //                           <span className="hidden sm:inline">Download</span>
// //                         </button>
                        
// //                         <button
// //                           onClick={() => {
// //                             // You can implement edit functionality here
// //                             navigate('/designer', { 
// //                               state: { editDesign: design } 
// //                             });
// //                           }}
// //                           className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
// //                         >
// //                           <Edit className="w-4 h-4" />
// //                           <span className="hidden sm:inline">Edit</span>
// //                         </button>
                        
// //                         <button
// //                           onClick={() => handleDeleteDesign(design)}
// //                           disabled={isDeleting}
// //                           className={`px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1 ${
// //                             isDeleting ? 'opacity-50 cursor-not-allowed' : ''
// //                           }`}
// //                           title="Delete Design"
// //                         >
// //                           {isDeleting ? (
// //                             <span className="animate-spin">⟳</span>
// //                           ) : (
// //                             <>
// //                               <Trash2 className="w-4 h-4" />
// //                               <span className="hidden sm:inline">Delete</span>
// //                             </>
// //                           )}
// //                         </button>
// //                       </div> */}
// //                       <div className="grid grid-cols-4 gap-2">
// //   <button
// //     onClick={() => handleDownloadImage(design)}
// //     disabled={!getDesignImageUrl(design)}
// //     className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
// //       getDesignImageUrl(design)
// //         ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
// //         : 'bg-gray-100 text-gray-400 cursor-not-allowed'
// //     }`}
// //     title={getDesignImageUrl(design) ? 'Download Image' : 'No image available'}
// //   >
// //     <Download className="w-4 h-4" />
// //     <span className="hidden sm:inline">Download</span>
// //   </button>

// //   <button
// //     onClick={() => {
// //       navigate('/designer', { state: { editDesign: design } });
// //     }}
// //     className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
// //   >
// //     <Edit className="w-4 h-4" />
// //     <span className="hidden sm:inline">Edit</span>
// //   </button>

// //   <button
// //     onClick={() => handleDeleteDesign(design)}
// //     disabled={isDeleting}
// //     className={`px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1 ${
// //       isDeleting ? 'opacity-50 cursor-not-allowed' : ''
// //     }`}
// //     title="Delete Design"
// //   >
// //     {isDeleting ? (
// //       <span className="animate-spin">⟳</span>
// //     ) : (
// //       <>
// //         <Trash2 className="w-4 h-4" />
// //         <span className="hidden sm:inline">Delete</span>
// //       </>
// //     )}
// //   </button>

// //   <button
// //     onClick={() => handleAddToCart(design)}
// //     className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 flex items-center justify-center gap-1"
// //     title="Add to Cart"
// //   >
// //     <ShoppingCart className="w-4 h-4" />
// //     <span className="hidden sm:inline">Add to Cart</span>
// //   </button>
// // </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //             </div>

// //             {/* Statistics */}
// //             <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
// //               <h3 className="text-lg font-bold text-gray-900 mb-4">Design Statistics</h3>
// //               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                 <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
// //                   <div className="text-2xl font-bold text-gray-900">{designs.length}</div>
// //                   <div className="text-sm text-gray-600">Total Designs</div>
// //                 </div>
// //                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
// //                   <div className="text-2xl font-bold text-gray-900">
// //                     {designs.filter(d => d.price === 0 || !d.price).length}
// //                   </div>
// //                   <div className="text-sm text-gray-600">Free Designs</div>
// //                 </div>
// //                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
// //                   <div className="text-2xl font-bold text-gray-900">
// //                     {new Set(designs.map(d => {
// //                       try {
// //                         const date = new Date(d.createdAt);
// //                         return isNaN(date.getTime()) ? 'unknown' : date.toDateString();
// //                       } catch {
// //                         return 'unknown';
// //                       }
// //                     }).filter(d => d !== 'unknown')).size}
// //                   </div>
// //                   <div className="text-sm text-gray-600">Active Days</div>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Call to Action */}
// //             <div className="text-center">
// //               <button
// //                 onClick={handleGenerateNew}
// //                 className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
// //               >
// //                 <RefreshCw className="w-5 h-5" />
// //                 Generate More Designs
// //               </button>
// //             </div>
// //           </>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default MyDesigns;





// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Download, Trash2, Edit, Heart, RefreshCw, ArrowLeft, ShoppingCart, Check, Plus, Minus, IndianRupee } from 'lucide-react';

// const MyDesigns = () => {
//   const [designs, setDesigns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState('');
//   const [deletingId, setDeletingId] = useState(null);
//   const [cartItems, setCartItems] = useState([]);
//   const [addingToCart, setAddingToCart] = useState({});
//   const [showCartNotification, setShowCartNotification] = useState(false);
//   const [cartNotification, setCartNotification] = useState({});
  
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Load cart items from localStorage on component mount
//   useEffect(() => {
//     const savedCart = localStorage.getItem('cartItems');
//     if (savedCart) {
//       try {
//         const parsedCart = JSON.parse(savedCart);
//         setCartItems(parsedCart);
//       } catch (error) {
//         console.error('Error loading cart:', error);
//       }
//     }
//   }, []);

//   // Save cart items to localStorage whenever cart changes
//   useEffect(() => {
//     localStorage.setItem('cartItems', JSON.stringify(cartItems));
//   }, [cartItems]);

//   // Check for newly saved design from navigation state
//   useEffect(() => {
//     if (location.state?.newlySavedDesign) {
//       console.log('Received newly saved design:', location.state.newlySavedDesign);
      
//       // Add the new design to the beginning of the list
//       setDesigns(prev => [location.state.newlySavedDesign, ...prev]);
      
//       // Clear the navigation state
//       window.history.replaceState({}, document.title);
//     }
//   }, [location.state]);

//   // Fetch designs from backend API
//   useEffect(() => {
//     fetchDesigns();
//   }, []);

//   // Helper function to validate MongoDB ObjectId
//   const isValidObjectId = (id) => {
//     if (!id) return false;
    
//     // Handle both string and ObjectId types
//     const idStr = id.toString ? id.toString() : String(id);
    
//     // MongoDB ObjectId is 24 hex characters
//     return idStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(idStr);
//   };

//   // Get image URL from design object
//   const getDesignImageUrl = (design) => {
//     return design.cloudinaryUrl || design.imageUrl || design.preview || null;
//   };

//   // Normalize design ID for consistent comparison - SINGLE DEFINITION
//   const getDesignId = (design) => {
//     if (!design) return null;
    
//     // Handle _id (string or ObjectId)
//     if (design._id) {
//       return design._id.toString ? design._id.toString() : String(design._id);
//     }
    
//     // Handle id (string or ObjectId)
//     if (design.id) {
//       return design.id.toString ? design.id.toString() : String(design.id);
//     }
    
//     // Fallback if missing
//     return `${(design.name || 'design').replace(/\s+/g, '-')}-${design.templateId || 'tpl'}-${design.createdAt || Date.now()}`;
//   };

//   // Generate random price in Indian Rupees (₹500 to ₹3000)
//   const generateRandomPrice = (design) => {
//     // If design already has a price, use it (convert to INR if in dollars)
//     if (design.price) {
//       if (design.price < 100) {
//         // Assume it's in dollars, convert to INR (1 USD = 83 INR)
//         return Math.round(design.price * 83);
//       }
//       return design.price;
//     }
    
//     // Generate random price between ₹500 and ₹3000
//     const basePrice = Math.floor(Math.random() * 2500) + 500; // 500-3000
//     return basePrice;
//   };

//   // Format price in Indian Rupees
//   const formatPrice = (price) => {
//     return `₹${price.toLocaleString('en-IN')}`;
//   };

//   // Normalize design object for consistent structure
//   const normalizeDesign = (design) => {
//     const normalized = { ...design };
    
//     // Ensure _id and id are strings
//     if (normalized._id) {
//       normalized._id = normalized._id.toString ? normalized._id.toString() : String(normalized._id);
//     }
    
//     if (normalized.id) {
//       normalized.id = normalized.id.toString ? normalized.id.toString() : String(normalized.id);
//     }
    
//     // Ensure design has a price in INR
//     if (!normalized.price || normalized.price < 100) {
//       normalized.price = generateRandomPrice(normalized);
//     }
    
//     return normalized;
//   };

//   const fetchDesigns = async () => {
//     try {
//       const userData = user || JSON.parse(localStorage.getItem('user'));
      
//       // 1. Try to fetch from backend API
//       let apiDesigns = [];
//       if (userData) {
//         try {
//           const res = await fetch('http://localhost:5000/api/designs/my-designs', {
//             credentials: 'include'
//           });
          
//           if (res.ok) {
//             const data = await res.json();
//             if (data.success) {
//               // Normalize designs from API
//               apiDesigns = (data.designs || []).map(normalizeDesign);
//               console.log('API designs:', apiDesigns.length);
              
//               // Log design IDs for debugging
//               apiDesigns.forEach((design, index) => {
//                 console.log(`API Design ${index}:`, {
//                   _id: design._id,
//                   id: design.id,
//                   name: design.name,
//                   price: design.price,
//                   typeOf_id: typeof design._id,
//                   typeOfId: typeof design.id
//                 });
//               });
//             }
//           }
//         } catch (apiError) {
//           console.warn('API fetch failed:', apiError.message);
//         }
//       }
      
//       // 2. Get designs from localStorage
//       let localDesigns = [];
//       try {
//         const saved = localStorage.getItem('savedShoeDesigns');
//         if (saved) {
//           const parsed = JSON.parse(saved);
//           // Filter by user if logged in
//           if (userData) {
//             localDesigns = parsed.filter(design => 
//               !design.userId || 
//               design.userId === userData.id || 
//               design.userId === userData._id
//             );
//           } else {
//             localDesigns = parsed.filter(design => !design.userId);
//           }
          
//           // Normalize local designs
//           localDesigns = localDesigns.map(normalizeDesign);
//           console.log('Local designs:', localDesigns.length);
          
//           // Log design IDs for debugging
//           localDesigns.forEach((design, index) => {
//             console.log(`Local Design ${index}:`, {
//               _id: design._id,
//               id: design.id,
//               name: design.name,
//               price: design.price,
//               typeOf_id: typeof design._id,
//               typeOfId: typeof design.id
//             });
//           });
//         }
//       } catch (localError) {
//         console.error('Error loading localStorage:', localError);
//       }
      
//       // 3. Merge both sources, remove duplicates using normalized IDs
//       const allDesigns = [...apiDesigns, ...localDesigns];
      
//       // Remove duplicates based on normalized IDs
//       const uniqueDesigns = [];
//       const seenIds = new Set();
      
//       allDesigns.forEach(design => {
//         const designId = getDesignId(design);
        
//         if (!designId || !seenIds.has(designId)) {
//           if (designId) seenIds.add(designId);
//           uniqueDesigns.push(design);
//         }
//       });
      
//       console.log('Total unique designs:', uniqueDesigns.length);
//       setDesigns(uniqueDesigns);
      
//       // Set user if not already set
//       if (userData && !user) {
//         setUser(userData);
//       }
      
//     } catch (error) {
//       console.error('Error fetching designs:', error);
//       setError('Failed to load designs');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Check if a design is already in cart
//   const isInCart = (designId) => {
//     return cartItems.some(item => item.id === designId);
//   };

//   // Get cart quantity for a design
//   const getCartQuantity = (designId) => {
//     const item = cartItems.find(item => item.id === designId);
//     return item ? item.quantity : 0;
//   };

//   // Show cart notification
//   const showNotification = (message, type = 'success') => {
//     setCartNotification({ message, type });
//     setShowCartNotification(true);
    
//     setTimeout(() => {
//       setShowCartNotification(false);
//     }, 3000);
//   };

//   // Handle add to cart with quantity management
//   const handleAddToCart = (design) => {
//     const designId = getDesignId(design);
//     if (!designId) {
//       showNotification('Cannot add to cart: Design ID missing', 'error');
//       return;
//     }

//     // Generate price if not already set
//     const price = design.price || generateRandomPrice(design);
    
//     const item = {
//       id: designId,
//       name: design.name,
//       price: price,
//       image: getDesignImageUrl(design),
//       designData: design,
//       createdAt: new Date().toISOString()
//     };

//     // Set loading state for this specific design
//     setAddingToCart(prev => ({ ...prev, [designId]: true }));

//     try {
//       const stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
//       const existingIndex = stored.findIndex(i => i.id === designId);

//       if (existingIndex === -1) {
//         // Add new item
//         stored.push({ ...item, quantity: 1 });
//         setCartItems(stored);
//         localStorage.setItem('cartItems', JSON.stringify(stored));
//         showNotification(`"${design.name}" added to cart for ${formatPrice(price)}!`, 'success');
//       } else {
//         // Update quantity
//         stored[existingIndex].quantity = (stored[existingIndex].quantity || 1) + 1;
//         setCartItems(stored);
//         localStorage.setItem('cartItems', JSON.stringify(stored));
//         showNotification(`"${design.name}" quantity updated to ${stored[existingIndex].quantity}`, 'success');
//       }
//     } catch (e) {
//       console.error('Cart error:', e);
//       showNotification('Failed to add to cart', 'error');
//     } finally {
//       // Clear loading state
//       setTimeout(() => {
//         setAddingToCart(prev => ({ ...prev, [designId]: false }));
//       }, 500);
//     }
//   };

//   // Handle remove from cart
//   const handleRemoveFromCart = (design) => {
//     const designId = getDesignId(design);
//     if (!designId) return;

//     try {
//       const stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
//       const filtered = stored.filter(item => item.id !== designId);
      
//       setCartItems(filtered);
//       localStorage.setItem('cartItems', JSON.stringify(filtered));
//       showNotification(`"${design.name}" removed from cart!`, 'success');
//     } catch (e) {
//       console.error('Cart remove error:', e);
//       showNotification('Failed to remove from cart', 'error');
//     }
//   };

//   // Handle adjust quantity
//   const handleAdjustQuantity = (design, newQuantity) => {
//     const designId = getDesignId(design);
//     if (!designId || newQuantity < 0) return;

//     try {
//       const stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
//       const index = stored.findIndex(item => item.id === designId);

//       if (index !== -1) {
//         if (newQuantity === 0) {
//           // Remove item if quantity is 0
//           stored.splice(index, 1);
//         } else {
//           // Update quantity
//           stored[index].quantity = newQuantity;
//         }
        
//         setCartItems(stored);
//         localStorage.setItem('cartItems', JSON.stringify(stored));
        
//         if (newQuantity === 0) {
//           showNotification(`"${design.name}" removed from cart!`, 'success');
//         } else {
//           showNotification(`"${design.name}" quantity updated to ${newQuantity}`, 'success');
//         }
//       }
//     } catch (e) {
//       console.error('Cart quantity error:', e);
//       showNotification('Failed to update quantity', 'error');
//     }
//   };

//   // View cart
//   const handleViewCart = () => {
//     navigate('/cart');
//   };
  
//   // Fixed delete function
//   const handleDeleteDesign = async (design) => {
//     if (window.confirm(`Are you sure you want to delete "${design.name}"?`)) {
//       const designId = getDesignId(design);
//       setDeletingId(designId);
      
//       try {
//         // Debug: Check what IDs we have
//         console.log('Delete attempt - Design info:', {
//           original_id: design._id,
//           originalId: design.id,
//           normalizedId: designId,
//           name: design.name,
//           isValidObjectId: isValidObjectId(design._id || design.id)
//         });

//         let deleteSuccess = false;
//         const mongoId = design._id || (design.id && isValidObjectId(design.id) ? design.id : null);
        
//         // Check if this is a backend design (has MongoDB _id)
//         if (mongoId && isValidObjectId(mongoId)) {
//           console.log('Attempting to delete from backend with id:', mongoId);
          
//           try {
//             const res = await fetch(`http://localhost:5000/api/designs/${mongoId}`, {
//               method: 'DELETE',
//               credentials: 'include'
//             });
            
//             const data = await res.json();
            
//             if (res.ok && data.success) {
//               console.log('Successfully deleted from backend:', mongoId);
//               deleteSuccess = true;
//             } else {
//               console.warn('Backend delete failed:', data?.message || 'Unknown error');
//             }
//           } catch (backendError) {
//             console.error('Backend delete error:', backendError);
//           }
//         }
        
//         // Also delete from localStorage (if it exists there)
//         try {
//           const saved = localStorage.getItem('savedShoeDesigns');
//           if (saved) {
//             const designs = JSON.parse(saved);
//             const filtered = designs.filter(d => {
//               const dId = getDesignId(d);
//               return dId !== designId;
//             });
//             localStorage.setItem('savedShoeDesigns', JSON.stringify(filtered));
//             console.log('Removed from localStorage');
            
//             // If backend delete wasn't attempted or failed, mark as success
//             if (!mongoId) {
//               deleteSuccess = true;
//             }
//           }
//         } catch (localError) {
//           console.warn('LocalStorage delete error:', localError);
//         }
        
//         // Also remove from cart if it exists there
//         if (isInCart(designId)) {
//           handleRemoveFromCart(design);
//         }
        
//         // Remove from React state
//         setDesigns(prev => prev.filter(d => {
//           const dId = getDesignId(d);
//           return dId !== designId;
//         }));
        
//         if (deleteSuccess) {
//           alert('Design deleted successfully!');
//         } else {
//           alert('Design removed from local collection (backend delete may have failed)');
//         }
        
//       } catch (error) {
//         console.error('Error in delete process:', error);
//         alert(`Failed to delete design: ${error.message}`);
//       } finally {
//         setDeletingId(null);
//       }
//     }
//   };

//   const handleDownloadImage = (design) => {
//     const imageUrl = getDesignImageUrl(design);
    
//     if (!imageUrl) {
//       alert('No image available to download');
//       return;
//     }

//     try {
//       const link = document.createElement('a');
//       link.href = imageUrl;
//       link.download = `${design.name.replace(/\s+/g, '-')}-design.jpg`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       alert(`"${design.name}" image downloaded!`);
//     } catch (error) {
//       console.error('Error downloading image:', error);
//       alert('Failed to download image');
//     }
//   };

//   const handleGenerateNew = () => {
//     navigate('/suggestions');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Recently';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'Recently';
//       return date.toLocaleDateString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch {
//       return 'Recently';
//     }
//   };

//   // Calculate cart summary in INR
//   const cartSummary = {
//     totalItems: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
//     totalPrice: cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0),
//     freeItems: cartItems.filter(item => (item.price || 0) === 0).length,
//     uniqueItems: cartItems.length
//   };

//   // Format cart summary price
//   const formattedCartTotal = formatPrice(cartSummary.totalPrice);

//   // Render image section component
//   const DesignImage = ({ design }) => {
//     const imageUrl = getDesignImageUrl(design);
    
//     return (
//       <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative">
//         {imageUrl ? (
//           <>
//             <img
//               src={imageUrl}
//               alt={design.name}
//               className="w-full h-full object-contain"
//               onError={(e) => {
//                 console.error('Image failed to load:', design.name);
//                 e.target.style.display = 'none';
//                 const fallback = e.target.nextElementSibling;
//                 if (fallback) fallback.style.display = 'flex';
//               }}
//             />
//             <div 
//               className="hidden absolute inset-0 flex-col items-center justify-center bg-white"
//             >
//               <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mb-4">
//                 <Heart className="w-10 h-10 text-indigo-500" />
//               </div>
//               <span className="text-gray-500 font-medium">Image Unavailable</span>
//             </div>
//           </>
//         ) : (
//           <div className="flex flex-col items-center justify-center">
//             <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mb-4">
//               <Heart className="w-10 h-10 text-indigo-500" />
//             </div>
//             <span className="text-gray-500 font-medium">No Preview</span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg">Loading your designs...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Cart Notification */}
//         {showCartNotification && (
//           <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn ${
//             cartNotification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
//           }`}>
//             {cartNotification.type === 'success' ? (
//               <Check className="w-5 h-5" />
//             ) : (
//               <AlertCircle className="w-5 h-5" />
//             )}
//             <span className="font-medium">{cartNotification.message}</span>
//           </div>
//         )}

//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <div>
//             <button
//               onClick={() => navigate('/')}
//               className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back to Home
//             </button>
//             <h1 className="text-4xl font-bold text-gray-900 mb-2">My Saved Designs</h1>
//             <p className="text-gray-600">
//               {designs.length} design{designs.length !== 1 ? 's' : ''} saved
//               {user && <span> by {user.displayName || user.email}</span>}
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3">
//             {/* Cart Summary Button */}
//             {cartItems.length > 0 && (
//               <button
//                 onClick={handleViewCart}
//                 className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center gap-2 shadow-lg"
//               >
//                 <ShoppingCart className="w-4 h-4" />
//                 View Cart ({cartSummary.totalItems})
//                 <span className="ml-2 px-2 py-1 bg-white/20 rounded text-xs">
//                   {formattedCartTotal}
//                 </span>
//               </button>
//             )}
//             <button
//               onClick={handleGenerateNew}
//               className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Generate New Design
//             </button>
//             <button
//               onClick={fetchDesigns}
//               className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
//             >
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-700">{error}</p>
//           </div>
//         )}

//         {/* Cart Summary Banner */}
//         {cartItems.length > 0 && (
//           <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                 <ShoppingCart className="w-5 h-5 text-green-600" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-green-900">Your Shopping Cart</h3>
//                 <p className="text-sm text-green-700">
//                   {cartSummary.totalItems} item{cartSummary.totalItems !== 1 ? 's' : ''} • 
//                   {cartSummary.freeItems > 0 && ` ${cartSummary.freeItems} free`} • 
//                   Total: {formattedCartTotal}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={handleViewCart}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
//             >
//               <ShoppingCart className="w-4 h-4" />
//               Proceed to Checkout
//             </button>
//           </div>
//         )}

//         {/* Empty State */}
//         {designs.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
//             <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Heart className="w-12 h-12 text-indigo-500" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-3">No Saved Designs Yet</h2>
//             <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
//               Start creating AI-generated shoe designs and save them to your collection!
//             </p>
//             <button
//               onClick={handleGenerateNew}
//               className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
//             >
//               Create Your First Design
//             </button>
//           </div>
//         ) : (
//           <>
//             {/* Designs Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               {designs.map((design) => {
//                 const designId = getDesignId(design);
//                 const isDeleting = deletingId === designId;
//                 const isAddingToCart = addingToCart[designId];
//                 const inCart = isInCart(designId);
//                 const cartQuantity = getCartQuantity(designId);
//                 const price = design.price || generateRandomPrice(design);
//                 const formattedPrice = formatPrice(price);
                
//                 return (
//                   <div
//                     key={designId}
//                     className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 group relative"
//                   >
//                     {/* Design Image */}
//                     <DesignImage design={design} />

//                     {/* Price Badge */}
//                     <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
//                       <IndianRupee className="w-3 h-3" />
//                       {formattedPrice}
//                     </div>

//                     {/* Cart Badge */}
//                     {inCart && (
//                       <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg z-10">
//                         <Check className="w-3 h-3" />
//                         In Cart ({cartQuantity})
//                       </div>
//                     )}

//                     {/* Design Info */}
//                     <div className="p-6">
//                       <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
//                         {design.name}
//                       </h3>
                      
//                       {design.description && (
//                         <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//                           {design.description}
//                         </p>
//                       )}
                      
//                       <div className="flex justify-between items-center mb-4">
//                         <span className="text-sm text-gray-500">
//                           Created {formatDate(design.createdAt)}
//                         </span>
//                         <span className="text-sm font-medium text-amber-600 flex items-center gap-1">
//                           <IndianRupee className="w-3 h-3" />
//                           {formattedPrice}
//                         </span>
//                       </div>

//                       {/* Action Buttons */}
//                       <div className="grid grid-cols-4 gap-2">
//                         <button
//                           onClick={() => handleDownloadImage(design)}
//                           disabled={!getDesignImageUrl(design)}
//                           className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
//                             getDesignImageUrl(design)
//                               ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
//                               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                           }`}
//                           title={getDesignImageUrl(design) ? 'Download Image' : 'No image available'}
//                         >
//                           <Download className="w-4 h-4" />
//                           <span className="hidden sm:inline">Download</span>
//                         </button>
                        
//                         <button
//                           onClick={() => {
//                             navigate('/designer', { 
//                               state: { editDesign: design } 
//                             });
//                           }}
//                           className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
//                           title="Edit Design"
//                         >
//                           <Edit className="w-4 h-4" />
//                           <span className="hidden sm:inline">Edit</span>
//                         </button>
                        
//                         {inCart ? (
//                           <div className="col-span-2 flex items-center">
//                             <button
//                               onClick={() => handleAdjustQuantity(design, cartQuantity - 1)}
//                               className="px-3 py-2 bg-red-50 text-red-700 rounded-l-lg hover:bg-red-100"
//                               title="Decrease Quantity"
//                             >
//                               <Minus className="w-4 h-4" />
//                             </button>
//                             <div className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium flex-1 text-center">
//                               {cartQuantity} in cart
//                             </div>
//                             <button
//                               onClick={() => handleAdjustQuantity(design, cartQuantity + 1)}
//                               className="px-3 py-2 bg-green-50 text-green-700 rounded-r-lg hover:bg-green-100"
//                               title="Increase Quantity"
//                             >
//                               <Plus className="w-4 h-4" />
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             onClick={() => handleAddToCart(design)}
//                             disabled={isAddingToCart}
//                             className={`col-span-2 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
//                               isAddingToCart 
//                                 ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
//                                 : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
//                             }`}
//                             title="Add to Cart"
//                           >
//                             {isAddingToCart ? (
//                               <span className="animate-spin">⟳</span>
//                             ) : (
//                               <>
//                                 <ShoppingCart className="w-4 h-4" />
//                                 <span>Add to Cart</span>
//                               </>
//                             )}
//                           </button>
//                         )}
                        
//                         <button
//                           onClick={() => handleDeleteDesign(design)}
//                           disabled={isDeleting}
//                           className="col-span-4 mt-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
//                           title="Delete Design"
//                         >
//                           {isDeleting ? (
//                             <span className="animate-spin">⟳</span>
//                           ) : (
//                             <>
//                               <Trash2 className="w-4 h-4" />
//                               <span>Delete Design</span>
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Statistics */}
//             <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
//               <h3 className="text-lg font-bold text-gray-900 mb-4">Design Statistics</h3>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
//                   <div className="text-2xl font-bold text-gray-900">{designs.length}</div>
//                   <div className="text-sm text-gray-600">Total Designs</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
//                   <div className="text-2xl font-bold text-gray-900">{cartSummary.totalItems}</div>
//                   <div className="text-sm text-gray-600">Items in Cart</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
//                   <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
//                     <IndianRupee className="w-5 h-5" />
//                     {cartSummary.totalPrice.toLocaleString('en-IN')}
//                   </div>
//                   <div className="text-sm text-gray-600">Cart Value</div>
//                 </div>
//                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg">
//                   <div className="text-2xl font-bold text-gray-900">
//                     {new Set(designs.map(d => {
//                       try {
//                         const date = new Date(d.createdAt);
//                         return isNaN(date.getTime()) ? 'unknown' : date.toDateString();
//                       } catch {
//                         return 'unknown';
//                       }
//                     }).filter(d => d !== 'unknown')).size}
//                   </div>
//                   <div className="text-sm text-gray-600">Active Days</div>
//                 </div>
//               </div>
//             </div>

//             {/* Call to Action */}
//             <div className="text-center space-y-4">
//               {cartItems.length > 0 && (
//                 <div className="mb-4">
//                   <button
//                     onClick={handleViewCart}
//                     className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
//                   >
//                     <ShoppingCart className="w-5 h-5" />
//                     Proceed to Checkout ({cartSummary.totalItems} items)
//                     <span className="ml-2 px-3 py-1 bg-white/20 rounded text-sm">
//                       {formattedCartTotal}
//                     </span>
//                   </button>
//                   <p className="text-gray-600 text-sm mt-2">
//                     Total: {formattedCartTotal} • {cartSummary.freeItems} free item{cartSummary.freeItems !== 1 ? 's' : ''}
//                   </p>
//                 </div>
//               )}
              
//               <button
//                 onClick={handleGenerateNew}
//                 className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
//               >
//                 <RefreshCw className="w-5 h-5" />
//                 Generate More Designs
//               </button>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Add CSS for slide-in animation */}
//       <style jsx>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slideIn {
//           animation: slideIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// // Add AlertCircle component since it's used but not imported
// const AlertCircle = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );

// export default MyDesigns;


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, Trash2, Edit, Heart, RefreshCw, ArrowLeft, ShoppingCart, Check, Plus, Minus, IndianRupee } from 'lucide-react';
import { useCart } from '../contexts/CartContext'; // Import your cart context

const MyDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [cartNotification, setCartNotification] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use cart context
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity,
    getCartTotal,
    getCartItemCount
  } = useCart();

  // Check for newly saved design from navigation state
  useEffect(() => {
    if (location.state?.newlySavedDesign) {
      console.log('Received newly saved design:', location.state.newlySavedDesign);
      
      // Add the new design to the beginning of the list
      setDesigns(prev => [location.state.newlySavedDesign, ...prev]);
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch designs from backend API
  useEffect(() => {
    fetchDesigns();
  }, []);

  // Helper function to validate MongoDB ObjectId
  const isValidObjectId = (id) => {
    if (!id) return false;
    
    const idStr = id.toString ? id.toString() : String(id);
    return idStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(idStr);
  };

  // Get image URL from design object
  const getDesignImageUrl = (design) => {
    return design.cloudinaryUrl || design.imageUrl || design.preview || null;
  };

  // Normalize design ID for consistent comparison
  const getDesignId = (design) => {
    if (!design) return null;
    
    // Handle _id (string or ObjectId)
    if (design._id) {
      return design._id.toString ? design._id.toString() : String(design._id);
    }
    
    // Handle id (string or ObjectId)
    if (design.id) {
      return design.id.toString ? design.id.toString() : String(design.id);
    }
    
    // Fallback if missing
    return `${(design.name || 'design').replace(/\s+/g, '-')}-${design.templateId || 'tpl'}-${design.createdAt || Date.now()}`;
  };

  // Generate random price in Indian Rupees (₹500 to ₹3000)
  const generateRandomPrice = (design) => {
    if (design.price) {
      if (design.price < 100) {
        // Assume it's in dollars, convert to INR (1 USD = 83 INR)
        return Math.round(design.price * 83);
      }
      return design.price;
    }
    
    // Generate random price between ₹500 and ₹3000
    return Math.floor(Math.random() * 2500) + 500;
  };

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Normalize design object for consistent structure
  const normalizeDesign = (design) => {
    const normalized = { ...design };
    
    // Ensure _id and id are strings
    if (normalized._id) {
      normalized._id = normalized._id.toString ? normalized._id.toString() : String(normalized._id);
    }
    
    if (normalized.id) {
      normalized.id = normalized.id.toString ? normalized.id.toString() : String(normalized.id);
    }
    
    // Ensure design has a price in INR
    if (!normalized.price || normalized.price < 100) {
      normalized.price = generateRandomPrice(normalized);
    }
    
    return normalized;
  };

  const fetchDesigns = async () => {
    try {
      const userData = user || JSON.parse(localStorage.getItem('user'));
      
      // 1. Try to fetch from backend API
      let apiDesigns = [];
      if (userData) {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/designs/my-designs`, {
            credentials: 'include'
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              apiDesigns = (data.designs || []).map(normalizeDesign);
            }
          }
        } catch (apiError) {
          console.warn('API fetch failed:', apiError.message);
        }
      }
      
      // 2. Get designs from localStorage
      let localDesigns = [];
      try {
        const saved = localStorage.getItem('savedShoeDesigns');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (userData) {
            localDesigns = parsed.filter(design => 
              !design.userId || 
              design.userId === userData.id || 
              design.userId === userData._id
            );
          } else {
            localDesigns = parsed.filter(design => !design.userId);
          }
          
          localDesigns = localDesigns.map(normalizeDesign);
        }
      } catch (localError) {
        console.error('Error loading localStorage:', localError);
      }
      
      // 3. Merge both sources, remove duplicates
      const allDesigns = [...apiDesigns, ...localDesigns];
      const uniqueDesigns = [];
      const seenIds = new Set();
      
      allDesigns.forEach(design => {
        const designId = getDesignId(design);
        
        if (!designId || !seenIds.has(designId)) {
          if (designId) seenIds.add(designId);
          uniqueDesigns.push(design);
        }
      });
      
      setDesigns(uniqueDesigns);
      
      if (userData && !user) {
        setUser(userData);
      }
      
    } catch (error) {
      console.error('Error fetching designs:', error);
      setError('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if a design is already in cart
  const isInCart = (designId) => {
    return cartItems.some(item => item.id === designId);
  };

  // Get cart quantity for a design
  const getCartQuantity = (designId) => {
    const item = cartItems.find(item => item.id === designId);
    return item ? item.quantity : 0;
  };

  // Show cart notification
  const showNotification = (message, type = 'success') => {
    setCartNotification({ message, type });
    setShowCartNotification(true);
    
    setTimeout(() => {
      setShowCartNotification(false);
    }, 3000);
  };

  // Handle add to cart using cart context
  const handleAddToCart = (design) => {
    const designId = getDesignId(design);
    if (!designId) {
      showNotification('Cannot add to cart: Design ID missing', 'error');
      return;
    }

    // Generate price if not already set
    const price = design.price || generateRandomPrice(design);
    
    // Prepare cart item
    const cartItem = {
      id: designId,
      name: design.name,
      price: price,
      image: getDesignImageUrl(design),
      designData: design,
      type: "saved-design",
      userId: user?.id || user?._id || null,
      createdAt: new Date().toISOString()
    };

    // Set loading state for this specific design
    setAddingToCart(prev => ({ ...prev, [designId]: true }));

    try {
      // Use cart context to add item
      addToCart(cartItem);
      showNotification(`"${design.name}" added to cart for ${formatPrice(price)}!`, 'success');
    } catch (e) {
      console.error('Cart error:', e);
      showNotification('Failed to add to cart', 'error');
    } finally {
      // Clear loading state
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [designId]: false }));
      }, 500);
    }
  };

  // Handle remove from cart using cart context
  const handleRemoveFromCart = (design) => {
    const designId = getDesignId(design);
    if (!designId) return;

    try {
      removeFromCart(designId);
      showNotification(`"${design.name}" removed from cart!`, 'success');
    } catch (e) {
      console.error('Cart remove error:', e);
      showNotification('Failed to remove from cart', 'error');
    }
  };

  // Handle adjust quantity using cart context
  const handleAdjustQuantity = (design, newQuantity) => {
    const designId = getDesignId(design);
    if (!designId || newQuantity < 0) return;

    try {
      updateQuantity(designId, newQuantity);
      
      if (newQuantity === 0) {
        showNotification(`"${design.name}" removed from cart!`, 'success');
      } else {
        showNotification(`"${design.name}" quantity updated to ${newQuantity}`, 'success');
      }
    } catch (e) {
      console.error('Cart quantity error:', e);
      showNotification('Failed to update quantity', 'error');
    }
  };

  // View cart
  const handleViewCart = () => {
    navigate('/cart');
  };
  
  // Delete function
  const handleDeleteDesign = async (design) => {
    if (window.confirm(`Are you sure you want to delete "${design.name}"?`)) {
      const designId = getDesignId(design);
      setDeletingId(designId);
      
      try {
        // Debug: Check what IDs we have
        console.log('Delete attempt - Design info:', {
          original_id: design._id,
          originalId: design.id,
          normalizedId: designId,
          name: design.name,
          isValidObjectId: isValidObjectId(design._id || design.id)
        });

        let deleteSuccess = false;
        const mongoId = design._id || (design.id && isValidObjectId(design.id) ? design.id : null);
        
        // Check if this is a backend design (has MongoDB _id)
        if (mongoId && isValidObjectId(mongoId)) {
          console.log('Attempting to delete from backend with id:', mongoId);
          
          try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/designs/${mongoId}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
              console.log('Successfully deleted from backend:', mongoId);
              deleteSuccess = true;
            } else {
              console.warn('Backend delete failed:', data?.message || 'Unknown error');
            }
          } catch (backendError) {
            console.error('Backend delete error:', backendError);
          }
        }
        
        // Also delete from localStorage (if it exists there)
        try {
          const saved = localStorage.getItem('savedShoeDesigns');
          if (saved) {
            const designs = JSON.parse(saved);
            const filtered = designs.filter(d => {
              const dId = getDesignId(d);
              return dId !== designId;
            });
            localStorage.setItem('savedShoeDesigns', JSON.stringify(filtered));
            console.log('Removed from localStorage');
            
            if (!mongoId) {
              deleteSuccess = true;
            }
          }
        } catch (localError) {
          console.warn('LocalStorage delete error:', localError);
        }
        
        // Also remove from cart if it exists there
        if (isInCart(designId)) {
          handleRemoveFromCart(design);
        }
        
        // Remove from React state
        setDesigns(prev => prev.filter(d => {
          const dId = getDesignId(d);
          return dId !== designId;
        }));
        
        if (deleteSuccess) {
          alert('Design deleted successfully!');
        } else {
          alert('Design removed from local collection (backend delete may have failed)');
        }
        
      } catch (error) {
        console.error('Error in delete process:', error);
        alert(`Failed to delete design: ${error.message}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDownloadImage = (design) => {
    const imageUrl = getDesignImageUrl(design);
    
    if (!imageUrl) {
      alert('No image available to download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${design.name.replace(/\s+/g, '-')}-design.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`"${design.name}" image downloaded!`);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const handleGenerateNew = () => {
    navigate('/suggestions');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  // Calculate cart summary using context functions
  const cartSummary = {
    totalItems: getCartItemCount(),
    totalPrice: getCartTotal(),
    uniqueItems: cartItems.length
  };

  // Format cart summary price
  const formattedCartTotal = formatPrice(cartSummary.totalPrice);

  // Render image section component
  const DesignImage = ({ design }) => {
    const imageUrl = getDesignImageUrl(design);
    
    return (
      <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={design.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('Image failed to load:', design.name);
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden absolute inset-0 flex-col items-center justify-center bg-white">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-indigo-500" />
              </div>
              <span className="text-gray-500 font-medium">Image Unavailable</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-indigo-500" />
            </div>
            <span className="text-gray-500 font-medium">No Preview</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Cart Notification */}
        {showCartNotification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn ${
            cartNotification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {cartNotification.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{cartNotification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Saved Designs</h1>
            <p className="text-gray-600">
              {designs.length} design{designs.length !== 1 ? 's' : ''} saved
              {user && <span> by {user.displayName || user.email}</span>}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Cart Summary Button */}
            {cartItems.length > 0 && (
              <button
                onClick={handleViewCart}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                View Cart ({cartSummary.totalItems})
                <span className="ml-2 px-2 py-1 bg-white/20 rounded text-xs">
                  {formattedCartTotal}
                </span>
              </button>
            )}
            <button
              onClick={handleGenerateNew}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Generate New Design
            </button>
            <button
              onClick={fetchDesigns}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Cart Summary Banner */}
        {cartItems.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Your Shopping Cart</h3>
                <p className="text-sm text-green-700">
                  {cartSummary.totalItems} item{cartSummary.totalItems !== 1 ? 's' : ''} • 
                  Total: {formattedCartTotal}
                </p>
              </div>
            </div>
            <button
              onClick={handleViewCart}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Proceed to Checkout
            </button>
          </div>
        )}

        {/* Empty State */}
        {designs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Saved Designs Yet</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Start creating AI-generated shoe designs and save them to your collection!
            </p>
            <button
              onClick={handleGenerateNew}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
            >
              Create Your First Design
            </button>
          </div>
        ) : (
          <>
            {/* Designs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {designs.map((design) => {
                const designId = getDesignId(design);
                const isDeleting = deletingId === designId;
                const isAddingToCart = addingToCart[designId];
                const inCart = isInCart(designId);
                const cartQuantity = getCartQuantity(designId);
                const price = design.price || generateRandomPrice(design);
                const formattedPrice = formatPrice(price);
                
                return (
                  <div
                    key={designId}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 group relative"
                  >
                    {/* Design Image */}
                    <DesignImage design={design} />

                    {/* Price Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                      <IndianRupee className="w-3 h-3" />
                      {formattedPrice}
                    </div>

                    {/* Cart Badge */}
                    {inCart && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg z-10">
                        <Check className="w-3 h-3" />
                        In Cart ({cartQuantity})
                      </div>
                    )}

                    {/* Design Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {design.name}
                      </h3>
                      
                      {design.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {design.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">
                          Created {formatDate(design.createdAt)}
                        </span>
                        <span className="text-sm font-medium text-amber-600 flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          {formattedPrice}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => handleDownloadImage(design)}
                          disabled={!getDesignImageUrl(design)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                            getDesignImageUrl(design)
                              ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={getDesignImageUrl(design) ? 'Download Image' : 'No image available'}
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            navigate('/designer', { 
                              state: { editDesign: design } 
                            });
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                          title="Edit Design"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        
                        {inCart ? (
                          <div className="col-span-2 flex items-center">
                            <button
                              onClick={() => handleAdjustQuantity(design, cartQuantity - 1)}
                              className="px-3 py-2 bg-red-50 text-red-700 rounded-l-lg hover:bg-red-100"
                              title="Decrease Quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium flex-1 text-center">
                              {cartQuantity} in cart
                            </div>
                            <button
                              onClick={() => handleAdjustQuantity(design, cartQuantity + 1)}
                              className="px-3 py-2 bg-green-50 text-green-700 rounded-r-lg hover:bg-green-100"
                              title="Increase Quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(design)}
                            disabled={isAddingToCart}
                            className={`col-span-2 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                              isAddingToCart 
                                ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                            }`}
                            title="Add to Cart"
                          >
                            {isAddingToCart ? (
                              <span className="animate-spin">⟳</span>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteDesign(design)}
                          disabled={isDeleting}
                          className="col-span-4 mt-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                          title="Delete Design"
                        >
                          {isDeleting ? (
                            <span className="animate-spin">⟳</span>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Design</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Design Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{designs.length}</div>
                  <div className="text-sm text-gray-600">Total Designs</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{cartSummary.totalItems}</div>
                  <div className="text-sm text-gray-600">Items in Cart</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {cartSummary.totalPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-600">Cart Value</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(designs.map(d => {
                      try {
                        const date = new Date(d.createdAt);
                        return isNaN(date.getTime()) ? 'unknown' : date.toDateString();
                      } catch {
                        return 'unknown';
                      }
                    }).filter(d => d !== 'unknown')).size}
                  </div>
                  <div className="text-sm text-gray-600">Active Days</div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-4">
              {cartItems.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={handleViewCart}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Proceed to Checkout ({cartSummary.totalItems} items)
                    <span className="ml-2 px-3 py-1 bg-white/20 rounded text-sm">
                      {formattedCartTotal}
                    </span>
                  </button>
                </div>
              )}
              
              <button
                onClick={handleGenerateNew}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Generate More Designs
              </button>
            </div>
          </>
        )}
      </div>

      {/* Add CSS for slide-in animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Add AlertCircle component
const AlertCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default MyDesigns;