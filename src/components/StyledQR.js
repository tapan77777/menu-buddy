'use client';

import QRCodeStyling from 'qr-code-styling';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const themeStyles = {
  classic: {
    dotsOptions: { color: '#000000', type: 'square' },
    cornersSquareOptions: { type: 'square', color: '#000000' },
    cornersDotOptions: { type: 'square', color: '#000000' },
    backgroundOptions: { color: '#ffffff' }
  },
  funky: {
    dotsOptions: { 
      color: '#E91E63', 
      type: 'dots',
      gradient: {
        type: 'linear',
        rotation: 45,
        colorStops: [
          { offset: 0, color: '#E91E63' },
          { offset: 1, color: '#8E24AA' }
        ]
      }
    },
    cornersSquareOptions: { type: 'extra-rounded', color: '#8E24AA' },
    cornersDotOptions: { type: 'dot', color: '#E91E63' },
    backgroundOptions: { color: '#FCE4EC' }
  },
  elegant: {
    dotsOptions: { 
      color: '#2E3A59', 
      type: 'rounded',
      gradient: {
        type: 'linear',
        rotation: 0,
        colorStops: [
          { offset: 0, color: '#2E3A59' },
          { offset: 1, color: '#37474F' }
        ]
      }
    },
    cornersSquareOptions: { type: 'dot', color: '#37474F' },
    cornersDotOptions: { type: 'dot', color: '#2E3A59' },
    backgroundOptions: { color: '#ECEFF1' }
  },
  branded: {
    dotsOptions: { 
      color: '#2196F3', 
      type: 'classy',
      gradient: {
        type: 'radial',
        colorStops: [
          { offset: 0, color: '#2196F3' },
          { offset: 1, color: '#1565C0' }
        ]
      }
    },
    cornersSquareOptions: { type: 'extra-rounded', color: '#1565C0' },
    cornersDotOptions: { type: 'dot', color: '#2196F3' },
    backgroundOptions: { color: '#E3F2FD' }
  }
};

const StyledQR = forwardRef(({ 
  url, 
  restaurantName, 
  theme = 'classic', 
  logoImage,
  size = 280, // Reduced default size for mobile
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
      if (screenWidth < 480) return Math.min(size, 240); // Small phones
      if (screenWidth < 768) return Math.min(size, 280); // Tablets
      return size;
    }
    return size;
  };

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

  const generateQR = async () => {
    if (!qrRef.current || !url) return;

    setIsLoading(true);
    setError(null);

    try {
      // Clear previous QR code
      qrRef.current.innerHTML = '';

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
          imageSize: 0.4,
          crossOrigin: 'anonymous',
          margin: 8
        },
        dotsOptions: themeStyles[theme]?.dotsOptions || themeStyles.classic.dotsOptions,
        cornersSquareOptions: themeStyles[theme]?.cornersSquareOptions || themeStyles.classic.cornersSquareOptions,
        cornersDotOptions: themeStyles[theme]?.cornersDotOptions || themeStyles.classic.cornersDotOptions,
        backgroundOptions: themeStyles[theme]?.backgroundOptions || themeStyles.classic.backgroundOptions
      };

      // Add logo if provided
      if (logoImage) {
        qrOptions.image = logoImage;
      }

      qrInstance.current = new QRCodeStyling(qrOptions);

      // Wait for QR code to be generated
      await new Promise((resolve, reject) => {
        try {
          qrInstance.current.append(qrRef.current);
          // Small delay to ensure rendering is complete
          setTimeout(() => {
            const canvas = qrRef.current?.querySelector('canvas');
            if (canvas) {
              resolve();
            } else {
              reject(new Error('Failed to generate QR code canvas'));
            }
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
  };

  useEffect(() => {
    generateQR();

    // Cleanup function
    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, [url, theme, logoImage, size, errorCorrectionLevel, margin]);

  const getThemeDisplayName = (themeName) => {
    const themeNames = {
      classic: 'Classic',
      funky: 'Funky',
      elegant: 'Elegant',
      branded: 'Branded'
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
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          {restaurantName}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 px-2">
          Scan to view our menu • {getThemeDisplayName(theme)} Theme
        </p>
      </div>

      {/* QR Code Container */}
      <div className="relative inline-block max-w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg z-10">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 text-xs sm:text-sm">Generating QR code...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={qrRef} 
          className="bg-white p-3 sm:p-4 rounded-xl shadow-lg border-2 border-gray-100 transition-opacity duration-300 max-w-full overflow-hidden"
          style={{ opacity: isLoading ? 0.5 : 1 }}
        />
      </div>

      {/* QR Code Info */}
      <div className="mt-3 sm:mt-4 text-xs text-gray-500 max-w-full px-2">
        <p className="mb-1 sm:mb-2">Point your camera at the QR code to scan</p>
        <div className="bg-gray-50 p-2 sm:p-3 rounded border text-left">
          <p className="break-all text-xs sm:text-sm font-mono">
            {url}
          </p>
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
        }
        
        /* Ensure QR code canvas is responsive */
        canvas {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
    </div>
  );
});

StyledQR.displayName = 'StyledQR';

export default StyledQR;