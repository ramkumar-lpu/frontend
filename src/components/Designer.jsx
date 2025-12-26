import React, { useState, Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Stage,
  PerspectiveCamera,
  Html,
  useProgress,
} from "@react-three/drei";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

// Preload the model from jsDelivr CDN (free GitHub-backed CDN)
const MODEL_URL = "https://cdn.jsdelivr.net/gh/ramkumar-lpu/shoe-assets@main/nikeShoes.glb";
useGLTF.preload(MODEL_URL);

// Lightweight Loader
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-64 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-black h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em]">
          Loading {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

// Simple fallback shape if GLB fails
function FallbackShoe({ colors }) {
  const group = useRef();
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.getElapsedTime() / 4) * 0.2;
    }
  });

  return (
    <group ref={group} position={[0, -0.3, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.8, 0.8, 3]} />
        <meshStandardMaterial color={colors.body} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.25, 0]} castShadow>
        <boxGeometry args={[2, 0.25, 3.2]} />
        <meshStandardMaterial color={colors.sole} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.7, -0.5]} castShadow>
        <boxGeometry args={[0.3, 0.1, 1.5]} />
        <meshStandardMaterial color={colors.laces} roughness={0.8} />
      </mesh>
      <mesh position={[0.9, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={colors.logo} roughness={0.3} metalness={0.5} />
      </mesh>
      <Html position={[0, 1.4, 0]} center>
        <div className="bg-amber-100 border border-amber-400 text-amber-800 px-3 py-1 rounded-lg text-[11px] font-bold">
          ⚠ Preview Mode
        </div>
      </Html>
    </group>
  );
}

// 3D Model
function ShoeModel({ colors, onModelReady }) {
  const group = useRef();
  const gltf = useGLTF(MODEL_URL);
  const scene = gltf?.scene;
  const materials = gltf?.materials ?? {};

  useFrame((state) => {
    if (group.current && scene) {
      group.current.rotation.y = Math.sin(state.clock.getElapsedTime() / 4) * 0.1;
    }
  });

  useEffect(() => {
    if (!scene) {
      onModelReady?.(false);
      return;
    }
    // Wait a bit for the scene to fully render
    const timer = setTimeout(() => {
      onModelReady?.(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [scene, onModelReady]);

  useEffect(() => {
    if (!scene || !materials) return;
    try {
      Object.entries(materials).forEach(([name, mat]) => {
        if (!mat?.isMaterial) return;
        const key = name.toLowerCase();
        if (key.includes("logo")) mat.color.set(colors.logo);
        else if (key.includes("sole")) mat.color.set(colors.sole);
        else if (key.includes("lace")) mat.color.set(colors.laces);
        else mat.color.set(colors.body);
        mat.needsUpdate = true;
      });
    } catch (err) {
      console.warn("Material update failed:", err);
    }
  }, [colors, materials, scene]);

  if (!scene) return <FallbackShoe colors={colors} />;

  return (
    <group ref={group} scale={1.2} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Image compression function
const compressImage = (base64Image, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max 800px width)
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Fill with white background for transparent images
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG
      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        console.log(`Compressed image: ${base64Image.length} -> ${compressed.length} bytes`);
        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = base64Image;
  });
};

function ShoeConfigurator({ user }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [activePart, setActivePart] = useState("body");
  const [colors, setColors] = useState({
    body: "#FFFFFF",
    sole: "#E60012",
    laces: "#1A1A1A",
    logo: "#1A1A1A",
  });
  const [designName, setDesignName] = useState("");
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [is3DReady, setIs3DReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const parts = [
    { id: "body", label: "Body", icon: "👟" },
    { id: "sole", label: "Sole", icon: "⬛" },
    { id: "laces", label: "Laces", icon: "🧵" },
    { id: "logo", label: "Logo", icon: "✓" },
  ];

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Load saved designs
  useEffect(() => {
    const saved = localStorage.getItem("savedShoeDesigns");
    if (saved) {
      try {
        setSavedDesigns(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved designs:", e);
      }
    }
  }, []);

  const updateColor = useCallback(
    (newColor) => {
      const hex = /^#[0-9A-F]{6}$/i;
      if (hex.test(newColor)) {
        setColors((prev) => ({ ...prev, [activePart]: newColor }));
      }
    },
    [activePart]
  );

  // Function to capture preview with proper timing
  const captureDesignPreview = () => {
    return new Promise((resolve) => {
      // Give the canvas time to render
      setTimeout(() => {
        const canvas = document.querySelector("canvas");
        if (canvas) {
          try {
            const imageData = canvas.toDataURL("image/jpeg", 0.85);
            console.log("Preview captured successfully:", imageData.substring(0, 50) + "...");
            resolve(imageData);
          } catch (error) {
            console.error("Error capturing canvas:", error);
            resolve(null);
          }
        } else {
          console.warn("Canvas not found");
          resolve(null);
        }
      }, 500); // Increased delay for better rendering
    });
  };

  // Handle saving design
 const handleSaveDesign = async () => {
  if (!designName.trim()) {
    showToast("Please enter a design name", 'error');
    return;
  }

  if (!is3DReady) {
    showToast("Please wait for the 3D model to load", 'error');
    return;
  }

  setSaving(true);

  try {
    // Capture preview
    let preview = await captureDesignPreview();
    console.log("Original preview size:", preview?.length || 0);
    
    // Compress the image if it's too large
    if (preview && preview.length > 50000) { // If > 50KB
      try {
        preview = await compressImage(preview, 0.6);
        console.log("Compressed preview size:", preview.length);
      } catch (error) {
        console.error("Image compression failed:", error);
        // Continue with uncompressed image
      }
    }

    // Create design ID
    const designId = Date.now();
    
    // Create design object
    const newDesign = {
      id: designId,
      name: designName.trim(),
      colors: { ...colors },
      createdAt: new Date().toISOString(),
      userId: user?.id || user?._id || null,
      preview: preview,
    };

    // 1. Save to localStorage (for offline/fallback)
    const updatedLocal = [...savedDesigns, newDesign];
    setSavedDesigns(updatedLocal);
    localStorage.setItem("savedShoeDesigns", JSON.stringify(updatedLocal));
    
    let backendSuccess = false;
    let backendDesignId = null;
    
    // 2. Save to backend API (if user is logged in)
    if (user) {
      console.log('Sending to backend:', {
        name: designName.trim(),
        imageUrlLength: preview?.length || 0,
        user: user.id || user._id
      });

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/designs`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            name: designName.trim(),
            description: `Custom 3D design: ${Object.entries(colors).map(([part, color]) => `${part}: ${color}`).join(', ')}`,
            imageUrl: preview || '',
            templateId: designId,
            price: 0,
            customization: {
              colors: colors,
              type: '3d-custom',
              parts: Object.keys(colors),
              hasFullPreview: !!preview,
              previewLength: preview?.length || 0
            }
          }),
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          console.log('Design saved to backend successfully:', data.design._id);
          backendSuccess = true;
          backendDesignId = data.design._id;
          
          // Update localStorage design with MongoDB _id for reference
          newDesign._id = data.design._id;
          const updatedWithId = updatedLocal.map(d => 
            d.id === designId ? { ...d, _id: data.design._id } : d
          );
          localStorage.setItem("savedShoeDesigns", JSON.stringify(updatedWithId));
          setSavedDesigns(updatedWithId);
        } else {
          console.warn('Backend save failed:', data.message);
        }
      } catch (error) {
        console.error('Error saving to backend:', error);
      }
    }
    
    // Show appropriate message
    if (backendSuccess) {
      showToast("Design saved successfully! Redirecting...", 'success');
    } else if (user) {
      showToast("Design saved locally (backend error)", 'warning');
    } else {
      showToast("Design saved locally. Login to sync with cloud.", 'info');
    }
    
    // Reset form
    setDesignName("");
    
    // Pass the design data to My Designs page via URL state
    setTimeout(() => {
      navigate('/my-designs', { 
        state: { 
          newlySavedDesign: newDesign,
          source: 'designer',
          timestamp: Date.now()
        }
      });
    }, 1500);
    
  } catch (error) {
    console.error("Error in save process:", error);
    showToast("Failed to save design", 'error');
  } finally {
    setSaving(false);
  }
};
//  handle add to cart 
  const handleAddToCart = async () => {
    if (!designName.trim()) {
      showToast("Please enter a design name", 'error');
      return;
    }

    if (!is3DReady) {
      showToast("Please wait for the 3D model to load", 'error');
      return;
    }

    try {
      // Capture preview
      const preview = await captureDesignPreview();
      console.log("Adding to cart with preview:", !!preview);

      const design = {
        id: Date.now(),
        name: designName.trim(),
        colors: { ...colors },
        preview: preview,
        price: 129.99,
        quantity: 1,
        type: "custom-design",
        userId: user?.id || user?._id || null,
        createdAt: new Date().toISOString(),
      };

      addToCart(design);
      showToast("Added to cart!", 'success');
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Failed to add to cart", 'error');
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      showToast("Unable to capture design", 'error');
      return;
    }
    try {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `custom-shoe-${Date.now()}.png`;
      link.href = image;
      link.click();
      showToast("Image downloaded!", 'success');
    } catch {
      showToast("Failed to download image", 'error');
    }
  };

  const handleReset = () => {
    setColors({
      body: "#FFFFFF",
      sole: "#E60012",
      laces: "#1A1A1A",
      logo: "#1A1A1A",
    });
    setDesignName("");
    showToast("Design reset", 'info');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notifications */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-600' : 
          toast.type === 'error' ? 'bg-red-600' : 
          toast.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        }`}>
          <p className="text-white font-medium">
            {toast.type === 'success' ? '✓' : 
             toast.type === 'error' ? '⚠' : 
             toast.type === 'warning' ? '⚠' : 'ℹ'} {toast.message}
          </p>
        </div>
      )}

      {/* 3D View */}
      <section className="w-full lg:w-2/3 h-[55vh] lg:h-screen bg-gray-100 relative">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }}
          onCreated={({ gl }) => gl.setClearColor("#e8e8e8")}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
          <Suspense fallback={<Loader />}>
            <Stage environment="city" intensity={0.6} contactShadow shadows>
              <ShoeModel colors={colors} onModelReady={setIs3DReady} />
            </Stage>
          </Suspense>
          <OrbitControls enableZoom minDistance={2} maxDistance={8} enablePan={false} />
        </Canvas>

        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <p className="text-xs font-bold text-gray-700">
            {is3DReady ? "✓ 3D Model Ready" : "⏳ Loading..."}
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="w-full lg:w-1/3 bg-white flex flex-col max-h-[45vh] lg:max-h-screen shadow-2xl">
        <div className="p-6 lg:p-8 overflow-y-auto flex-grow">
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Customize</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Design your signature look
              </p>
            </div>
            <Link
              to="/my-designs"
              className="text-[10px] font-bold uppercase tracking-widest border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition"
            >
              My Designs
               {/* ({savedDesigns.length}) */}
            </Link>
          </header>

          {/* Design Name */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Design Name
            </label>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              maxLength={50}
            />
          </div>

          {/* Parts */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {parts.map((part) => (
              <button
                key={part.id}
                onClick={() => setActivePart(part.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  activePart === part.id
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400"
                }`}
              >
                <span>{part.icon}</span>
                <div
                  className="w-4 h-4 rounded-full border border-current"
                  style={{ backgroundColor: colors[part.id] }}
                />
                <span className="text-[11px] font-bold uppercase tracking-tight">
                  {part.label}
                </span>
              </button>
            ))}
          </div>

          {/* Color Picker */}
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-3">
              Color for {parts.find((p) => p.id === activePart)?.label}
            </label>
            <input
              type="color"
              value={colors[activePart]}
              onChange={(e) => updateColor(e.target.value)}
              className="w-full h-16 rounded-xl cursor-pointer border-4 border-white shadow-lg mb-4"
            />
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border-2 border-gray-200">
              <span className="text-gray-600 font-bold">#</span>
              <input
                type="text"
                value={colors[activePart].replace("#", "")}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9A-Fa-f]/g, "");
                  if (value.length <= 6) updateColor(`#${value.padEnd(6, "0")}`);
                }}
                placeholder="FFFFFF"
                className="flex-1 px-2 py-2 text-sm uppercase focus:outline-none font-mono"
                maxLength={6}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 bg-white flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSaveDesign}
              disabled={!is3DReady || saving}
              className={`py-3 text-[11px] font-bold uppercase tracking-widest border-2 border-black rounded-full transition flex items-center justify-center ${
                is3DReady && !saving
                  ? "hover:bg-gray-100 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Saving...
                </>
              ) : (
                '💾 Save'
              )}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!is3DReady}
              className={`py-3 text-[11px] font-bold uppercase tracking-widest bg-black text-white rounded-full transition ${
                is3DReady
                  ? "hover:bg-gray-800 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              🛒 Add to Cart
            </button>
          </div>
          <button
            onClick={handleDownload}
            disabled={!is3DReady}
            className={`w-full py-3 text-[11px] font-bold uppercase tracking-widest border-2 border-black rounded-full transition ${
              is3DReady
                ? "hover:bg-black hover:text-white cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            📥 Download
          </button>
          <button
            onClick={handleReset}
            className="w-full py-3 text-[11px] font-bold uppercase tracking-widest border border-gray-300 rounded-full hover:bg-gray-50 transition"
          >
            🔄 Reset
          </button>
          
          {/* Quick Navigation */}
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/suggestions')}
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                🎨 AI Designs
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
              >
                🛒 View Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShoeConfigurator;