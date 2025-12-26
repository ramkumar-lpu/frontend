import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FacebookShareButton,
  TwitterShareButton,
  PinterestShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  PinterestIcon,
  WhatsappIcon,
} from 'react-share';

const SocialShare = ({ design }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareUrl = window.location.href;
  const title = design ? `Check out my custom ${design.name} design!` : 'Design amazing shoes with ShoeCraftify!';
  const image = design ? `/api/design-image/${design.id}` : '/og-image.jpg';

  const sharePlatforms = [
    {
      name: 'Facebook',
      component: FacebookShareButton,
      icon: FacebookIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      component: TwitterShareButton,
      icon: TwitterIcon,
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'Pinterest',
      component: PinterestShareButton,
      icon: PinterestIcon,
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      name: 'WhatsApp',
      component: WhatsappShareButton,
      icon: WhatsappIcon,
      color: 'bg-green-500 hover:bg-green-600'
    },
  ];

  const downloadDesignImage = async () => {
    // Capture design image
    const canvas = document.createElement('canvas');
    // ... render design to canvas
    const image = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = image;
    link.download = `${design?.name || 'design'}.png`;
    link.click();
  };

  const generateEmbedCode = () => {
    return `<iframe src="${window.location.origin}/embed/design/${design?.id}" width="400" height="300" frameborder="0"></iframe>`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
      >
        📤 Share
      </button>

      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 right-0 w-64 bg-white rounded-2xl shadow-2xl p-4 z-50"
          >
            <h4 className="font-bold text-gray-900 mb-3">Share Design</h4>
            
            {/* Social Platforms */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {sharePlatforms.map((platform) => {
                const ShareButton = platform.component;
                const ShareIcon = platform.icon;
                
                return (
                  <ShareButton
                    key={platform.name}
                    url={shareUrl}
                    title={title}
                    media={image}
                    className={`w-full p-3 rounded-lg ${platform.color} text-white flex flex-col items-center`}
                  >
                    <ShareIcon size={24} round={false} />
                    <span className="text-xs mt-1">{platform.name}</span>
                  </ShareButton>
                );
              })}
            </div>

            {/* Additional Options */}
            <div className="space-y-2">
              <button
                onClick={downloadDesignImage}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center"
              >
                <span className="mr-2">📥</span>
                Download Image
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert('Link copied!');
                }}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center"
              >
                <span className="mr-2">🔗</span>
                Copy Link
              </button>
              
              {design && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateEmbedCode());
                    alert('Embed code copied!');
                  }}
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center"
                >
                  <span className="mr-2">📺</span>
                  Embed Code
                </button>
              )}
            </div>

            {/* QR Code for sharing */}
            <div className="mt-4 pt-4 border-t text-center">
              <div className="text-sm text-gray-600 mb-2">Scan to view:</div>
              {/* Add QR code generator here */}
              <div className="w-32 h-32 bg-gray-200 mx-auto rounded flex items-center justify-center">
                QR Code
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialShare;