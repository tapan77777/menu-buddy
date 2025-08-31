'use client';

import QRCodeStyling from 'qr-code-styling';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

// ENHANCED THEME STYLES
const themeStyles = {
  classic: { /* ... unchanged ... */ },
  funky: { /* ... unchanged ... */ },
  elegant: { /* ... unchanged ... */ },
  branded: { /* ... unchanged ... */ }
};

const StyledQR = forwardRef(({ 
  url, 
  restaurantName, 
  theme = 'classic', 
  brandStyle = 'integrated',
  logoImage,
  size = 280,
  errorCorrectionLevel = 'M',
  margin = 10
}, ref) => {
  const qrRef = useRef(null);
  const qrInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Responsive size based on screen width
  const getResponsiveSize = () => {
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth < 480) return Math.min(size, 240);
      if (screenWidth < 768) return Math.min(size, 280);
      return size;
    }
    return size;
  };

  // ✅ Wrap generateQR in useCallback so it's stable
  const generateQR = useCallback(async () => {
    if (!qrRef.current || !url) return;

    setIsLoading(true);
    setError(null);

    try {
      qrRef.current.innerHTML = '';

      const currentTheme = themeStyles[theme] || themeStyles.classic;
      
      // Apply brand style modifications
      let dotsOptions = { ...currentTheme.dotsOptions };
      let backgroundOptions = { ...currentTheme.backgroundOptions };
      
      if (brandStyle === 'integrated') {
        dotsOptions.gradient = currentTheme.dotsOptions.gradient;
        backgroundOptions.gradient = currentTheme.backgroundOptions.gradient;
      } else if (brandStyle === 'overlay') {
        dotsOptions = { ...dotsOptions, gradient: undefined };
      }

      const qrOptions = {
        width: getResponsiveSize(),
        height: getResponsiveSize(),
        data: url,
        margin: margin,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: errorCorrectionLevel
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: logoImage ? 0.3 : 0,
          crossOrigin: 'anonymous',
          margin: 6
        },
        dotsOptions,
        cornersSquareOptions: currentTheme.cornersSquareOptions,
        cornersDotOptions: currentTheme.cornersDotOptions,
        backgroundOptions
      };

      if (logoImage) {
        qrOptions.image = logoImage;
      }

      qrInstance.current = new QRCodeStyling(qrOptions);

      await new Promise((resolve, reject) => {
        try {
          qrInstance.current.append(qrRef.current);
          setTimeout(() => {
            const canvas = qrRef.current?.querySelector('canvas');
            if (canvas) resolve();
            else reject(new Error('Failed to generate QR code canvas'));
          }, 100);
        } catch (err) {
          reject(err);
        }
      });

    } catch (err) {
      console.error('QR generation failed:', err);
      setError('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  }, [url, theme, brandStyle, logoImage, size, errorCorrectionLevel, margin,getResponsiveSize]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    download: (filename) => {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return false;
      try {
        const pngUrl = canvas.toDataURL('image/png', 1.0);
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = filename || 'qr-code.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        return true;
      } catch (error) {
        console.error('Download failed:', error);
        return false;
      }
    },
    getCanvas: () => qrRef.current?.querySelector('canvas'),
    regenerate: () => generateQR()
  }));

  // ✅ Cleaned useEffect
  useEffect(() => {
    generateQR();
    const node = qrRef.current;
    return () => {
      if (node) node.innerHTML = "";
    };
  }, [generateQR]);

  const getThemeDisplayName = (themeName) => {
    const themeNames = {
      classic: 'Professional Classic',
      funky: 'Vibrant Funky',
      elegant: 'Sophisticated Elegant',
      branded: 'Corporate Branded'
    };
    return themeNames[themeName] || themeName;
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 font-medium">Error generating QR code</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={generateQR}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center max-w-full">
      {/* Restaurant Name Header */}
      <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          {restaurantName}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 px-2">
          Scan to view our digital menu • {getThemeDisplayName(theme)}
        </p>
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="relative inline-block max-w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl z-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
              <span className="text-gray-600 text-sm font-medium">Creating branded QR...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={qrRef} 
          className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100 transition-all duration-300 max-w-full overflow-hidden hover:shadow-2xl"
          style={{ 
            opacity: isLoading ? 0.5 : 1,
            background: brandStyle === 'integrated' 
              ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              : '#ffffff'
          }}
        />
        
        {/* Brand badge */}
        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
          Branded
        </div>
      </div>

      {/* QR Code Info */}
      <div className="mt-4 sm:mt-6 text-xs text-gray-500 max-w-full px-2">
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 text-left">
          <p className="text-center mb-3 text-sm font-medium text-gray-700">
            📱 Point your camera to scan
          </p>
          <div className="bg-white p-3 rounded-lg border border-gray-100">
            <p className="break-all text-xs font-mono text-gray-600">
              {url}
            </p>
          </div>
        </div>
      </div>

      {/* Print-friendly styling */}
      <style jsx>{`
        @media print {
          .text-gray-600,
          .text-gray-500 {
            color: #000 !important;
          }
          .bg-gray-50 {
            background-color: #f9f9f9 !important;
          }
          .shadow-xl,
          .shadow-lg {
            box-shadow: none !important;
          }
        }
        
        canvas {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
});

StyledQR.displayName = 'StyledQR';
export default StyledQR;
